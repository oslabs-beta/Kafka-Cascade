const { Kafka } = require('kafkajs');
// import { Kafka } from 'kafkajs';
import * as types from './kafkaInterface';


class cascadeConsumer{
  consumer: types.ConsumerInterface;
  cascadeMessage: string;
  topic: string;

  // connect: (args: any[]) => Promise<any>;
  constructor(kafkaInterface: types.KafkaInterface, cascadeMessage: string, topic: string, fromBeginning: boolean){
    //kafka interface to this
    this.consumer = kafkaInterface.consumer();
    this.cascadeMessage = cascadeMessage;
    this.topic = `${topic}-cascade-retry-`;
  }
  
  connect(topic: string, fromBeginning: boolean): Promise<any> {
    return new Promise(async () => {
      await this.consumer.connect();
      this.consumer.subscribe({topic, fromBeginning});
      let re = new RegExp(`/${topic}-cascade-retry-.*`);
      this.consumer.subscribe({topic: re, fromBeginning})
    })
    
  }
  
  // //topic itself
  // subscribe(){

  // }

  //subscribe to regex for the topic
  

  disconnect(topics: any[]): any{
    // return this.consumer.disconnect();
    let regexTopics = topics.map((regexArray,topic) => {
      regexArray.push( new RegExp(`/${topic}-cascade-retry-.*`))
    }, [])
    // this.consumer.disconnect(topics);
    // this.consumer.disconnect(regexTopics);
  }
  //copy kafka js if not changed

  // `/${topic}-cascade-retry-/`

} 

// const Consumer = (consumer: types.ConsumerInterface) => {
//   let consumerkafka = consumer;
// }

// Consumer.prototype.updateSubscribe = (topic: string, fromBeginning: boolean) => {
//   consumerkafka.subscribe()
// }


// interface ConsumerInterface {
//   connect: (args: any[]) => Promise<any>;
//   disconnect: (args: any[]) => any;
//   subscribe: (arg: {topic:string, fromBeginning: boolean}) => Promise<any>;
//   run: (arg: ({eachMessage: {topic:string, partition: number, message: any}})) => any;
// }

// const subscribe = () => {

// }


// const checkStatus = (status: boolean) => {
//   if(status === true){
//   }
// }