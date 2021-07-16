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
exports.Types = exports.CascadeConsumer = exports.CascadeProducer = exports.CascadeService = void 0;
const cascadeService_1 = require("./src/cascadeService");
exports.CascadeService = cascadeService_1.default;
const cascadeProducer_1 = require("./src/cascadeProducer");
exports.CascadeProducer = cascadeProducer_1.default;
const cascadeConsumer_1 = require("./src/cascadeConsumer");
exports.CascadeConsumer = cascadeConsumer_1.default;
const Types = require("./src/kafkaInterface");
exports.Types = Types;
/**
 * @module cascade
 */
module.exports = {
    /**
     * Main entry point to the module. Creates a new service that listens to and produces kafka messages
     *
     * @example
     * const cascade = require('kafka-cascade');
     * const service = new cascade.service(kafka, 'example-topic', 'example-group', serviceCB, successCB, dlqCB);
     *
     * @param kafka - KakfaJS Kafka Object
     * @param {string} topic - Topic that the service listens for and runs the service
     * @param {string} groupId - Group Id for the service consumer
     * @param serviceCB  - Callback that is run whenever 'topic' is received or retry. It accepts a kafka message, resolve callback and reject callback
     * @param successCB  - Callback that is run when the serviceCB resolves a message, accepts the kafka message
     * @param dlqCB - Callback that is run when the serviceCB rejects a message and cannot be retried anymore
     * @returns {CascadeService}
     */
    service: (kafka, topic, groupId, serviceCB, successCB, dlqCB = (msg) => console.log('DLQ Message received')) => {
        return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const newServ = new cascadeService_1.default(kafka, topic, groupId, serviceCB, successCB, dlqCB);
                resolve(newServ);
            }
            catch (error) {
                reject(error);
            }
        }));
    },
    /**
     * Utility function that parses the metadata that cascade adds to the kafka message headers
     * @param msg
     * @returns {object}
     */
    getMetadata: (msg) => {
        if (typeof (msg) !== 'object' || !msg.message || !msg.message.headers || !msg.message.headers.cascadeMetadata)
            return;
        return JSON.parse(msg.message.headers.cascadeMetadata);
    },
};
