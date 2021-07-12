const EventEmitter = require('events');
import * as Types from './kafkaInterface';
import CascadeProducer from './cascadeProducer';
import CascadeConsumer from './cascadeConsumer';

// kafka object to create producer and consumer
// service callback
// dlq callback -> provide default
// success callback
// topic
// retry producer
// topic consumer
// retry levels -> provide default
// retry strategies per level

class CascadeService extends EventEmitter {
  kafka: Types.KafkaInterface;
  topic: string;
  serviceCB: Types.ServiceCallback;
  successCB: Types.RouteCallback;
  dlqCB: Types.RouteCallback;
  producer: CascadeProducer;
  consumer: CascadeConsumer;

  events = [ 
    'connect',
    'disconnect',
    'run',
    'stop',
    'pause',
    'resume',
    'receive',
    'success',
    'retry',
    'dlq',
    'error',
    'serviceError',
  ];

  constructor(kafka: Types.KafkaInterface, topic: string, groupId: string,
    serviceCB: Types.ServiceCallback, successCB: Types.RouteCallback, dlqCB: Types.RouteCallback) {
      super();
      this.kafka = kafka;
      this.topic = topic;
      this.serviceCB = serviceCB;
      this.successCB = successCB;
      this.dlqCB = dlqCB;
      this.retries = 0;
      this.topicsArr = [];


      // create producers and consumers
      this.producer = new CascadeProducer(kafka, topic, dlqCB);
      this.producer.on('retry', (msg) => this.emit('retry', msg));
      this.producer.on('dlq', (msg) => this.emit('dlq', msg));
      this.producer.on('error', (error) => this.emit('error', 'Error in cascade producer: ' + error));
      this.consumer = new CascadeConsumer(kafka, topic, groupId, false);
      this.consumer.on('receive', (msg) => this.emit('receive', msg));
      this.consumer.on('serviceError', (error) => this.emit('serviceError', error));
      this.consumer.on('error', (error) => this.emit('error', 'Error in cascade consumer: ' + error));
  }

  connect():Promise<any> {   
    return new Promise(async (resolve, reject) => {
      try {
        await this.producer.connect();
        await this.consumer.connect();
        resolve(true);
        this.emit('connect');
      }
      catch(error) {
        reject(error);
        this.emit('error', 'Error in cascade.connect(): ' + error);
      }
    });  
  }

  disconnect():Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.producer.stop();
        await this.producer.disconnect();
        await this.consumer.disconnect();
        resolve(true);
        this.emit('disconnect');
      }
      catch(error) {
        reject(error);
        this.emit('error', 'Error in cascade.disconnect(): ' + error);
      }
    });  
  }

  setDefaultRoute(count: number, options?: {timeoutLimit?: number[], batchLimit?: number[]}):Promise<any> {
    return new Promise((resolve, reject) => {
      this.producer.setDefaultRoute(count, options)
        .then(res => resolve(res))
        .catch(error => {
          reject(error);
          this.emit('error', error);
        });
    });
  }

  setRoute(status:string, count: number, options?: {timeoutLimit?: number[], batchLimit?: number[]}):Promise<any> {
    return new Promise((resolve, reject) => {
      this.producer.setRoute(status, count, options)
        .then(res => resolve(res))
        .catch(error => {
          reject(error);
          this.emit('error', error);
        });
    });
  }

  getKafkaTopics():string[] {
    let topics:string[] = [];
    this.producer.routes.forEach(route => topics = topics.concat(route.topics));
    return topics;
  }

  run():Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        const status = await this.consumer.run(this.serviceCB, 
          (msg) => { this.emit('success', msg); this.successCB(msg) }, 
          async (msg, status:string = '') => {
            try {
              await this.producer.send(msg, status);
            }
            catch(error) {
              this.emit('error', 'Error in cascade producer.send(): ' + error);
            }
          });
        resolve(status);
        this.emit('run');
      } catch(error) {
        reject(error);
        this.emit('error', 'Error in cascade.run(): ' + error);
      }
      
    });
  }

  stop():Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.consumer.stop();
        await this.producer.stop();

        resolve(true);
        this.emit('stop');
      } catch (error) {
        reject(error);
        this.emit('error', 'Error in cascade.stop(): ' + error);
      }

    });
  }

  async pause():Promise<any> {
    // check to see if service is already paused
    if (!this.producer.paused) {
      return new Promise (async (resolve, reject) => {
        try {
          await this.consumer.pause();
          this.producer.pause();
          resolve(true);
          this.emit('pause');
        } catch (error) {
          reject(error);
          this.emit('error', 'Error in cascade.pause(): ' + error);
        }
      });
    } else {
      console.log('cascade.pause() called while service is already paused!');
    }
  }

  paused() {
    // return producer.paused boolean;
    return this.producer.paused;
  }

  async resume(): Promise<any> {
    // check to see if service is paused
    if (this.producer.paused) {
      return new Promise(async (resolve, reject)=> {
        try{
          await this.consumer.resume();
          await this.producer.resume();
          resolve(true);
          this.emit('resume');
        } catch (error){
          reject(error);
          this.emit('error', 'Error in cascade.resume(): ' + error);
        }
      });
    } else {
      console.log('cascade.resume() called while service is already running!');
    }
  }

  on(event: string, callback: (arg: any) => any) {
    if(!this.events.includes(event)) throw new Error('Unknown event: ' + event);
    super.on(event, callback);
  }
}

export default CascadeService;