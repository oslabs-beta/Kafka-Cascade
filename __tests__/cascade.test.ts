const cascade = require('../kafka-cascade/index');
import * as Types from '../kafka-cascade/src/kafkaInterface';
import { TestKafka } from './cascade.mockclient.test';


console.log = jest.fn();
process.env.test = 'test';

describe('Basic service tests', () => {
  let kafka: TestKafka;
  let testService: any;

  beforeEach(() => {
    kafka = new TestKafka();
  });

  it('Can create an empty service object', async () => {
    testService = await cascade.service(kafka, 'test-topic', 'test-group', jest.fn(), jest.fn(), jest.fn());
    expect(testService.retries).toBe(0);
  });

  it('All messages end up in DLQ when service is always fail', async () => {
    const serviceAction = (msg: Types.KafkaConsumerMessageInterface, resolve: any, reject: any) => {
      try {
        reject(msg);
      }
      catch(error) {
        console.log('Caught error in service CB: ' + error);
      }
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

  it('All messages succeed when retries is 1', async () => {
    const serviceAction = (msg: Types.KafkaConsumerMessageInterface, resolve: any, reject: any) => {
      const { retries, status } = JSON.parse(msg.message.headers.cascadeMetadata);
      if(retries === 1) {
        resolve(msg);
      }
      else reject(msg);
    }

    const success = jest.fn();
    const dlq = jest.fn();

    testService = await cascade.service(kafka, 'test-topic', 'test-group', serviceAction, success, dlq);
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
    const testServerOffsets = testService.producer.producer.offsets;
    expect(Object.keys(testServerOffsets)).toHaveLength(1);
    expect(testServerOffsets['test-topic-cascade-retry-1'].count).toBe(messageCount);
    expect(success).toHaveBeenCalledTimes(messageCount);
    expect(dlq).toHaveBeenCalledTimes(0);
  });
});
