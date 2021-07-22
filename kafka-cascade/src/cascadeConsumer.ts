const EventEmitter = require('events');
import * as Types from './kafkaInterface';


class CascadeConsumer extends EventEmitter{
  consumer: Types.ConsumerInterface;
  topic: string;
  groupId: string;
  fromBeginning: boolean;

  constructor(kafkaInterface: Types.KafkaInterface, topic: string, groupId: string, fromBeginning: boolean = false){
    super();
    // kafka interface to this
    this.consumer = kafkaInterface.consumer({groupId});
    this.topic = topic;
    this.groupId = groupId;
    this.fromBeginning = fromBeginning;
  }

  // Connect and subscribe to both reg and regex for the topic
  connect(): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.consumer.connect();
        console.log('Connected to the consumer...');
        await this.consumer.subscribe({topic: this.topic, fromBeginning: this.fromBeginning});
        console.log('Subscribed to the base topic:', this.topic);
        let re = new RegExp(`^${this.topic}-cascade-retry-.*`);
        await this.consumer.subscribe({topic: re, fromBeginning: this.fromBeginning});
        console.log('Connected to the retry topics...');
        resolve(true);
      }
      catch(error) {
        this.emit('error', error);
        reject(error);
      }
    });
  }

  run(serviceCB: Types.ServiceCallback, successCB: Types.RouteCallback, rejectCB: Types.RouteCallback):Promise<any> {
    return this.consumer.run({eachMessage: (msg: Types.KafkaConsumerMessageInterface)=> {
      try {
        if (!msg.message.headers) {
          msg.message.headers = {};
        }
        
        if (!msg.message.headers.cascadeMetadata) {
          msg.message.headers.cascadeMetadata = JSON.stringify({
            status: '',
            retries: 0,
            topicArr: [],
          })
        }
        if(msg.topic === this.topic) this.emit('receive', msg);
      }
      catch(error) {
        this.emit('error', error);
      }

      try {
        serviceCB(msg, successCB, rejectCB);
      }
      catch(error) {
        this.emit('serviceError', error);
      }
    }});
  }

  disconnect(): Promise<any> {
    return this.consumer.disconnect();
  }

  stop(): Promise<any> {
    return this.consumer.stop();
  }
  
  pause(): Promise<any> {
    return this.consumer.pause();
  }

  resume(): Promise<any> {
    return this.consumer.resume();
  }

  on(event: string, callback: (arg: any) => any) {
    super.on(event, callback);
  }
} 

export default CascadeConsumer;