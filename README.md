[![npm version](https://img.shields.io/npm/v/kafka-cascade?color=%2344cc11&label=stable)](https://www.npmjs.com/package/kafka-cascade)

<p align="center">

  <h3 align="center">Kafka Cascade</h3>

  <div align="center">
  <a href="https://kafka-cascade.io">
      <img src="./demo/assets/favIconLarger.png" alt="Logo" width="100" height="110">
  </a>
  </div>

  <p align="center">
    A lightweight npm library for KafkaJS message reprocessing
  <br />
  <a href="https://kafka-cascade.io"><strong>Demo and Docs »</strong></a>
  </p>
</p>

---

## Table of Contents

- [About](#about)
  - [Features](#features)
  - [Getting Started](#getting-started)
  - [Usage](#usage)
- [Authors](#authors)

---    

## <a name="about"></a> About Kafka Cascade

Kafka Cascade is a lightweight npm library for [KafkaJS](https://kafka.js.org/), a modern [Apache Kafka](https://kafka.apache.org/) client for Node.js.

Kafka Cascade wraps around KafkaJS objects to provide a user-configurable service for reprocessing messages, allowing developers to decide how to handle retries and when messages should be sent to the dead letter queue (DLQ).

<small>KAFKA is a registered trademark of The Apache Software Foundation. Kafka Cascade has no affiliation with and is not endorsed by The Apache Software Foundation. Kafka Cascade was developed separately from KafkaJS and is not affiliated with KafkaJS</small>


### <a name="features"></a> Features

* Retry Strategies
  1. Fast Retry - a default strategy that will resend messages as quickly as the runtime will allow, up to a user-defined limit
  2. Timeout Retry - specifies how long to wait before resending a message based on retry level
  3. Batching Retry - specifies how many messages the producer should wait for before sending all of the messages to be retried at once
* All retry strategies are user-configurable


### <a name="getting-started"></a> Getting Started

```sh
npm install kafka-cascade
# yarn add kafka-cascade
```


### <a name="usage"></a> Usage

KafkaJS objects should be wrapped in the Kafka Cascade CascadeService. The user will provide the topic, groupId, and the callbacks to be invoked upon successfully delivery a message or when a message ends up in the DLQ. For more details, please see the [documentation](https://kafka-cascade.io/doc).

```javascript
var service: Cascade.CascadeService;
service = await cascade.service(kafka, topic, groupId, serviceCB, successCB, dlqCB)
```
---

### <a name="authors"></a> Authors

##### [Michael Weber](https://github.com/michaelweberjr)
##### [Davette Bryan](https://github.com/Davette-Bryan)
##### [Seung Joon Lee](https://github.com/GnuesJ)
##### [Robert Du](https://github.com/robertcdu)