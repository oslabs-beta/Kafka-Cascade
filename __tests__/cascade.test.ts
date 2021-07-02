const cascade = require('../kafka-cascade/index');
import * as Types from '../kafka-cascade/src/kafkaInterface';
import { TestKafka } from './kafkaMockClient';

console.log = jest.fn();

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
    //used to ask how dlq was used
    const dlq = jest.fn();

    testService = await cascade.service(kafka, 'test-topic', 'test-group', serviceAction, jest.fn(), dlq);
    const retryLevels = 5;
    await testService.setRetryLevels(retryLevels);
    await testService.connect();
    await testService.run();

    const producer = kafka.producer();
    const messageCount = 1;
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

  it('All messages succeed when retries is 1', async () => {
    const serviceAction = (msg: Types.KafkaConsumerMessageInterface, resolve: any, reject: any) => {
      //set it to succeed after 1 retry
      const { retries, status } = JSON.parse(msg.message.headers.cascadeMetadata);
      if(retries === 1) {
        // status = 'success';
        resolve(msg);
      }
      else reject(msg);
    }

    const success = jest.fn();
    const dlq = jest.fn();

    testService = await cascade.service(kafka, 'test-topic', 'test-group', serviceAction, success, dlq);
    const retryLevels = 5;
    await testService.setRetryLevels(retryLevels);
    await testService.connect();
    await testService.run();

    const producer = kafka.producer();
    const messageCount = 1;
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
