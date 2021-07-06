const EventEmitter = require('events');
import * as Types from './kafkaInterface';

class CascadeProducer extends EventEmitter {
  producer: Types.ProducerInterface;
  dlqCB: Types.RouteCallback;
  retryTopics: string[];
  paused: boolean;
  pausedQueue: Types.KafkaConsumerMessageInterface[]; // maybe linked list
  retryOptions: {timeout: number[], batchLimit: number};
  timeout: number[] = [];
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
    for(let id in this.sendStorage){
      let sending = this.sendStorage[id];
      delete this.sendStorage[id];
      sending();
    }
    return
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
        
        return new Promise((resolve, reject) => {
          //stores each send to sendStorage
          
          this.sendStorage[id] = () => {
            this.emit('retry', producerMessage);
            this.producer.send(producerMessage)
              .then(res => resolve(res))
              .catch(res => {
                console.log('Caught an error trying to send: ' + res);
                reject(res);
              });
          }
          //sends message after timeout expires
          const scheduler = () => {
            const sending = this.sendStorage[id];
            delete this.sendStorage[id];
            sending();
          }

          if(process.env.test === 'test') scheduler();
          else setTimeout(this.scheduler.bind(this), this.timeout[metadata.retries-1]);


        });
      } else {
        this.emit('dlq', msg);
        this.dlqCB(msg);
        return new Promise((resolve) => resolve(true));
      }
    }
    catch(error) {
      console.log('Caught error in CascadeProducer.send: ' + error);
    }
  }


  setRetryTopics(topicsArr: string[], timeout: number[]) {
    this.retryTopics = topicsArr;
    if(timeout) this.timeout = timeout;
    else {
      this.timeout = (new Array(topicsArr.length)).fill(1);
    }
  }
}

export default CascadeProducer;


/*
sendMessage
if retry level 2
10 message
send all 10 message on level 2


send 100 success rate 90
as message hit level 2
they wont be sent out back when 10 do
10 

*/