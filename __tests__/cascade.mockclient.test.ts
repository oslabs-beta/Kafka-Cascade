import * as Types from '../kafka-cascade/src/kafkaInterface';

var testFn:any;
if(process.env.NODE_ENV === 'production') {
  testFn = (callback:any) => function(...args) { return callback(...args); };
}
else testFn = jest.fn;

class TestKafka {
  subscribers: any[];
  consumer: any;
  producer: any;
  admin:any;

  constructor() {
    this.subscribers = [];
    //used for testFn to test param types, number of times function was called
    this.consumer = testFn(() => new TestConsumer(this));
    this.producer = testFn(() => new TestProducer(this));
    this.admin = testFn(() => new TestAdmin());
  }
}

class TestConsumer {
  connect:any;
  disconnect: any;
  subscribe: any;
  run: any;
  stop: any;
  pause: any;
  resume: any;
  paused:boolean = false;

  constructor(kafka: TestKafka) {
    this.connect = testFn(() => {
      return new Promise((resolve) => resolve(true));
    });
    this.disconnect = testFn(() => {
      return new Promise((resolve) => resolve(true));
    });
    this.subscribe = testFn((sub) => {
      kafka.subscribers.push({topic: sub.topic, consumer:this });
      return new Promise((resolve) => resolve(true));
    });
    this.run = testFn(options => {
      kafka.subscribers.forEach(c => {
        if(c.consumer === this) c.eachMessage = options.eachMessage;
      });
      return new Promise((resolve) => resolve(true));
    });
    this.stop = testFn(() => {
      return new Promise((resolve) => resolve(true));
    });
    this.pause = testFn(() => {
      this.paused = true;
      return new Promise((resolve) => resolve(true));
    });
    this.resume = testFn(() => {
      this.paused = false;
      return new Promise((resolve) => resolve(true));
    });
  }
}

class TestProducer {
  connect: any;
  disconnect: any;
  send: any;
  partition = 0;
  offsets: {[details: string] : {count?:number}}; //number of times message was sent
    //details and count used to create an hashtable

  constructor(kafka: TestKafka) {
    this.connect = testFn(() => {
      return new Promise((resolve) => resolve(true));
    });
    this.disconnect = testFn(() => {
      return new Promise((resolve) => resolve(true));
    });
    this.offsets = {};

    //defines the send function
    this.send = testFn((msg: Types.KafkaProducerMessageInterface) => {
      try {
        msg.messages.forEach(m => {
          //check if sent for the given topic
          if(!this.offsets[msg.topic]) this.offsets[msg.topic] = {count:0};
          
          for(let i = 0; i < kafka.subscribers.length; i++) {
            const c = kafka.subscribers[i];
            const consumerMsg:Types.KafkaConsumerMessageInterface = {
              topic: msg.topic,
              partition:this.partition,
              offset: this.offsets[msg.topic].count,
              message: m,
            }
            if(typeof(c.topic) === 'string' && c.topic === consumerMsg.topic) {
              c.eachMessage(consumerMsg);
            }
            else if(typeof(c.topic) !== 'string' && consumerMsg.topic.search(c.topic) > -1) {
              c.eachMessage(consumerMsg);
            }
          }
          this.offsets[msg.topic].count++;
          
        });
        return new Promise((resolve) => resolve(true));
      }
      catch(error) {
        console.log('test', 'Caught error in TestProducer.send: ' + error);
        return new Promise((resolve, reject) => reject(error));
      }
    });
  }
}

class TestAdmin {
  connect: any = testFn(() => {
    return new Promise((resolve) => resolve(true));
  });
  disconnect:any = testFn(() => {
    return new Promise((resolve) => resolve(true));
  });;
  listTopics:any = testFn(() => {
    return new Promise((resolve) => resolve(['test-topic']));
  });
  createTopics:any = testFn(() => {
    return new Promise((resolve) => resolve(true));
  });
  deleteTopics:any = testFn(() => {
    return new Promise((resolve) => resolve(true));
  });
}

if(process.env.NODE_ENV !== 'production') test('Can create a test kafka object', () => {
  const kafka = new TestKafka();
  const producer = kafka.producer();
  const consumer = kafka.consumer();
  consumer.subscribe({topic: 'test-topic'});
  consumer.run({eachMessage:testFn()});

  expect(Object.keys(producer.offsets)).toHaveLength(0);
  expect(kafka.subscribers).toHaveLength(1);
  expect(kafka.subscribers[0].topic).toEqual('test-topic');
  expect(kafka.subscribers[0].consumer).toEqual(consumer);
  expect(kafka.subscribers[0].eachMessage).not.toHaveBeenCalled();

  producer.send({
    topic: 'test-topic',
    messages: [{
      value: 'test message',
    }],
  });
  expect(kafka.subscribers[0].eachMessage).toHaveBeenCalled();
  expect(producer.offsets['test-topic'].count).toBe(1);
});

export {
  TestKafka,
  TestConsumer,
  TestProducer,
  TestAdmin,
}