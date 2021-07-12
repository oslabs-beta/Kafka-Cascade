export default class Queue<Type> {
    head: QueueNode<Type> | null;
    tail: QueueNode<Type> | null;
    length: number;
    constructor();
    push(val: Type): number;
    shift(): Type | undefined;
}
declare class QueueNode<T> {
    value: T;
    next: QueueNode<T> | null;
    prev: QueueNode<T> | null;
    constructor(value: T);
}
export {};
