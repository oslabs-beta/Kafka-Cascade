declare const EventEmitter: any;
import * as Types from './kafkaInterface';
import Queue from './util/queue';
declare class CascadeProducer extends EventEmitter {
    producer: Types.ProducerInterface;
    admin: Types.AdminInterface;
    topic: string;
    dlqCB: Types.RouteCallback;
    retryTopics: string[];
    paused: boolean;
    pausedQueue: Queue<{
        msg: Types.KafkaConsumerMessageInterface;
        status: string;
    }>;
    sendStorage: {};
    routes: Types.ProducerRoute[];
    constructor(kafka: Types.KafkaInterface, topic: string, dlqCB: Types.RouteCallback);
    connect(): Promise<any>;
    disconnect(): Promise<any>;
    pause(): void;
    resume(): Promise<any>;
    stop(): Promise<any>;
    send(msg: Types.KafkaConsumerMessageInterface, status: string): Promise<any>;
    sendTimeout(id: string, msg: Types.KafkaProducerMessageInterface, retries: number, route: Types.ProducerRoute): Promise<unknown>;
    sendBatch(msg: Types.KafkaProducerMessageInterface, retries: number, route: Types.ProducerRoute): Promise<unknown>;
    setDefaultRoute(count: number, options?: {
        timeoutLimit?: number[];
        batchLimit?: number[];
    }): Promise<any>;
    setRoute(status: string, count: number, options?: {
        timeoutLimit?: number[];
        batchLimit?: number[];
    }): Promise<any>;
}
export default CascadeProducer;
