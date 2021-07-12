const EventEmitter = require('events');
import * as Types from './kafkaInterface';
import Queue from './util/queue';

class CascadeProducer extends EventEmitter {
  producer: Types.ProducerInterface;
  admin: Types.AdminInterface;
  topic: string;
  dlqCB: Types.RouteCallback;
  retryTopics: string[];
  paused: boolean;
  pausedQueue: Queue<{msg:Types.KafkaConsumerMessageInterface, status:string}>;
  sendStorage = {};
  routes: Types.ProducerRoute[];

  // pass in kafka interface
  constructor(kafka: Types.KafkaInterface, topic:string, dlqCB: Types.RouteCallback) {
    super();
    this.topic = topic;
    this.dlqCB = dlqCB;
    this.retryTopics = [];
    this.producer = kafka.producer();
    this.admin = kafka.admin();
    this.paused = false;
    this.pausedQueue = new Queue<{msg:Types.KafkaConsumerMessageInterface, status:string}>();
    // set the routes to have a default route
    this.routes = [{status:'', retryLevels:0, timeoutLimit: [], batchLimit: [], levels: [], topics:[]}];
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
      const {msg, status} = this.pausedQueue.shift();
      resumePromises.push(this.send(msg, status));
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
    
    this.routes.forEach(route => {
      route.levels.forEach((level, i) => {
        level.messages.forEach(msg => {
          const conMsg = {
            topic: route.levels[i].topic,
            partition: -1,
            offset: -1,
            message: msg,
          }
          this.dlqCB(conMsg);
        });
        level.messages = [];
      });
    });
    
    return new Promise((resolve) => resolve(true));
  }

  send(msg: Types.KafkaConsumerMessageInterface, status:string): Promise<any> {
    try{
      if(this.paused) {
        this.pausedQueue.push({msg, status});
        return new Promise(resolve => resolve(true));
      }

      let route = this.routes[0];
      for(let i = 1; i < this.routes.length; i++) {
        if(status === this.routes[i].status) {
          route = this.routes[i];
          break;
        }
      }

      const metadata = JSON.parse(msg.message.headers.cascadeMetadata);
      // check if retries exceeds allowed number of retries
      if (metadata.retries < route.topics.length) {

        msg.topic = route.topics[metadata.retries];
        metadata.retries += 1;
        metadata.status = status;
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
        
        if(route.timeoutLimit[metadata.retries - 1] > 0) return this.sendTimeout(id, producerMessage, metadata.retries - 1, route); 
        else return this.sendBatch(producerMessage, metadata.retries - 1, route);
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
  sendTimeout(id:string, msg: Types.KafkaProducerMessageInterface, retries:number, route: Types.ProducerRoute) {
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
      else setTimeout(scheduler, route.timeoutLimit[retries]);
    });
  };

  //Used by send
  //sets batch processing
  sendBatch(msg:Types.KafkaProducerMessageInterface, retries:number, route:Types.ProducerRoute){
    return new Promise((resolve, reject) => {
      route.levels[retries].messages.push(msg.messages[0]);
      if(route.levels[retries].messages.length === route.batchLimit[retries]) {
        this.emit('retry', route.levels[retries]);
        this.producer.send(route.levels[retries])
          .then(res => resolve(res))
          .catch(res => {
            console.log('Caught an error trying to send batch: ' + res);
            reject(res);
        });
        route.levels[retries].messages = [];
      }
      else resolve(true);
    });
  }

  //User is ability to set the timeout and batchLimit
  setDefaultRoute(count:number, options?: {timeoutLimit?: number[], batchLimit?: number[]}):Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        const defaultRoute = this.routes[0];
        if(defaultRoute.topics.length > count){
          const diff = this.topicsArr.length - count;
          for(let i = 0; i < diff; i++){
            defaultRoute.topics.pop();
          };
        }
        else {
          for(let i = defaultRoute.topics.length; i < count; i++){
            defaultRoute.topics.push(this.topic + '-cascade-retry-' + (i+1));
          }
        }
        defaultRoute.retryLevels = count;

        if(options && options.timeoutLimit) defaultRoute.timeoutLimit = options.timeoutLimit;
        else defaultRoute.timeoutLimit = (new Array(defaultRoute.topics.length)).fill(0);
        
        if(options && options.batchLimit) defaultRoute.batchLimit = options.batchLimit;
        else defaultRoute.batchLimit = (new Array(defaultRoute.topics.length)).fill(1);

        defaultRoute.levels = [];
        defaultRoute.topics.forEach((topic) => {
          const emptyMsg = {
            topic,
            messages: [],
          };
          defaultRoute.levels.push(emptyMsg);
        });
        

        // get an admin client to pre-register topics
        await this.admin.connect();
        const registerTopics = {
          waitForLeaders: true,
          topics: [],
        }
        defaultRoute.topics.forEach(topic => registerTopics.topics.push({topic}));

        await this.admin.createTopics(registerTopics);
        const re = new RegExp(`^${this.topic}-cascade-retry-.*`);
        console.log('topics registered =', (await this.admin.listTopics()).filter(topic => topic === this.topic || topic.search(re) > -1));
        await this.admin.disconnect();

        setTimeout(() => {
          console.log('Registered topics with Kafka...');
          resolve(true);
        }, 10);
      }
      catch(error) {
        this.emit('error', 'Error in cascade.setDefaultLevels(): ' + error);
        reject(error);
      }
    });
  }
}

export default CascadeProducer;
