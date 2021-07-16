"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { Kafka } = require('kafkajs');
// kafka object to create producer and consumer
// service callback
// dlq callback -> provide default
// success callback
// topic
// retry producer
// topic consumer
// retry levels -> provide default
// retry strategies per level
class CascadingService {
    //CascadingProducer
    //CascadingConsumer
    constructor(kafka, topic, serviceCB, // checkback on reject arg types
    successCB, dlqCB) {
        this.kafka = kafka;
        this.topic = topic;
        this.serviceCB = serviceCB;
        this.successCB = successCB;
        this.dlqCB = dlqCB;
        this.retries = 0;
        this.topicsArr = [];
        // create producers and consumers
    }
    setRetryLevels(count) {
        if (this.topicsArr.length > count) {
            const diff = this.topicsArr.length - count;
            for (let i = 0; i < diff; i++) {
                this.topicsArr.pop();
            }
            ;
        }
        else {
            for (let i = this.retries; i < count; i++) {
                this.topicsArr.push(this.topic + '-cascade-retry-' + i);
            }
        }
        this.retries = count;
    }
}
module.exports = {
    service: (kafka, topic, serviceCB, // checkback on reject arg types
    successCB, dlqCB = () => console.log('DQL Message received')) => {
        return new CascadingService(kafka, topic, serviceCB, successCB, dlqCB);
    }
};
