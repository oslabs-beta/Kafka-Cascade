import { inherits } from "util";

interface ProducerInterface {
  connect: () => Promise<any>;
  disconnect: () => any;
  send:(arg: KafkaProducerMessageInterface) => any;
}

interface ConsumerInterface {
  connect: () => Promise<any>;
  disconnect: () => any;
  subscribe: (arg: {topic:string|RegExp, fromBeginning: boolean}) => Promise<any>;
  run: (arg: ({
    eachMessage: (msg: KafkaConsumerMessageInterface) => void,
  })) => any;
}

interface KafkaInterface {
  producer: () => ProducerInterface;
  consumer: ({groupId:string}) => ConsumerInterface;
}

interface KafkaProducerMessageInterface {
  topic: string,
  offset?: number,
  partition?:number,
  messages: {
    key?: string,
    value: string,
    headers?: {
      cascadeMetadata?: string,
    }
  }[]
}

interface KafkaConsumerMessageInterface {
  topic: string,
  partition: number,
  offset: number,
  message: {
    key?: string,
    value: string,
    headers?: {
      cascadeMetadata?: string,
    }
  }
}

interface CascadeMetadata {
  status: string,
  retries: number,
  topicArr: string[],
}

type ServiceCallback = (msg: KafkaConsumerMessageInterface, resolve: RouteCallback, reject: RouteCallback) => void;

type RouteCallback = (msg: KafkaConsumerMessageInterface) => void;

export { 
  ProducerInterface, 
  ConsumerInterface, 
  KafkaInterface, 
  KafkaProducerMessageInterface, 
  KafkaConsumerMessageInterface, 
  CascadeMetadata,
  ServiceCallback, 
  RouteCallback,
};