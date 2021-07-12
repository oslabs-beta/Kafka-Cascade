const cascade = require('../kafka-cascade/index');
import * as Types from '../kafka-cascade/src/kafkaInterface';
import { TestKafka } from './cascade.mockclient.test';

// const log = console.log;
// console.log = (test, ...args) => test === 'test' && log(args); 
console.log = jest.fn();
process.env.test = 'test';

describe('Routes Tests', () => {
  let kafka: TestKafka;
  let testService: any;

  beforeEach(() => {
    kafka = new TestKafka();
  });

  it('Can create a route', async () => {
    const serviceAction = (msg: Types.KafkaConsumerMessageInterface, resolve: any, reject: any) => {
        reject(msg, 'timeout');
    }
    const dlq = jest.fn();

    testService = await cascade.service(kafka, 'test-topic', 'test-group', serviceAction, jest.fn(), dlq);
    const retryLevels = 5;
    await testService.setDefaultRoute(retryLevels);
    // create test route
    await testService.setRoute('timeout', 0);
    await testService.connect();
    await testService.run();

    const producer = kafka.producer();
    const messageCount = 10;
    //mimics sending message for the producer
    for(let i = 0; i < messageCount; i++) {
      await producer.send({
        topic: 'test-topic',
        messages: [{
          value: 'test message',
        }],
      });
    }

    //checks the number of times the message was sent
    expect(producer.offsets['test-topic'].count).toBe(messageCount);
    const testServiceOffsets = testService.producer.producer.offsets;
    // since every request should have failed, offsets should equal retryLevels
    expect(Object.keys(testServiceOffsets)).toHaveLength(0);
    // each level should have sent a number of messages equal to messageCount
    for(let topic in testServiceOffsets) {
      expect(testServiceOffsets[topic].count).toBe(messageCount);
    }
    expect(dlq).toHaveBeenCalledTimes(messageCount);//dlq should be the same as the messagecount
  });

  it('Uses default route when status is unknown', async () => {
    const serviceAction = (msg: Types.KafkaConsumerMessageInterface, resolve: any, reject: any) => {
      reject(msg, 'test-route');
    }
    const dlq = jest.fn();

    testService = await cascade.service(kafka, 'test-topic', 'test-group', serviceAction, jest.fn(), dlq);
    const retryLevels = 5;
    await testService.setDefaultRoute(retryLevels);
    // create test route
    await testService.connect();
    await testService.run();

    const producer = kafka.producer();
    const messageCount = 10;
    //mimics sending message for the producer
    for(let i = 0; i < messageCount; i++) {
      await producer.send({
        topic: 'test-topic',
        messages: [{
          value: 'test message',
        }],
      });
    }

    //checks the number of times the message was sent
    expect(producer.offsets['test-topic'].count).toBe(messageCount);
    const testServiceOffsets = testService.producer.producer.offsets;
    // since every request should have failed, offsets should equal retryLevels
    expect(Object.keys(testServiceOffsets)).toHaveLength(retryLevels);
    // each level should have sent a number of messages equal to messageCount
    for(let topic in testServiceOffsets) {
      expect(testServiceOffsets[topic].count).toBe(messageCount);
    }
    expect(dlq).toHaveBeenCalledTimes(messageCount);//dlq should be the same as the messagecount
  });

  it('Can create route with multiple levels', async () => {
    const serviceAction = (msg: Types.KafkaConsumerMessageInterface, resolve: any, reject: any) => {
      reject(msg, 'test-route');
    }
    const dlq = jest.fn();

    testService = await cascade.service(kafka, 'test-topic', 'test-group', serviceAction, jest.fn(), dlq);
    const retryLevels = 5;
    await testService.setDefaultRoute(retryLevels);
    // create test route
    const routeLevels = 3;
    await testService.setRoute('test-route', routeLevels);
    await testService.connect();
    await testService.run();

    const producer = kafka.producer();
    const messageCount = 10;
    //mimics sending message for the producer
    for(let i = 0; i < messageCount; i++) {
      await producer.send({
        topic: 'test-topic',
        messages: [{
          value: 'test message',
        }],
      });
    }

    //checks the number of times the message was sent
    expect(producer.offsets['test-topic'].count).toBe(messageCount);
    const testServiceOffsets = testService.producer.producer.offsets;
    // since every request should have failed, offsets should equal retryLevels
    expect(Object.keys(testServiceOffsets)).toHaveLength(routeLevels);
    // each level should have sent a number of messages equal to messageCount
    for(let topic in testServiceOffsets) {
      expect(testServiceOffsets[topic].count).toBe(messageCount);
      expect(topic.search(new RegExp(/route-test-route/))).not.toBe(-1);
    }
    expect(dlq).toHaveBeenCalledTimes(messageCount);//dlq should be the same as the messagecount
  });
});