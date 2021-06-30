import { inherits } from "util";

interface MessageInterface {
  topic: string;
  messages: [{ value:string }];
}

interface ProducerInterface {
  connect: () => Promise<any>;
  disconnect: () => any;
  send:(arg: MessageInterface, callby?: string) => any;
}

interface ConsumerInterface {
  connect: ({groupId:string}) => Promise<any>;
  disconnect: () => any;
  subscribe: (arg: {topic:string|RegExp, fromBeginning: boolean}) => Promise<any>;
  run: (arg: ({
    eachMessage: (msg: KafkaMessageInterface) => void,
  })) => any;
}

interface KafkaInterface {
  producer: () => ProducerInterface;
  consumer: () => ConsumerInterface;
}

interface KafkaMessageInterface {
  topic: string,
  partition: number,
  offset: number,
  messages: [{
    key?: string,
    value: string,
    headers?: {
      cascadeMetadata?: {
        status: string,
        retries: number,
        topicArr: string[],
      }
    }
  }]
}

type ServiceCallback = (msg: KafkaMessageInterface, resolve: RouteCallback, reject: RouteCallback) => void;

type RouteCallback = (msg: KafkaMessageInterface) => void;

export { 
  MessageInterface, 
  ProducerInterface, 
  ConsumerInterface, 
  KafkaInterface, 
  KafkaMessageInterface, 
  ServiceCallback, 
  RouteCallback,
};