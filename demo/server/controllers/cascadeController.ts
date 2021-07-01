const { Kafka } = require('kafkajs');
const cascade = require('../../../kafka-cascade/index.ts');
import * as Cascade from '../../../kafka-cascade/index';
import {Types as cascadeType} from '../../../kafka-cascade/index';
import CascadeService from '../../../kafka-cascade/src/cascadeService';

const kafka = new Kafka({
  clientId: 'kafka-demo',
  brokers: ['localhost:9092'],
});

const producer = kafka.producer();  

let topic = 'test-topic';
const groupId = 'test-group';
const serviceCB:Cascade.Types.ServiceCallback = (msg, resolve, reject) => {
  const message = msg.messages[0];
  if(message.headers.cascadeMetadata.retries === message.value.retries) resolve(msg);
  else reject(msg);
};
const successCB:Cascade.Types.RouteCallback = (msg) => {
  console.log('Received message in success callback: ' + msg.messages[0].headers.cascadeMetadata.retries);
};
const dlqCB:Cascade.Types.RouteCallback = (msg) => {
  console.log('Received message in DQL');
};

var service: Cascade.CascadeService;

const cascadeController:any = {};

cascadeController.startService = async (req: {query: {retries:string}}, res, next) => {
  try {
    const { retries } = req.query;
    await producer.connect();
    service = await cascade.service(kafka, topic, groupId, serviceCB, successCB, dlqCB);
    console.log('Connected to Kafka server...');
    service.setRetryLevels(5);
    await service.run();
    console.log('Listening to Kafka server...');

    // what do we send back?
    res.locals.confirmation = 'Cascade service connected to Kafka server...';
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
  //req.query => retries and message
  // this middleware function needs to do all of the vanilla kafka stuff to send a message
  topic = req.query.topic || topic;
  const message = req.query.message || 'https://www.youtube.com/watch?v=fNLhxKpfCnA';
  let retries = req.query.retries;

  res.locals = { message, retries };

  // check to see if server is running

  // send message
  await producer.send({
    topic,
    messages: [
      {
        value: res.locals,
      }
    ]
  })
  
  return next();
};

cascadeController.stopService = async (req, res, next) => {
  await producer.disconnect();
  // nothing else to do yet
  return next();
};


export default cascadeController;