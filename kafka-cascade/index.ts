import CascadeService from './src/cascadeService';
import * as Types from './src/kafkaInterface';

module.exports = {
  service: async (kafka: Types.KafkaInterface, topic: string, groupId: string,
    serviceCB: Types.ServiceCallback, successCB: Types.RouteCallback,
    dlqCB: Types.RouteCallback = (msg: Types.KafkaMessageInterface) => console.log('DQL Message received')): Promise<CascadeService> => {
    
    const newServ = new CascadeService(kafka, topic, groupId, serviceCB, successCB, dlqCB);
    await newServ.connect();
    return newServ;
  }
};