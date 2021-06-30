interface MessageInterface {
  topic: string;
  messages: [{ value:string }];
}

interface ProducerInterface {
  connect: () => Promise<any>;
  disconnect: () => any;
  send:(arg: MessageInterface) => any;
}

interface ConsumerInterface {
  connect: () => Promise<any>;
  disconnect: () => any;
  subscribe: (arg: {topic:string, fromBeginning: boolean}) => Promise<any>;
  run: (arg: ({eachMessage: {topic:string, partition: number, message: any}})) => any;
}

interface KafkaInterface {
  producer: () => ProducerInterface;
  consumer: () => ConsumerInterface;
}

export { MessageInterface, ProducerInterface, ConsumerInterface, KafkaInterface };