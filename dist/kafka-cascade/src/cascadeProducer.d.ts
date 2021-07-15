import * as Types from './kafkaInterface';
declare class CascadeProducer {
    producer: Types.ProducerInterface;
    dlqCB: Types.RouteCallback;
    retryTopics: string[];
    paused: boolean;
    pausedQueue: Types.KafkaConsumerMessageInterface[];
    constructor(kafka: Types.KafkaInterface, dlqCB: Types.RouteCallback);
    connect(): Promise<any>;
    disconnect(): Promise<any>;
    pause(): void;
    resume(): Promise<any>;
    stop(): Promise<any>;
    send(msg: Types.KafkaConsumerMessageInterface): Promise<any>;
    setRetryTopics(topicsArr: string[]): void;
}
export default CascadeProducer;
