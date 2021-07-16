import CascadeService from './src/cascadeService';
import CascadeProducer from './src/cascadeProducer';
import CascadeConsumer from './src/cascadeConsumer'
import * as Types from './src/kafkaInterface';

/**
 * @module cascade
 */
module.exports = {
  /**
   * Main entry point to the module. Creates a new service that listens to and produces kafka messages
   * 
   * @example
   * const cascade = require('kafka-cascade');
   * const service = new cascade.service(kafka, 'example-topic', 'example-group', serviceCB, successCB, dlqCB);
   * 
   * @param kafka - KakfaJS Kafka Object
   * @param {string} topic - Topic that the service listens for and runs the service
   * @param {string} groupId - Group Id for the service consumer
   * @param serviceCB  - Callback that is run whenever 'topic' is received or retry. It accepts a kafka message, resolve callback and reject callback
   * @param successCB  - Callback that is run when the serviceCB resolves a message, accepts the kafka message
   * @param dlqCB - Callback that is run when the serviceCB rejects a message and cannot be retried anymore
   * @returns {CascadeService}
   */
  service: (kafka: Types.KafkaInterface, topic: string, groupId: string,
    serviceCB: Types.ServiceCallback, successCB: (...args: any[]) => any,
    dlqCB: Types.RouteCallback = (msg: Types.KafkaConsumerMessageInterface) => console.log('DLQ Message received')): Promise<CascadeService> => {
    
    return new Promise(async (resolve, reject) => {
      try {
        const newServ = new CascadeService(kafka, topic, groupId, serviceCB, successCB, dlqCB);
        resolve(newServ);
      }
      catch(error) {
        reject(error);
      }
    });
  },

  /**
   * Utility function that parses the metadata that cascade adds to the kafka message headers
   * @param msg 
   * @returns {object}
   */
  getMetadata: (msg: Types.KafkaConsumerMessageInterface):{ retires:number, status:string, topicArr:string[] } => {
    if(typeof(msg) !== 'object' || !msg.message || !msg.message.headers || !msg.message.headers.cascadeMetadata) return;
    return JSON.parse(msg.message.headers.cascadeMetadata);
  },
};

export {
  CascadeService,
  CascadeProducer,
  CascadeConsumer,
  Types,
};
