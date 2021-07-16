interface MessageInterface {
    topic: string;
    messages: [{
        value: string;
    }];
}
interface ProducerInterface {
    connect: (args: any[]) => Promise<any>;
    disconnect: (args: any[]) => any;
    send: (arg: MessageInterface) => any;
}
interface ConsumerInterface {
    connect: (args: any[]) => Promise<any>;
    disconnect: (args: any[]) => any;
    subscribe: (arg: {
        topic: string;
        fromBeginning: boolean;
    }) => Promise<any>;
    run: (arg: ({
        eachMessage: {
            topic: string;
            partition: number;
            message: any;
        };
    })) => any;
}
interface KafkaInterface {
    producer: ProducerInterface;
    consummer: ConsumerInterface;
}
export { MessageInterface, ProducerInterface, ConsumerInterface, KafkaInterface };
