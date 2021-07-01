const { Kafka } = require('kafkajs');
// import { Kafka } from 'kafkajs';
import * as Types from './kafkaInterface';


class CascadeConsumer {
  consumer: Types.ConsumerInterface;
  topic: string;
  groupId: string;
  fromBeginning: boolean;

  
  //constructor
  constructor(kafkaInterface: Types.KafkaInterface, topic: string, groupId: string, fromBeginning: boolean){
    //kafka interface to this
    this.consumer = kafkaInterface.consumer({groupId});
    this.topic = topic;
    this.groupId = groupId;
    this.fromBeginning = fromBeginning;
  }

  // Connect and subscribe to both reg and regex for the topic
  // connect: (args: any[]) => Promise<any>;
  connect(topic?: string, fromBeginning?: boolean): Promise<any> {
    /*
    return new Promise(async (resolve, reject) => {
      await this.consumer.connect()
      await this.consumer.subscribe({topic, fromBeginning});
      let re = new RegExp(`/${topic}-cascade-retry-.*`);
      await this.consumer.subscribe({topic: re, fromBeginning})
      resolve(true);
    });
    */

    //without arguments passed in, it will use the variables that are saved from constructor
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
        reject(error);
      }
    });
  }

  run(serviceCB: Types.ServiceCallback, successCB: Types.RouteCallback, rejectCB: Types.RouteCallback):Promise<any> {
    return this.consumer.run({eachMessage: (msg: Types.KafkaMessageInterface)=> {
      // process a message
      // check if message has expected header structure
      // only checking first message now, may have to refactor later
      try {
        if (!msg.messages[0].headers) {
          msg.messages[0].headers = {};
        }

        if (!msg.messages[0].headers.cascadeMetadata) {
          msg.messages[0].headers.cascadeMetadata = {
            status: '',
            retries: 0,
            topicArr: [],
          }
        }
        // call the service
        serviceCB(msg, successCB, rejectCB);
      }
      catch(error) {
        console.log('Caught error in eachMessage: ' + error);
      }
    }});
  }

  //disconnect to every to  
  disconnect(topics: any[]): any{
    // return this.consumer.disconnect();
    let regexTopics = topics.map((regexArray,topic) => {
      regexArray.push( new RegExp(`^${topic}-cascade-retry-.*`))
    }, [])
    this.consumer.disconnect();
    // this.consumer.disconnect(topics);
    // this.consumer.disconnect(regexTopics);
  }
  //copy kafka js if not changed
} 

export default CascadeConsumer;






/*
researching:: connect method in kafka

index.ts
export type Consumer = {
  connect(): Promise<void>
  disconnect(): Promise<void>
  subscribe(topic: ConsumerSubscribeTopic): Promise<void>
  stop(): Promise<void>
  run(config?: ConsumerRunConfig): Promise<void>
  commitOffsets(topicPartitions: Array<TopicPartitionOffsetAndMetadata>): Promise<void>
  seek(topicPartition: { topic: string; partition: number; offset: string }): void
  describeGroup(): Promise<GroupDescription>
  pause(topics: Array<{ topic: string; partitions?: number[] }>): void
  paused(): TopicPartitions[]
  resume(topics: Array<{ topic: string; partitions?: number[] }>): void
  on(
 */

/*
    eventName: ValueOf<ConsumerEvents>,
    listener: (...args: any[]) => void
  ): RemoveInstrumentationEventListener<typeof eventName>
  logger(): Logger
  events: ConsumerEvents
}







*/