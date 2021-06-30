const cascade = require('../../dist/kafka-cascade/index.js');

const service = cascade.service({}, 'test-topic', 'test-group', ()=>null, ()=>null);

console.log(service); // npx node "./demo/server/server.js":