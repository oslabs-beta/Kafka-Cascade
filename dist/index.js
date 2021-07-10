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
module.exports = {
    service: (kafka, topic, groupId, serviceCB, successCB, dlqCB = (msg) => console.log('DQL Message received')) => {
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
    getMetadata: (msg) => {
        if (typeof (msg) !== 'object' || !msg.message || !msg.message.headers || !msg.message.headers.cascadeMetadata)
            return;
        return JSON.parse(msg.message.headers.cascadeMetadata);
    },
};
