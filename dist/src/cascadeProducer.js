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
const queue_1 = require("./util/queue");
class CascadeProducer extends EventEmitter {
    // pass in kafka interface
    constructor(kafka, topic, dlqCB) {
        super();
        this.sendStorage = {};
        this.topic = topic;
        this.dlqCB = dlqCB;
        this.retryTopics = [];
        this.producer = kafka.producer();
        this.admin = kafka.admin();
        this.paused = false;
        this.pausedQueue = new queue_1.default();
        // set the routes to have a default route
        this.routes = [{ status: '', retryLevels: 0, timeoutLimit: [], batchLimit: [], levels: [], topics: [] }];
    }
    connect() {
        return this.producer.connect();
    }
    disconnect() {
        return this.producer.disconnect();
    }
    pause() {
        this.paused = true;
        console.log(this.paused);
    }
    resume() {
        this.paused = false;
        // declare array to store promises
        const resumePromises = [];
        while (this.pausedQueue.length) {
            // push promise into promise array
            const { msg, status } = this.pausedQueue.shift();
            resumePromises.push(this.send(msg, status));
        }
        // return promise array
        return Promise.all(resumePromises);
    }
    stop() {
        // send all pending messages to DLQ
        for (let id in this.sendStorage) {
            if (this.sendStorage[id]) {
                let { msg } = this.sendStorage[id];
                this.sendStorage[id] = undefined;
                this.dlqCB(msg);
            }
        }
        this.routes.forEach(route => {
            route.levels.forEach((level, i) => {
                level.messages.forEach(msg => {
                    const conMsg = {
                        topic: route.levels[i].topic,
                        partition: -1,
                        offset: -1,
                        message: msg,
                    };
                    this.dlqCB(conMsg);
                });
                level.messages = [];
            });
        });
        return new Promise((resolve) => resolve(true));
    }
    send(msg, status) {
        try {
            if (this.paused) {
                this.pausedQueue.push({ msg, status });
                return new Promise(resolve => resolve(true));
            }
            let route = this.routes[0];
            for (let i = 1; i < this.routes.length; i++) {
                if (status === this.routes[i].status) {
                    route = this.routes[i];
                    break;
                }
            }
            const metadata = JSON.parse(msg.message.headers.cascadeMetadata);
            if (metadata.status !== status) {
                metadata.retries = 0;
                metadata.status = status;
            }
            // check if retries exceeds allowed number of retries
            if (metadata.retries < route.topics.length) {
                msg.topic = route.topics[metadata.retries];
                metadata.retries += 1;
                // populate producerMessage object
                let id = `${Date.now()}${Math.floor(Math.random() * Date.now())}`;
                const producerMessage = {
                    topic: msg.topic,
                    messages: [{
                            key: msg.message.key,
                            value: msg.message.value,
                            headers: Object.assign(Object.assign({}, msg.message.headers), { cascadeMetadata: JSON.stringify(metadata) })
                        }]
                };
                if (route.timeoutLimit[metadata.retries - 1] > 0)
                    return this.sendTimeout(id, producerMessage, metadata.retries - 1, route);
                else
                    return this.sendBatch(producerMessage, metadata.retries - 1, route);
            }
            else {
                this.emit('dlq', msg);
                this.dlqCB(msg);
                return new Promise((resolve) => resolve(true));
            }
        }
        catch (error) {
            this.emit('error', error);
        }
    }
    //Used by send
    //sets delay for producer messages
    sendTimeout(id, msg, retries, route) {
        return new Promise((resolve, reject) => {
            //stores each send and msg to sendStorage[id] 
            this.sendStorage[id] = {
                sending: () => {
                    this.emit('retry', msg);
                    this.producer.send(msg)
                        .then(res => resolve(res))
                        .catch(res => {
                        reject(res);
                    });
                }, msg: msg
            };
            //sends message after timeout expires
            const scheduler = () => {
                if (this.sendStorage[id]) {
                    const { sending } = this.sendStorage[id];
                    this.sendStorage[id] = undefined;
                    sending();
                }
            };
            if (process.env.test === 'test')
                scheduler();
            else
                setTimeout(scheduler, route.timeoutLimit[retries]);
        });
    }
    ;
    //Used by send
    //sets batch processing
    sendBatch(msg, retries, route) {
        return new Promise((resolve, reject) => {
            route.levels[retries].messages.push(msg.messages[0]);
            if (route.levels[retries].messages.length === route.batchLimit[retries]) {
                this.emit('retry', route.levels[retries]);
                this.producer.send(route.levels[retries])
                    .then(res => resolve(res))
                    .catch(res => {
                    console.log('Caught an error trying to send batch: ' + res);
                    reject(res);
                });
                route.levels[retries].messages = [];
            }
            else
                resolve(true);
        });
    }
    //User is ability to set the timeout and batchLimit
    setDefaultRoute(count, options) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                const defaultRoute = this.routes[0];
                if (defaultRoute.topics.length > count) {
                    const diff = this.topicsArr.length - count;
                    for (let i = 0; i < diff; i++) {
                        defaultRoute.topics.pop();
                    }
                    ;
                }
                else {
                    for (let i = defaultRoute.topics.length; i < count; i++) {
                        defaultRoute.topics.push(this.topic + '-cascade-retry-' + (i + 1));
                    }
                }
                defaultRoute.retryLevels = count;
                if (options && options.timeoutLimit)
                    defaultRoute.timeoutLimit = options.timeoutLimit;
                else
                    defaultRoute.timeoutLimit = (new Array(defaultRoute.topics.length)).fill(0);
                if (options && options.batchLimit)
                    defaultRoute.batchLimit = options.batchLimit;
                else
                    defaultRoute.batchLimit = (new Array(defaultRoute.topics.length)).fill(1);
                defaultRoute.levels = [];
                defaultRoute.topics.forEach((topic) => {
                    const emptyMsg = {
                        topic,
                        messages: [],
                    };
                    defaultRoute.levels.push(emptyMsg);
                });
                // get an admin client to pre-register topics
                yield this.admin.connect();
                const registerTopics = {
                    waitForLeaders: true,
                    topics: [],
                };
                defaultRoute.topics.forEach(topic => registerTopics.topics.push({ topic }));
                yield this.admin.createTopics(registerTopics);
                const re = new RegExp(`^${this.topic}-cascade-retry-.*`);
                console.log('topics registered =', (yield this.admin.listTopics()).filter(topic => topic === this.topic || topic.search(re) > -1));
                yield this.admin.disconnect();
                setTimeout(() => {
                    console.log('Registered topics with Kafka...');
                    resolve(true);
                }, 10);
            }
            catch (error) {
                this.emit('error', 'Error in cascade.setDefaultRoute(): ' + error);
                reject(error);
            }
        }));
    }
    setRoute(status, count, options) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                const route = { status, retryLevels: count, topics: [] };
                for (let i = 0; i < count; i++) {
                    route.topics.push(this.topic + '-cascade-retry-' + 'route-' + status + '-' + (i + 1));
                }
                if (options && options.timeoutLimit)
                    route.timeoutLimit = options.timeoutLimit;
                else
                    route.timeoutLimit = (new Array(route.topics.length)).fill(0);
                if (options && options.batchLimit)
                    route.batchLimit = options.batchLimit;
                else
                    route.batchLimit = (new Array(route.topics.length)).fill(1);
                route.levels = [];
                route.topics.forEach((topic) => {
                    const emptyMsg = {
                        topic,
                        messages: [],
                    };
                    route.levels.push(emptyMsg);
                });
                this.routes.push(route);
                // get an admin client to pre-register topics
                yield this.admin.connect();
                const registerTopics = {
                    waitForLeaders: true,
                    topics: [],
                };
                route.topics.forEach(topic => registerTopics.topics.push({ topic }));
                yield this.admin.createTopics(registerTopics);
                const re = new RegExp(`^${this.topic}-cascade-retry-.*`);
                console.log('topics registered =', (yield this.admin.listTopics()).filter(topic => topic === this.topic || topic.search(re) > -1));
                yield this.admin.disconnect();
                setTimeout(() => {
                    console.log('Registered topics with Kafka...');
                    resolve(true);
                }, 10);
            }
            catch (error) {
                this.emit('error', 'Error in cascade.setRoute(): ' + error);
                reject(error);
            }
        }));
    }
}
exports.default = CascadeProducer;
