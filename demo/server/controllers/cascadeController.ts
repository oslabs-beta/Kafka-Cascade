const { Kafka } = require('kafkajs');
const cascade = require('../../../kafka-cascade/index');
import * as Cascade from '../../../kafka-cascade/index';
import socket from '../websocket';
import { TestKafka } from '../../../__tests__/cascade.mockclient.test'

var kafka: Cascade.Types.KafkaInterface;
const brokers = process.env.KAFKA_BROKER_2 !== 'false' ? [process.env.KAFKA_BROKER_1, process.env.KAFKA_BROKER_2] : [process.env.KAFKA_BROKER_1];
if(process.env.DEMO === 'true') {
  kafka = new TestKafka();
}
else kafka = new Kafka({
  clientId: 'kafka-demo',
  brokers,
});
console.log('Brokers:', brokers);

const users: { [index: string]: { 
  retryLevels:number, 
  levelCounts:number[], 
  topic:string, 
  producer:Cascade.Types.ProducerInterface,
  service:Cascade.CascadeService,
  messageRate:number,
} } = {};

// serviceCB simulates a realworld service by using the success value of the message to resolve or reject
const serviceCB:Cascade.Types.ServiceCallback = (msg, resolve, reject) => {
  const message = JSON.parse(msg.message.value);
  const metadata = cascade.getMetadata(msg);
  if(!users[message.key] || metadata.retries > users[message.key].retryLevels) return;

  if(Math.random() < message.success) resolve(msg);
  else reject(msg);
};


const successCB:Cascade.Types.RouteCallback = (msg) => {
  const message = JSON.parse(msg.message.value);
  const metadata = cascade.getMetadata(msg);
  if(users[message.key])
    users[message.key].levelCounts[metadata.retries]++;
};
const dlqCB:Cascade.Types.RouteCallback = (msg) => {
  const message = JSON.parse(msg.message.value);
  const user = users[message.key];
  if(users[message.key])
    user.levelCounts[user.levelCounts.length - 1]++;
};

var service: Cascade.CascadeService;

const startService = (key:string, retryLevels:number, options?: {timeoutLimit?:number[], batchLimit?:number[]}):Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = { 
        retryLevels, 
        levelCounts: (new Array(retryLevels+2)).fill(0), 
        topic: 'test-topic-' + Array.from(key).filter(c => isAlphaNum(c)).join(''),
        producer: kafka.producer(),
        service: null,
        messageRate: 1,
      }
      users[key] = user;
      user.service = await cascade.service(kafka, user.topic, 'test-group-' + key, serviceCB, successCB, dlqCB);
      user.service.on('serviceError', (error) => console.log(error));
      user.service.on('error', (error) => console.log(error));
      user.service.on('error', (error) => console.log(error));
      await user.service.setDefaultRoute(retryLevels, options);
      
      await user.service.connect();
      await user.producer.connect();
      console.log(`Connected ${key} to Kafka server...`);
      await user.service.run();
      console.log(`${key} listening to Kafka server...`);
      resolve(true);
    }
    catch(error) {
      reject(error);
    }
  });
}

const isAlphaNum = (c:string) => {
  let code = c.charCodeAt(0);
  return (code >= 'a'.charCodeAt(0) && code <= 'z'.charCodeAt(0)) ||  (code >= 'A'.charCodeAt(0) && code <= 'Z'.charCodeAt(0)) || (code >= '0'.charCodeAt(0) && code <= '9'.charCodeAt(0));
}

const stopService = async (key:string) => {
  try {
    await users[key].producer.disconnect();
    await users[key].service.disconnect();
  }
  catch(error) {
    console.log(error);
  }
  users[key] = undefined;
}

const pauseService = async(key:string) => {
  if(!users[key].service.paused()){
    await users[key].service.pause();
  }
}

const resumeService = async(key:string) => {
  if(users[key].service.paused()){
    await users[key].service.resume();
  }
}

// start websocket functionality
const sendMessageContinuous = async (key:string ) => {
  if(!users[key]) return;

  if(!users[key].service.paused()) {
    users[key].producer.send({
      topic: users[key].topic,
      messages: [{
          value: JSON.stringify({success: 0.3, key}),
      }],
    })
    .catch(error => console.log('Error in sendMessageContinuous:', error));
  }

  setTimeout(() => sendMessageContinuous(key), Math.round(1/users[key].messageRate * 1000));
};

socket.use('start', async (req, res) => {
  try {
    console.log(`Received start request from ${res.conn.key}`);
    console.log(req);
    if(!service) {
      await startService(res.conn.key, req.retries, req.options);
      sendMessageContinuous(res.conn.key);
    }
  }
  catch(error) {
    console.log(error);
  }
});

socket.use('stop', (req, res) => {
  console.log(`Received stop request from ${res.conn.key}`);
  if(users[res.conn.key]) {
    stopService(res.conn.key);
  }
});

socket.use('pause', (req, res) => {
  console.log(`Received pause request from ${res.conn.key}`);
  if(users[res.conn.key]) {
    pauseService(res.conn.key);
  }
})

socket.use('resume', (req, res) => {
  console.log(`Received resume request from ${res.conn.key}`);
  if(users[res.conn.key]){
    resumeService(res.conn.key);
  }
})

socket.use('close', async (req, res) => {
  if(users[res.conn.key]) stopService(res.conn.key); 
  console.log('Closed connection with:', res.conn.key);

  try {
    if(socket.server.connections.length === 0) {
      console.log('There are no active connections, cleaning up space...');
      const admin = kafka.admin();
      await admin.connect();
      const topics = await admin.listTopics();
      console.log('Topics to be delete:', topics)
      await admin.deleteTopics({topics});

      await admin.disconnect();
      console.log('Finished cleanup...');
    }
  }
  catch(error) {
    console.log('Error in deleting topics:', error);
  }
});

socket.use('set_rate', (req, res) => {
  if(users[res.conn.key])
    users[res.conn.key].messageRate = req.rate;
});

export const heartbeat = () => {
  for(let conn in socket.server.connections) {
    const c = socket.server.connections[conn];
    let levelCounts:number[] = [];
    if(users[c.key]) {
      if(users[c.key].retryLevels + 2 !== users[c.key].levelCounts.length) {
        console.log(users[c.key].retryLevels + 2, ':', users[c.key].levelCounts.length);
      }
      levelCounts = users[c.key].levelCounts;
    }

    c.send(JSON.stringify({
      type: 'heartbeat', 
      payload: {
        levelCounts,
      }
    }));
  }

  setTimeout(heartbeat, 100);
};
