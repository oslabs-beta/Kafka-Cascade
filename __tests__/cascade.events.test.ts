const cascade = require('../kafka-cascade/index');
import * as Types from '../kafka-cascade/src/kafkaInterface';
import { TestKafka } from './cascade.mockclient.test';

const log = console.log;
console.log = (test, ...args) => test === 'test' && log(args); 
// console.log = jest.fn();
process.env.test = 'test';

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

  it('Fires stop events', async () => {
    const retryLevels = 3;
    const messageCount = 5;
    const dlq = jest.fn();
    const service = (msg, resolve, reject) => reject(msg);
    testService = await cascade.service(kafka, 'test-topic', 'test-group', service, jest.fn(), dlq);
    const callbackTest = jest.fn();
    testService.on('stop', callbackTest);

    await testService.setDefaultRoute(retryLevels, { batchLimit:(new Array(2)).fill(messageCount) } );
    await testService.connect();
    await testService.run();

    const producer = kafka.producer();
    for(let i = 0; i < messageCount - 1; i++) {
      await producer.send({
        topic: 'test-topic',
        messages: [{
          value: 'test message',
        }],
      });
    }
    try {
      await testService.stop();
    }
    catch(error) {
      console.log('test', 'caught an error while sending:', error);
    }

    expect(callbackTest).toHaveBeenCalled();
    testService.producer.routes[0].levels.forEach(level => {
      expect(level.messages).toHaveLength(0);
    });
    const testServiceOffsets = testService.producer.producer.offsets;
    expect(Object.keys(testServiceOffsets)).toHaveLength(0);
    expect(dlq).toHaveBeenCalledTimes(messageCount - 1);
  });

  it('Fires receive when new message comes in', async () => {
    testService = await cascade.service(kafka, 'test-topic', 'test-group', jest.fn(), jest.fn(), jest.fn());
    const callbackTest = jest.fn();
    testService.on('receive', callbackTest);
    await testService.connect();
    await testService.run();
    const producer = kafka.producer();
    try {
      await producer.send({
        topic: 'test-topic',
        messages: [{
          value: 'test message',
        }],
      });
    }
    catch(error) {
      console.log('test', 'caught an error while sending:', error);
    }

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

    await testService.setDefaultRoute(3);
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

  it('Fires a serviceError if the service CB throws', async () => {
    const retryLevels = 1;
    const messageCount = 1;
    const service = (msg, resolve, reject) => { throw 'test error' };
    testService = await cascade.service(kafka, 'test-topic', 'test-group', service, jest.fn(), jest.fn());
    const callbackTest = jest.fn();
    testService.on('serviceError', callbackTest);

    await testService.setDefaultRoute(retryLevels);
    await testService.connect();
    await testService.run();

    const producer = kafka.producer();
    for(let i = 0; i < messageCount; i++) {
      await producer.send({
        topic: 'test-topic',
        messages: [{
          value: 'test message',
        }],
      });
    }

    expect(callbackTest).toHaveBeenCalled();
  });
});