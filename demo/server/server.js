const cascade = require('../../dist/kafka-cascade/index.js');

const service = cascade.service({}, 'test-topic', ()=>null, ()=>null);

console.log(service); // npx node "./demo/server/server.js"