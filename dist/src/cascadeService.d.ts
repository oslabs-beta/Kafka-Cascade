declare const EventEmitter: any;
import * as Types from './kafkaInterface';
import CascadeProducer from './cascadeProducer';
import CascadeConsumer from './cascadeConsumer';
/**
 * CascadeService
 */
declare class CascadeService extends EventEmitter {
    kafka: Types.KafkaInterface;
    topic: string;
    serviceCB: Types.ServiceCallback;
    successCB: (...args: any[]) => any;
    dlqCB: Types.RouteCallback;
    producer: CascadeProducer;
    consumer: CascadeConsumer;
    events: string[];
    /**
     * CascadeService objects should be constructed from [cascade.service]{@link module:cascade.service}
     */
    constructor(kafka: Types.KafkaInterface, topic: string, groupId: string, serviceCB: Types.ServiceCallback, successCB: (...args: any[]) => any, dlqCB: Types.RouteCallback);
    /**
     * Connects the service to kafka
     * Emits a 'connect' event
     * @returns {Promise}
     */
    connect(): Promise<any>;
    /**
     * Disconnects the service from kafka
     * Emits a 'disconnect' event
     * @returns {Promise}
     */
    disconnect(): Promise<any>;
    /**
     * Sets the parameters for the default retry route or when an unknown status is provided when the service rejects the message.
     * Levels is the number of times a message can be retried before being sent the DLQ callback.
     * Options can contain timeoutLimit as a number array. For each entry it will determine the delay for the message before it is retried.
     * Options can contain batchLimit as a number array. For each entry it will determine how many messages to wait for at the corresponding retry level before sending all pending messages at once.
     * If options is not provided then the default route is to have a batch limit of 1 for each retry level.
     * If both timeoutLimit and batchLimit are provided then timeoutLimit takes precedence
     * @param {number} levels - number of retry levels before the message is sent to the DLQ
     * @param {object} options - sets the retry strategies of the levels
     * @returns {promise}
     */
    setDefaultRoute(levels: number, options?: {
        timeoutLimit?: number[];
        batchLimit?: number[];
    }): Promise<any>;
    /**
     * Sets additional routes for the retry strategies when a status is provided when the message is rejected in the service callback.
     * See 'setDefaultRoute' for a discription of the parameters
     * @param {string} status - status code used to trigger this route
     * @param {number} levels - number of retry levels before the message is sent to the DLQ
     * @param {object} options - sets the retry strategies of the levels
     * @returns {Promise}
     */
    setRoute(status: string, levels: number, options?: {
        timeoutLimit?: number[];
        batchLimit?: number[];
    }): Promise<any>;
    /**
     * Returns a list of all of the kafka topics that this service has created
     * @returns {string[]}
     */
    getKafkaTopics(): string[];
    /**
     * Invokes the server to start listening for messages.
     * Equivalent to consumer.run
     * @returns {Promise}
     */
    run(): Promise<any>;
    /**
     * Stops the service, any pending retry messages will be sent to the DLQ
     * @returns {Promise}
     */
    stop(): Promise<any>;
    /**
     * Pauses the service, any messages pending for retries will be held until the service is resumed
     * @returns {Promise}
     */
    pause(): Promise<any>;
    /**
     *
     * @returns {boolean}
     */
    paused(): boolean;
    /**
     * Resumes the service, any paused retry messages will be retried
     * @returns {Promise}
     */
    resume(): Promise<any>;
    on(event: string, callback: (arg: any) => any): void;
}
export default CascadeService;
