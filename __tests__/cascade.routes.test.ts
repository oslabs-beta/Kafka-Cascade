const cascade = require('../kafka-cascade/index');
import * as Types from '../kafka-cascade/src/kafkaInterface';
import { TestKafka } from './cascade.mockclient.test';


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

    await testService.setRoute('timeout', 0);
    await testService.connect();
    await testService.run();

    const producer = kafka.producer();
    const messageCount = 10;
    for(let i = 0; i < messageCount; i++) {
      await producer.send({
        topic: 'test-topic',
        messages: [{
          value: 'test message',
        }],
      });
    }

    expect(producer.offsets['test-topic'].count).toBe(messageCount);
    const testServiceOffsets = testService.producer.producer.offsets;
    expect(Object.keys(testServiceOffsets)).toHaveLength(0);
    for(let topic in testServiceOffsets) {
      expect(testServiceOffsets[topic].count).toBe(messageCount);
    }
    expect(dlq).toHaveBeenCalledTimes(messageCount);
  });

  it('Uses default route when status is unknown', async () => {
    const serviceAction = (msg: Types.KafkaConsumerMessageInterface, resolve: any, reject: any) => {
      reject(msg, 'test-route');
    }
    const dlq = jest.fn();

    testService = await cascade.service(kafka, 'test-topic', 'test-group', serviceAction, jest.fn(), dlq);
    const retryLevels = 5;
    await testService.setDefaultRoute(retryLevels);

    await testService.connect();
    await testService.run();

    const producer = kafka.producer();
    const messageCount = 10;

    for(let i = 0; i < messageCount; i++) {
      await producer.send({
        topic: 'test-topic',
        messages: [{
          value: 'test message',
        }],
      });
    }

    expect(producer.offsets['test-topic'].count).toBe(messageCount);
    const testServiceOffsets = testService.producer.producer.offsets;
    expect(Object.keys(testServiceOffsets)).toHaveLength(retryLevels);
    for(let topic in testServiceOffsets) {
      expect(testServiceOffsets[topic].count).toBe(messageCount);
    }
    expect(dlq).toHaveBeenCalledTimes(messageCount);
  });

  it('Can create route with multiple levels', async () => {
    const serviceAction = (msg: Types.KafkaConsumerMessageInterface, resolve: any, reject: any) => {
      reject(msg, 'test-route');
    }
    const dlq = jest.fn();

    testService = await cascade.service(kafka, 'test-topic', 'test-group', serviceAction, jest.fn(), dlq);
    const retryLevels = 5;
    await testService.setDefaultRoute(retryLevels);

    const routeLevels = 3;
    await testService.setRoute('test-route', routeLevels);
    await testService.connect();
    await testService.run();

    const producer = kafka.producer();
    const messageCount = 10;
    for(let i = 0; i < messageCount; i++) {
      await producer.send({
        topic: 'test-topic',
        messages: [{
          value: 'test message',
        }],
      });
    }

    expect(producer.offsets['test-topic'].count).toBe(messageCount);
    const testServiceOffsets = testService.producer.producer.offsets;
    expect(Object.keys(testServiceOffsets)).toHaveLength(routeLevels);
    for(let topic in testServiceOffsets) {
      expect(testServiceOffsets[topic].count).toBe(messageCount);
      expect(topic.search(new RegExp(/route-test-route/))).not.toBe(-1);
    }
    expect(dlq).toHaveBeenCalledTimes(messageCount);
  });

  it('Can generate all of the kafka topics', async () => {
    testService = await cascade.service(kafka, 'test-topic', 'test-group', jest.fn(), jest.fn(), jest.fn());
    const retryLevels = 5;
    await testService.setDefaultRoute(retryLevels);

    const routeLevels = 3;
    await testService.setRoute('test-route', routeLevels);

    const topics = testService.getKafkaTopics();
    expect(topics).toHaveLength(retryLevels + routeLevels);
  });
});