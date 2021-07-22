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
class CascadeConsumer extends EventEmitter {
    constructor(kafkaInterface, topic, groupId, fromBeginning = false) {
        super();
        // kafka interface to this
        this.consumer = kafkaInterface.consumer({ groupId });
        this.topic = topic;
        this.groupId = groupId;
        this.fromBeginning = fromBeginning;
    }
    // Connect and subscribe to both reg and regex for the topic
    connect() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.consumer.connect();
                console.log('Connected to the consumer...');
                yield this.consumer.subscribe({ topic: this.topic, fromBeginning: this.fromBeginning });
                console.log('Subscribed to the base topic:', this.topic);
                let re = new RegExp(`^${this.topic}-cascade-retry-.*`);
                yield this.consumer.subscribe({ topic: re, fromBeginning: this.fromBeginning });
                console.log('Connected to the retry topics...');
                resolve(true);
            }
            catch (error) {
                this.emit('error', error);
                reject(error);
            }
        }));
    }
    run(serviceCB, successCB, rejectCB) {
        return this.consumer.run({ eachMessage: (msg) => {
                try {
                    if (!msg.message.headers) {
                        msg.message.headers = {};
                    }
                    if (!msg.message.headers.cascadeMetadata) {
                        msg.message.headers.cascadeMetadata = JSON.stringify({
                            status: '',
                            retries: 0,
                            topicArr: [],
                        });
                    }
                    if (msg.topic === this.topic)
                        this.emit('receive', msg);
                }
                catch (error) {
                    this.emit('error', error);
                }
                try {
                    serviceCB(msg, successCB, rejectCB);
                }
                catch (error) {
                    this.emit('serviceError', error);
                }
            } });
    }
    disconnect() {
        return this.consumer.disconnect();
    }
    stop() {
        return this.consumer.stop();
    }
    pause() {
        return this.consumer.pause();
    }
    resume() {
        return this.consumer.resume();
    }
    on(event, callback) {
        super.on(event, callback);
    }
}
exports.default = CascadeConsumer;
