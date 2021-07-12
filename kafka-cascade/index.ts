import CascadeService from './src/cascadeService';
import CascadeProducer from './src/cascadeProducer';
import CascadeConsumer from './src/cascadeConsumer'
import * as Types from './src/kafkaInterface';

module.exports = {
  service: (kafka: Types.KafkaInterface, topic: string, groupId: string,
    serviceCB: Types.ServiceCallback, successCB: Types.RouteCallback,
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
