const cascade = require('../kafka-cascade/index');
import * as Types from '../kafka-cascade/src/kafkaInterface';
import { TestKafka } from './cascade.mockclient.test';

const log = console.log;
console.log = (test, ...args) => test === 'test' && log(args); 
// console.log = jest.fn();
process.env.test = 'test';

describe('Cascade Metadata', () => {
  let kafka: TestKafka;
  let testService: any;

  beforeEach(() => {
    kafka = new TestKafka();
  });

  it('Can parse metadata', async () => {
    const fn = cascade.getMetadata;
    cascade.getMetadata = jest.fn(fn);

    const serviceAction = (msg: Types.KafkaConsumerMessageInterface, resolve: any, reject: any) => {
      const metadata = cascade.getMetadata(msg);
      resolve(msg);
    }

    const dlq = jest.fn();

    testService = await cascade.service(kafka, 'test-topic', 'test-group', serviceAction, jest.fn(), dlq);
    await testService.connect();
    await testService.run();

    const producer = kafka.producer();
    await producer.send({
      topic: 'test-topic',
      messages: [{
        value: 'test message',
      }],
    });

    expect(cascade.getMetadata).toHaveBeenCalled();
    expect(cascade.getMetadata).toHaveReturnedWith({status:'', retries:0, topicArr:[]});
  });

  it('Returns undefined on bad data', () => {
    const metadata = cascade.getMetadata({topic:'test-topic', offset:-1, partition:-1, 'message':{value:'test'}});
    expect(metadata).toBeUndefined();
  });
});