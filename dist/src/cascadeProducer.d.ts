declare const EventEmitter: any;
import * as Types from './kafkaInterface';
declare class CascadeProducer extends EventEmitter {
    producer: Types.ProducerInterface;
    dlqCB: Types.RouteCallback;
    retryTopics: string[];
    paused: boolean;
    pausedQueue: Types.KafkaConsumerMessageInterface[];
    retryOptions: {
        timeout?: number[];
        batchLimit: number;
    };
    timeout: number[];
    batch: Types.KafkaProducerMessageInterface[];
    batchLimit: number[];
    sendStorage: {};
    constructor(kafka: Types.KafkaInterface, dlqCB: Types.RouteCallback);
    connect(): Promise<any>;
    disconnect(): Promise<any>;
    pause(): void;
    resume(): Promise<any>;
    stop(): Promise<any>;
    send(msg: Types.KafkaConsumerMessageInterface): Promise<any>;
    sendTimeout(id: any, msg: any, retries: any): Promise<unknown>;
    sendBatch(msg: any, retries: any): Promise<unknown>;
    setRetryTopics(topicsArr: string[], options?: {
        timeoutLimit?: number[];
        batchLimit?: number[];
    }): void;
}
export default CascadeProducer;
