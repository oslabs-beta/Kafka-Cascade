const { Kafka } = require('kafkajs');
const EventEmitter = require('events');
import * as Types from './kafkaInterface';


class CascadeConsumer extends EventEmitter{
  consumer: Types.ConsumerInterface;
  topic: string;
  groupId: string;
  fromBeginning: boolean;

  
  //constructor
  constructor(kafkaInterface: Types.KafkaInterface, topic: string, groupId: string, fromBeginning: boolean = false){
    super();
    //kafka interface to this
    this.consumer = kafkaInterface.consumer({groupId});
    this.topic = topic;
    this.groupId = groupId;
    this.fromBeginning = fromBeginning;
  }

  // Connect and subscribe to both reg and regex for the topic
  // connect: (args: any[]) => Promise<any>;
  connect(): Promise<any> {
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
    return this.consumer.run({eachMessage: (msg: Types.KafkaConsumerMessageInterface)=> {
      // process a message
      // check if message has expected header structure
      // only checking first message now, may have to refactor later
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
        // call the service
        serviceCB(msg, successCB, rejectCB);
      }
      catch(error) {
        console.log('Caught error in CascadeComsumer eachMessage: ' + error);
      }
    }});
  }

  //disconnect to every to  
  disconnect(): Promise<any> {
    // return this.consumer.disconnect();
    // let regexTopics = topics.map((regexArray,topic) => {
    //   regexArray.push( new RegExp(`^${topic}-cascade-retry-.*`))
    // }, [])
    return this.consumer.disconnect();
    // this.consumer.disconnect(topics);
    // this.consumer.disconnect(regexTopics);
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