const EventEmitter = require('events');
import * as Types from './kafkaInterface';

class CascadeProducer extends EventEmitter {
  producer: Types.ProducerInterface;
  dlqCB: Types.RouteCallback;
  retryTopics: string[];
  paused: boolean;
  pausedQueue: Types.KafkaConsumerMessageInterface[]; // maybe linked list
  retryOptions: {timeout?: number[], batchLimit: number};
  timeout: number[] = [];
  batch: Types.KafkaProducerMessageInterface[] = [];
  batchLimit: number[] = [];
  sendStorage = {};

  // pass in kafka interface
  constructor(kafka: Types.KafkaInterface, dlqCB: Types.RouteCallback) {
    super();
    this.dlqCB = dlqCB;
    this.retryTopics = [];
    this.producer = kafka.producer();
    this.paused = false;
    this.pausedQueue = [];
  }

  connect(): Promise<any> {
    return this.producer.connect();
  }

  disconnect(): Promise<any> {
    return this.producer.disconnect();
  }

  pause() {
    this.paused = true;
  }

  resume(): Promise<any> {
    this.paused = false;
    // declare array to store promises
    const resumePromises = [];
    while(this.pausedQueue.length) {
      // push promise into promise array
      resumePromises.push(this.send(this.pausedQueue.shift()));
    }
    // return promise array
    return Promise.all(resumePromises);
  }

  stop(): Promise<any> {
    // send all pending messages to DLQ
    for(let id in this.sendStorage) {
      let {msg} = this.sendStorage[id];
      delete this.sendStorage[id];
      this.dlqCB(msg);
    }
    
    this.batch.forEach((batch, i) => {
      batch.messages.forEach(msg => {
        const conMsg = {
          topic: this.topic,
          partition: -1,
          offset: -1,
          message: msg,
        }
        this.dlqCB(conMsg);
      });
      this.batch[i] = {
        topic: this.retryTopics[i],
        messages: [],
      };
    });
    
    return new Promise((resolve) => resolve(true));
  }

  send(msg: Types.KafkaConsumerMessageInterface): Promise<any> {
    try{
      if(this.paused) {
        this.pausedQueue.push(msg);
        return new Promise(resolve => resolve(true));
      }
      // access cascadeMetadata - only first message for now, refactor later
      const metadata = JSON.parse(msg.message.headers.cascadeMetadata);
      // check if retries exceeds allowed number of retries
      if (metadata.retries < this.retryTopics.length) {
        msg.topic = this.retryTopics[metadata.retries];
        metadata.retries += 1;
        // populate producerMessage object
        let id = `${Date.now()}${Math.floor(Math.random() * Date.now())}`;
        const producerMessage = {
          topic: msg.topic, 
          messages: [{
            key: msg.message.key, 
            value: msg.message.value, 
            headers: { ...msg.message.headers, cascadeMetadata: JSON.stringify(metadata) }
          }]
        };
        
        if(this.timeout[metadata.retries - 1] > 0) return this.sendTimeout(id, producerMessage, metadata.retries - 1); 
        else return this.sendBatch(producerMessage, metadata.retries - 1);
      } else {
        this.emit('dlq', msg);
        this.dlqCB(msg);
        return new Promise((resolve) => resolve(true));
      }
    }
    catch(error) {
      this.emit('error', error);
    }
  }
  
  //Used by send
  //sets delay for producer messages
  sendTimeout(id, msg, retries) {
    return new Promise((resolve, reject) => {
      //stores each send and msg to sendStorage[id] 
      this.sendStorage[id] = {
        sending: () => {
          this.emit('retry', msg);
          this.producer.send(msg)
            .then(res => resolve(res))
            .catch(res => {
              reject(res);
           });
        }, msg: msg };
      //sends message after timeout expires
      const scheduler = () => {
        if(this.sendStorage[id]){
          const {sending} = this.sendStorage[id];
          delete this.sendStorage[id];
          sending();
        }
      }
      if(process.env.test === 'test') scheduler();
      else setTimeout(scheduler, this.timeout[retries]);
    });
  };

  //Used by send
  //sets batch processing
  sendBatch(msg, retries){
    return new Promise((resolve, reject) => {
      this.batch[retries].messages.push(msg.messages[0]);
      if(this.batch[retries].messages.length === this.batchLimit[retries]) {
        this.emit('retry', this.batch[retries]);
        this.producer.send(this.batch[retries])
          .then(res => resolve(res))
          .catch(res => {
            console.log('Caught an error trying to send batch: ' + res);
            reject(res);
        });
        this.batch[retries] = {
          topic: this.retryTopics[retries],
          messages: [],
        };
      }
      else resolve(true);
    });
  }

  //User is ability to set the timeout and batchLimit
  setRetryTopics(topicsArr: string[], options?: {timeoutLimit?: number[], batchLimit: number[]}) {
    this.retryTopics = topicsArr;
    if(options && options.timeoutLimit) this.timeout = options.timeoutLimit;
    else this.timeout = (new Array(topicsArr.length)).fill(0);
    
    if(options && options.batchLimit) this.batchLimit = options.batchLimit;
    else this.batchLimit = (new Array(topicsArr.length)).fill(1);

    this.retryTopics.forEach((topic) => {
      const emptyMsg = {
        topic,
        messages: [],
      };
      this.batch.push(emptyMsg);
    });
  }
}

export default CascadeProducer;
