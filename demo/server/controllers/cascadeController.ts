 const { Kafka } = require('kafkajs');
const cascade = require('../../../kafka-cascade/index.ts');
import * as Cascade from '../../../kafka-cascade/index';

const kafka = new Kafka({
  clientId: 'kafka-demo',
  brokers: ['localhost:9092'],
});

const producer = kafka.producer();  

let topic = 'demo-topic';
const groupId = 'test-group';
const serviceCB:Cascade.Types.ServiceCallback = (msg, resolve, reject) => {
  const message = JSON.parse(msg.message.value);
  const header = JSON.parse(msg.message.headers.cascadeMetadata);
  console.log(`Received message ${msg.topic} in service callback: resolve at ${message.retries}, currently at ${header.retries} ((${Date.now() - message.time}ms))`);
  
  if(header.retries === message.retries) resolve(msg);
  else reject(msg);
};
const successCB:Cascade.Types.RouteCallback = (msg) => {
  const { time } = JSON.parse(msg.message.value);
  const retries = JSON.parse(msg.message.headers.cascadeMetadata).retries
  console.log(`Received message in success callback: ${retries} (${Date.now() - time}ms)`);
};
const dlqCB:Cascade.Types.RouteCallback = (msg) => {
  const { time } = JSON.parse(msg.message.value);
  console.log(`Received message in DLQ (${Date.now() - time}ms)`);
};

var service: Cascade.CascadeService;

const cascadeController:any = {};

cascadeController.startService = async (req: {query: {retries:string}}, res, next) => {
  try {
    const { retries } = req.query;
    service = await cascade.service(kafka, topic, groupId, serviceCB, successCB, dlqCB);
    await service.setRetryLevels(6, [500, 1000, 2000, 4000, 8000, 16000]);
    
    await service.connect();
    await producer.connect();
    console.log('Connected to Kafka server...');
    await service.run();
    console.log('Listening to Kafka server...');

    // what do we send back?
    res.locals.confirmation = 'Cascade service is connecting to Kafka server...';
    return next();
  }
  catch(error) {
    return next({
      log: 'Error in cascadeController.startService: ' + error,
      message: 'Error in cascadeController.startService, check the log',
    });
  }
};

cascadeController.sendMessage = async (req, res, next) => {
  try {
    topic = req.query.topic || topic;
    const message = req.query.message || 'https://www.youtube.com/watch?v=fNLhxKpfCnA';
    let retries = req.query.retries;
    //TODO: add delayTime on to the argument
    res.locals = { message, retries: Number(retries), time: (new Date()).valueOf() };

    // check to see if server is running

    // send message
    await producer.send({
      topic,
      messages: [
        {
          value: JSON.stringify(res.locals),
        }
      ]
    })
    
    return next();
  }
  catch(error) {
    return next({
      log: 'Error in cascadeController.sendMessage: ' + error,
      message: 'Error in cascadeController.sendMessage, check the log',
    });
  }
};

cascadeController.stopService = async (req, res, next) => {
  try {
    await producer.disconnect();
    // nothing else to do yet
    return next();
  }
  catch(error) {
    return next({
      log: 'Error in cascadeController.stopService: ' + error,
      message: 'Error in cascadeController.stopService, check the log',
    });
  }
};


export default cascadeController;