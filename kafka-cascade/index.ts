const EventEmitter = require('events');
import * as Types from './kafkaInterface';
// import CascadeProducer from './CascadeProducer';
// import CascadeConsumer from './CascadeProducer';

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
  serviceCB: (resolve: (args: any[]) => void, reject: (args: any[]) => void) => void;
  successCB: (args: any[]) => void;
  dlqCB: (args: any[]) => void;
  retries : number;
  topicsArr : string[];
  //CascadingProducer
  //CascadingConsumer

  events = [ 
    'run',
    'stop',
    'pause',
    'resume'
  ];

  constructor(kafka: Types.KafkaInterface, topic: string, 
    serviceCB: (resolve: (args: any[]) => void, reject: (args: any[]) => void) => void, // checkback on reject arg types
    successCB: (args: any[]) => void,
    dlqCB: (args: any[]) => void,
    ) {
      super();
      this.kafka = kafka;
      this.topic = topic;
      this.serviceCB = serviceCB;
      this.successCB = successCB;
      this.dlqCB = dlqCB;
      this.retries = 0;
      this.topicsArr = [];

      // create producers and consumers
  }

  setRetryLevels(count: number) {
    if(this.topicsArr.length > count){
      const diff = this.topicsArr.length - count;
      for(let i = 0; i < diff; i++){
        this.topicsArr.pop();
      };
    }
    else {
      for(let i = this.retries; i < count; i++){
        this.topicsArr.push(this.topic + '-cascade-retry-' + i);
      }
    }

    this.retries = count;
  }

/**
 *
    stop,
    run,
    pause,
    paused,
    resume,
    on,
 */
  run():Promise<any> {
    // consumer.run();
    this.emit('run');
    return new Promise(()=>null);
  }

  stop() {
    // consumer.stop();
    this.emit('stop');
  }

  pause() {
    // consumer.pause();
    this.emit('pause');
  }

  paused() {
    // return consume.paused();
  }

  resume() {
    // consume.resume();
    this.emit('resume');
  }

  on(event: string, callback: (arg: any) => any) {
    if(!this.events.includes(event)) throw new Error('Unkown event: ' + event);
    super.on(event, callback);
  }
}

const returnValue = fetch('/api');
returnValue.then(res => res.json());

fetch('/api').then(res => res.json());


module.exports = {
  service: (kafka: Types.KafkaInterface, topic: string, 
    serviceCB: (resolve: (args: any[]) => void, reject: (args: any[]) => void) => void, // checkback on reject arg types
    successCB: (args: any[]) => void,
    dlqCB: (args: any[]) => void = () => console.log('DQL Message received')): CascadeService => {

    return new CascadeService(kafka, topic, serviceCB, successCB, dlqCB);
  }
}; 