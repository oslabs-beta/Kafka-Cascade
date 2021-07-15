import * as Types from './kafkaInterface';
declare class CascadeConsumer {
    consumer: Types.ConsumerInterface;
    topic: string;
    groupId: string;
    fromBeginning: boolean;
    constructor(kafkaInterface: Types.KafkaInterface, topic: string, groupId: string, fromBeginning?: boolean);
    connect(): Promise<any>;
    run(serviceCB: Types.ServiceCallback, successCB: Types.RouteCallback, rejectCB: Types.RouteCallback): Promise<any>;
    disconnect(): Promise<any>;
    stop(): Promise<any>;
    pause(): Promise<any>;
    resume(): Promise<any>;
}
export default CascadeConsumer;
