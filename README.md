[![npm version](https://img.shields.io/npm/v/kafka-cascade?color=%2344cc11&label=stable)](https://www.npmjs.com/package/kafkajs)

<p align="center">

  <h3 align="center">Kafka Cascade</h3>

  <p align="center">
    A lightweight npm library for KafkaJS message reprocessing
  </p>
</p>

## Table of Contents

- [About](#about)
  - [Features](#features)
  - [Getting Started](#getting-started)
    - [Usage](#usage)
- [Authors](#authors)
    

## <a name="about"></a> About Kafka Cascade

Kafka Cascade is a lightweight npm library for [KafkaJS](https://kafka.js.org/), a modern [Apache Kafka](https://kafka.apache.org/) client for Node.js.

Kafka Cascade provides user-configurable retry strategies for reprocessing messages, allowing developers to decide how to handle retries and when messages should be sent to the dead letter queue (DLQ).

<small>KAFKA is a registered trademark of The Apache Software Foundation. Kafka Cascade has no affiliation with and is not endorsed by The Apache Software Foundation.</small>


### <a name="features"></a> Features

* Retry Strategies
  1. Fast Retry
  2. Timeout Retry
  3. Batching Retry
* All retry strategies are user-configurable



### <a name="getting-started"></a> Getting Started

```sh
npm install kafka-cascade
# yarn add kafka-cascade
```

### <a name="usage"></a> Usage

KafkaJS objects should be wrapped in the Kafka Cascade CascadeService. The user should provide the topic, groupId, and the callbacks to be invoked upon successfully delivery a message or when a message ends up in the DLQ.

```javascript
var service: Cascade.CascadeService;
service = await cascade.service(kafka, topic, groupId, serviceCB, successCB, dlqCB)
```

## <a name="authors"></a> Authors
---
#### [Michael Weber](https://github.com/michaelweberjr)
#### [Davette Bryan](https://github.com/Davette-Bryan)
#### [Seung Joon Lee](https://github.com/GnuesJ)
#### [Robert Du](https://github.com/robertcdu)