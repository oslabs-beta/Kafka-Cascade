const cascade = require('../kafka-cascade/index');
import * as Types from '../kafka-cascade/kafkaInterface';

class TestKafka {
  subscribers: any[];
  consumer: any;
  producer: any;

  constructor() {
    this.subscribers = [];
    this.consumer = jest.fn(() => new TestConsumer(this));
    this.producer = jest.fn(() => new TestProducer(this));
  }
}

class TestConsumer {
  kafka: TestKafka;
  connect:any;
  disconnect: any;
  subscribe: any;
  run: any;

  constructor(kafka: TestKafka) {
    this.kafka = kafka;
    this.connect = jest.fn();
    this.disconnect = jest.fn();
    this.subscribe = jest.fn((sub) => {
      kafka.subscribers.push({topic: sub.topic, consumer:this });
    });
    this.run = jest.fn(options => {
      kafka.subscribers.forEach(c => {
        if(c.consumer === this) c.eachMessage = options.eachMessage;
      });
    });
  }
}

class TestProducer {
  kafka: TestKafka;
  connect: any;
  disconnect: any;
  send: any;
  partition = 0;
  offsets: {[details: string] : {count?:number}};

  constructor(kafka: TestKafka) {
    this.kafka = kafka;
    this.connect = jest.fn();
    this.disconnect = jest.fn();
    this.offsets = {};

    this.send = jest.fn((msg: {topic:string, messages:[{value:object}], offset?:number, partition?:number}) => {
      if(!this.offsets[msg.topic]) this.offsets[msg.topic] = {count:0};
      msg.offset = this.offsets[msg.topic].count++;
      msg.partition = this.partition;

      kafka.subscribers.forEach(c => {
        if(typeof(c.topic) === 'string' && c.topic === msg.topic) {
          c.eachMessage(msg);
        }
        else if(msg.topic.search(c.topic) > -1) {
          c.eachMessage(msg);
        }
      });
    });
  }
}

test('Can create a test kafka object', () => {
  const kafka = new TestKafka();
  const producer = kafka.producer();
  const consumer = kafka.consumer();
  consumer.subscribe({topic: 'test-topic'});
  consumer.run({eachMessage:jest.fn()});

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

describe('Basic service tests', () => {
  let kafka: TestKafka;
  let testService: any;

  beforeEach(() => {
    kafka = new TestKafka();
  });

  it('Can create an empty service object', async () => {
    testService = await cascade.service(kafka, 'test-topic', jest.fn(), jest.fn(), jest.fn());
    expect(testService.retries).toBe(0);
  });

  it('All messages end up in DLQ when service is always fail', async () => {
    const serviceAction = (msg: any, resolve: any, reject: any) => {
      msg.header.status = 'failed';
      reject(msg);
    }

    const dlq = jest.fn();

    testService = await cascade.service(kafka, 'test-topic', serviceAction, jest.fn(), dlq);
    testService.setRetryLevels(5);
    await testService.run();

    const producer = kafka.producer();
    for(let i = 0; i < 100; i++) {
      producer.send({
        topic: 'test-topic',
        messages: [{
          value: 'test message',
        }],
      });
    }

    expect(producer.offsets['test-topic'].count).toBe(100);
    const testServerOffsets = testService.producer.producer.offsets;
    expect(Object.keys(testServerOffsets)).toHaveLength(5);
    for(let topic in testServerOffsets) {
      expect(testServerOffsets[topic].count).toBe(100);
    }
    expect(dlq).toHaveBeenCalledTimes(100);
  });

  it('All messages succeed when retryCount is 1', async () => {
    const serviceAction = (msg: any, resolve: any, reject: any) => {
      if(msg.header.retryCount === 1) {
        msg.header.status = 'success';
        resolve(msg);
      }
      else reject(msg);
    }

    const success = jest.fn();

    testService = await cascade.service(kafka, 'test-topic', serviceAction, success);
    testService.setRetryLevels(5);
    await testService.run();

    const producer = kafka.producer();
    for(let i = 0; i < 100; i++) {
      producer.send({
        topic: 'test-topic',
        messages: [{
          value: 'test message',
        }],
      });
    }

    expect(producer.offsets['test-topic'].count).toBe(100);
    const testServerOffsets = testService.producer.producer.offsets;
    expect(Object.keys(testServerOffsets)).toHaveLength(5);
    for(let topic in testServerOffsets) {
      if(topic === 'test-topic-cascade-retry-1') expect(testServerOffsets[topic].count).toBe(100);
      else expect(testServerOffsets[topic].count).toBe(0);
    }
    expect(success).toHaveBeenCalledTimes(100);
  });
});
