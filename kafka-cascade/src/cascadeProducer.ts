const { Kafka } = require('kafkajs');
import * as Types from './kafkaInterface';

class CascadeProducer {
  producer: Types.ProducerInterface;
  dlqCB: Types.RouteCallback;
  retryTopics: string[];
  paused: boolean;
  pausedQueue: Types.KafkaConsumerMessageInterface[]; // maybe linked list

  // pass in kafka interface
  constructor(kafka: Types.KafkaInterface, dlqCB: Types.RouteCallback) {
    this.dlqCB = dlqCB;
    this.retryTopics = [];
    this.producer = kafka.producer();
    this.paused = false;
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
        const producerMessage = {
          topic: msg.topic, 
          messages: [{
            key: msg.message.key, 
            value: msg.message.value, 
            headers: { ...msg.message.headers, cascadeMetadata: JSON.stringify(metadata) }
          }]
        };
        
        return new Promise((resolve, reject) => {
          this.producer.send(producerMessage)
            .then(res => resolve(res))
            .catch(res => {
              console.log('Caught an error trying to send: ' + res);
              reject(res);
            });
        });
      } else {
        this.dlqCB(msg);
        return new Promise((resolve) => resolve(true));
      }
    }
    catch(error) {
      console.log('Caught error in CascadeProducer.send: ' + error);
    }
  }

  setRetryTopics(topicsArr: string[]) {
    this.retryTopics = topicsArr;    
  }
}

export default CascadeProducer;