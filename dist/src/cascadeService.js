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
        this.producer = new cascadeProducer_1.default(kafka, topic, dlqCB);
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
                resolve(true);
                this.emit('connect');
            }
            catch (error) {
                reject(error);
                this.emit('error', 'Error in cascade.connect(): ' + error);
            }
        }));
    }
    disconnect() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.producer.stop();
                yield this.producer.disconnect();
                yield this.consumer.disconnect();
                resolve(true);
                this.emit('disconnect');
            }
            catch (error) {
                reject(error);
                this.emit('error', 'Error in cascade.disconnect(): ' + error);
            }
        }));
    }
    setDefaultRoute(count, options) {
        return new Promise((resolve, reject) => {
            this.producer.setDefaultRoute(count, options)
                .then(res => resolve(res))
                .catch(error => {
                reject(error);
                this.emit('error', error);
            });
        });
    }
    setRoute(status, count, options) {
        return new Promise((resolve, reject) => {
            this.producer.setRoute(status, count, options)
                .then(res => resolve(res))
                .catch(error => {
                reject(error);
                this.emit('error', error);
            });
        });
    }
    getKafkaTopics() {
        let topics = [];
        this.producer.routes.forEach(route => topics = topics.concat(route.topics));
        return topics;
    }
    run() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                const status = yield this.consumer.run(this.serviceCB, (msg) => { this.emit('success', msg); this.successCB(msg); }, (msg, status = '') => __awaiter(this, void 0, void 0, function* () {
                    try {
                        yield this.producer.send(msg, status);
                    }
                    catch (error) {
                        this.emit('error', 'Error in cascade producer.send(): ' + error);
                    }
                }));
                resolve(status);
                this.emit('run');
            }
            catch (error) {
                reject(error);
                this.emit('error', 'Error in cascade.run(): ' + error);
            }
        }));
    }
    stop() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.consumer.stop();
                yield this.producer.stop();
                resolve(true);
                this.emit('stop');
            }
            catch (error) {
                reject(error);
                this.emit('error', 'Error in cascade.stop(): ' + error);
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
                        resolve(true);
                        this.emit('pause');
                    }
                    catch (error) {
                        reject(error);
                        this.emit('error', 'Error in cascade.pause(): ' + error);
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
                        resolve(true);
                        this.emit('resume');
                    }
                    catch (error) {
                        reject(error);
                        this.emit('error', 'Error in cascade.resume(): ' + error);
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
