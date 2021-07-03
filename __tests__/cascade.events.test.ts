const cascade = require('../kafka-cascade/index');
import * as Types from '../kafka-cascade/src/kafkaInterface';
import { TestKafka } from './cascade.mockclient.test';

console.log = jest.fn();

describe('Basic service tests', () => {
  let kafka: TestKafka;
  let testService: any;

  beforeEach(() => {
    kafka = new TestKafka();
  });

  it('Fires event on service run', async () => {
    testService = await cascade.service(kafka, 'test-topic', 'test-group', jest.fn(), jest.fn(), jest.fn());
    const callbackTest = jest.fn();
    testService.on('run', callbackTest);
    await testService.run();
    expect(callbackTest).toHaveBeenCalled();
  });

  it('Throws an error when an unknown event type is registered', async () => {
    testService = await cascade.service(kafka, 'test-topic', 'test-group', jest.fn(), jest.fn(), jest.fn());
    const callbackTest = jest.fn();
    expect(() => testService.on('nothing', callbackTest)).toThrowError();
    expect(callbackTest).not.toHaveBeenCalled();
  });

  it('Fires connect/disconnect events', async () => {
    testService = await cascade.service(kafka, 'test-topic', 'test-group', jest.fn(), jest.fn(), jest.fn());
    const callbackTest = jest.fn();
    testService.on('connect', callbackTest);
    testService.on('disconnect', callbackTest);
    await testService.connect();
    await testService.disconnect();
    expect(callbackTest).toHaveBeenCalledTimes(2);
  });

  it('Fires pause/resume events', async () => {
    testService = await cascade.service(kafka, 'test-topic', 'test-group', jest.fn(), jest.fn(), jest.fn());
    const callbackTest = jest.fn();
    testService.on('pause', callbackTest);
    testService.on('resume', callbackTest);
    await testService.pause();
    expect(testService.paused()).toBe(true);
    await testService.resume();
    expect(testService.paused()).toBe(false);
    expect(callbackTest).toHaveBeenCalledTimes(2);
  });

  // it('Fires stop events', async () => {

  // });

  it('Fires receive when new message comes in', async () => {
    testService = await cascade.service(kafka, 'test-topic', 'test-group', jest.fn(), jest.fn(), jest.fn());
    const callbackTest = jest.fn();
    testService.on('receive', callbackTest);
    await testService.connect();
    await testService.run();
    const producer = kafka.producer();
    await producer.send({
      topic: 'test-topic',
      messages: [{
        value: 'test message',
      }],
    });

    expect(callbackTest).toHaveBeenCalled();
  });

  it('Fires success/retry/dlq with the message route', async () => {
    const serviceAction = (msg, resolve, reject) => {
      const {retries} = JSON.parse(msg.message.value);
      const header = JSON.parse(msg.message.headers.cascadeMetadata);
      if(header.retries === retries) resolve(msg);
      else reject(msg);
    };

    testService = await cascade.service(kafka, 'test-topic', 'test-group', serviceAction, jest.fn(), jest.fn());
    const retryCallback = jest.fn();
    testService.on('retry', retryCallback);
    const successCB = jest.fn();
    testService.on('success', successCB);
    const dlqCB = jest.fn();
    testService.on('dlq', dlqCB);

    await testService.setRetryLevels(3);
    await testService.connect();
    await testService.run();

    const producer = kafka.producer();
    await producer.send({
      topic: 'test-topic',
      messages: [{
        value: JSON.stringify({retries:0}),
      }],
    });

    await producer.send({
      topic: 'test-topic',
      messages: [{
        value: JSON.stringify({retries:2}),
      }],
    });

    await producer.send({
      topic: 'test-topic',
      messages: [{
        value: JSON.stringify({retries:-1}),
      }],
    });

    expect(successCB).toHaveBeenCalledTimes(2);
    expect(dlqCB).toHaveBeenCalledTimes(1);
    expect(retryCallback).toHaveBeenCalledTimes(5);
  });
});