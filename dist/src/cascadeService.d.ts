declare const EventEmitter: any;
import * as Types from './kafkaInterface';
import CascadeProducer from './cascadeProducer';
import CascadeConsumer from './cascadeConsumer';
declare class CascadeService extends EventEmitter {
    kafka: Types.KafkaInterface;
    topic: string;
    serviceCB: Types.ServiceCallback;
    successCB: Types.RouteCallback;
    dlqCB: Types.RouteCallback;
    producer: CascadeProducer;
    consumer: CascadeConsumer;
    events: string[];
    constructor(kafka: Types.KafkaInterface, topic: string, groupId: string, serviceCB: Types.ServiceCallback, successCB: Types.RouteCallback, dlqCB: Types.RouteCallback);
    connect(): Promise<any>;
    disconnect(): Promise<any>;
    setDefaultRoute(count: number, options?: {
        timeoutLimit?: number[];
        batchLimit?: number[];
    }): Promise<any>;
    setRoute(status: string, count: number, options?: {
        timeoutLimit?: number[];
        batchLimit?: number[];
    }): Promise<any>;
    run(): Promise<any>;
    stop(): Promise<any>;
    pause(): Promise<any>;
    paused(): boolean;
    resume(): Promise<any>;
    on(event: string, callback: (arg: any) => any): void;
}
export default CascadeService;
