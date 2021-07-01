import CascadeService from './src/cascadeService';
import CascadeProducer from './src/cascadeProducer';
import CascadeConsumer from './src/cascadeConsumer'
import * as Types from './src/kafkaInterface';

module.exports = {
  service: (kafka: Types.KafkaInterface, topic: string, groupId: string,
    serviceCB: Types.ServiceCallback, successCB: Types.RouteCallback,
    dlqCB: Types.RouteCallback = (msg: Types.KafkaConsumerMessageInterface) => console.log('DQL Message received')): Promise<CascadeService> => {
    
    return new Promise(async (resolve, reject) => {
      try {
        const newServ = new CascadeService(kafka, topic, groupId, serviceCB, successCB, dlqCB);
        await newServ.connect();
        resolve(newServ);
      }
      catch(error) {
        reject(error);
      }
    });
  },
};

export {
  CascadeService,
  CascadeProducer,
  CascadeConsumer,
  Types,
};

