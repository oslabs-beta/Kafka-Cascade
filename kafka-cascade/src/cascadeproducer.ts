const { Kafka } = require('kafkajs');
import * as types from '../kafkaInterface';

// cascadeProducer
  // attempts retries on messages
    // increase retryCount on message
    // sets topic to next retry topic
    // send to DLQ when out of retry levels

class CascadeProducer {
  producer: types.ProducerInterface;
  dlqCB: (args: any[]) => void;
  retryTopics: string[];

  // pass in kafka interface
  constructor(kafka: types.KafkaInterface, dlqCB: (args: any[]) => void) {
    this.dlqCB = dlqCB;
    this.retryTopics = [];
    this.producer = kafka.producer();
  }

  connect(): Promise<any> {
    return this.producer.connect();
  }

  disconnect(): Promise<any> {
    return this.producer.disconnect();
  }

  /**
   * kafkaMessage = {
   *    topic: string,
   *    messages: [{
   *      key: string,
   *      value: string,
   *      headers: {
   *        status: string,
   *        retries: int,
   *        topicArr: [],
   *      }
   *    }]
   * }
   * 
   * If we have headers, maybe there is no need for
   * this additional layer of data?
   *  
   * cascadeMessage = {
   *    status: string
   *    retryCount: int
   *    payload: JSON data
   * }
   * 
   */

  send(msg: any): Promise<any> {
    // destructure header properties
    let { status, retries, topicArr } = msg.messages[0].headers;
    // if retries equals 0, send message as normal
    if (retries === 0) {
      return this.producer.send(msg);
    // how are max number of retries set?
    } else if (retries > topicArr.length) {
      
    }
  }

  setRetryTopics(topics: string[]) {
    let newTopic = topics[topics.length - 1] + '';
    
  }
}

export default CascadeProducer;