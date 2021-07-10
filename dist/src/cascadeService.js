"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const EventEmitter = require('events');
const cascadeProducer_1 = require("./cascadeProducer");
const cascadeConsumer_1 = require("./cascadeConsumer");
// kafka object to create producer and consumer
// service callback
// dlq callback -> provide default
// success callback
// topic
// retry producer
// topic consumer
// retry levels -> provide default
// retry strategies per level
class CascadeService extends EventEmitter {
    constructor(kafka, topic, groupId, serviceCB, successCB, dlqCB) {
        super();
        this.events = [
            'connect',
            'disconnect',
            'run',
            'stop',
            'pause',
            'resume',
            'receive',
            'success',
            'retry',
            'dlq',
            'error',
            'serviceError',
        ];
        this.kafka = kafka;
        this.topic = topic;
        this.serviceCB = serviceCB;
        this.successCB = successCB;
        this.dlqCB = dlqCB;
        this.retries = 0;
        this.topicsArr = [];
        // create producers and consumers
        this.producer = new cascadeProducer_1.default(kafka, dlqCB);
        this.producer.on('retry', (msg) => this.emit('retry', msg));
        this.producer.on('dlq', (msg) => this.emit('dlq', msg));
        this.producer.on('error', (error) => this.emit('error', 'Error in cascade producer: ' + error));
        this.consumer = new cascadeConsumer_1.default(kafka, topic, groupId, false);
        this.consumer.on('receive', (msg) => this.emit('receive', msg));
        this.consumer.on('serviceError', (error) => this.emit('serviceError', error));
        this.consumer.on('error', (error) => this.emit('error', 'Error in cascade consumer: ' + error));
    }
    connect() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.producer.connect();
                yield this.consumer.connect();
                this.emit('connect');
                resolve(true);
            }
            catch (error) {
                this.emit('error', 'Error in cascade.connect(): ' + error);
                reject(error);
            }
        }));
    }
    disconnect() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.producer.stop();
                yield this.producer.disconnect();
                yield this.consumer.disconnect();
                this.emit('disconnect');
                resolve(true);
            }
            catch (error) {
                this.emit('error', 'Error in cascade.disconnect(): ' + error);
                reject(error);
            }
        }));
    }
    setRetryLevels(count, options) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.topicsArr.length > count) {
                    const diff = this.topicsArr.length - count;
                    for (let i = 0; i < diff; i++) {
                        this.topicsArr.pop();
                    }
                    ;
                }
                else {
                    for (let i = this.retries; i < count; i++) {
                        this.topicsArr.push(this.topic + '-cascade-retry-' + (i + 1));
                    }
                }
                this.producer.setRetryTopics(this.topicsArr, options);
                this.retries = count;
                // get an admin client to pre-register topics
                const admin = this.kafka.admin();
                yield admin.connect();
                const registerTopics = {
                    waitForLeaders: true,
                    topics: [],
                };
                this.topicsArr.forEach(topic => registerTopics.topics.push({ topic }));
                yield admin.createTopics(registerTopics);
                const re = new RegExp(`^${this.topic}-cascade-retry-.*`);
                console.log('topics registered =', (yield admin.listTopics()).filter(topic => topic === this.topic || topic.search(re) > -1));
                yield admin.disconnect();
                setTimeout(() => {
                    console.log('Registered topics with Kafka...');
                    resolve(true);
                }, 10);
            }
            catch (error) {
                this.emit('error', 'Error in cascade.setRetryLevels(): ' + error);
                reject(error);
            }
        }));
    }
    run() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                const status = yield this.consumer.run(this.serviceCB, (msg) => { this.emit('success', msg); this.successCB(msg); }, (msg) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        yield this.producer.send(msg);
                    }
                    catch (error) {
                        this.emit('error', 'Error in cascade producer.send(): ' + error);
                    }
                }));
                this.emit('run');
                resolve(status);
            }
            catch (error) {
                this.emit('error', 'Error in cascade.run(): ' + error);
                reject(error);
            }
        }));
    }
    stop() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.consumer.stop();
                yield this.producer.stop();
                this.emit('stop');
                resolve(true);
            }
            catch (error) {
                this.emit('error', 'Error in cascade.stop(): ' + error);
                reject(error);
            }
        }));
    }
    pause() {
        return __awaiter(this, void 0, void 0, function* () {
            // check to see if service is already paused
            if (!this.producer.paused) {
                return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        yield this.consumer.pause();
                        this.producer.pause();
                        this.emit('pause');
                        resolve(true);
                    }
                    catch (error) {
                        this.emit('error', 'Error in cascade.pause(): ' + error);
                        reject(error);
                    }
                }));
            }
            else {
                console.log('cascade.pause() called while service is already paused!');
            }
        });
    }
    paused() {
        // return producer.paused boolean;
        return this.producer.paused;
    }
    resume() {
        return __awaiter(this, void 0, void 0, function* () {
            // check to see if service is paused
            if (this.producer.paused) {
                return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        yield this.consumer.resume();
                        yield this.producer.resume();
                        this.emit('resume');
                        resolve(true);
                    }
                    catch (error) {
                        this.emit('error', 'Error in cascade.resume(): ' + error);
                        reject(error);
                    }
                }));
            }
            else {
                console.log('cascade.resume() called while service is already running!');
            }
        });
    }
    on(event, callback) {
        if (!this.events.includes(event))
            throw new Error('Unknown event: ' + event);
        super.on(event, callback);
    }
}
exports.default = CascadeService;
