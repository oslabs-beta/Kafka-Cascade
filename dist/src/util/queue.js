"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Queue {
    constructor() {
        this.head = null;
        this.tail = null;
        this.length = 0;
    }
    push(val) {
        if (!this.head)
            this.head = this.tail = new QueueNode(val);
        else {
            this.tail.next = new QueueNode(val);
            this.tail.next.prev = this.tail;
            this.tail = this.tail.next;
        }
        return ++this.length;
    }
    shift() {
        if (!this.head)
            return undefined;
        const cache = this.head.value;
        if (this.head === this.tail) {
            this.head = null;
            this.tail = null;
        }
        else {
            this.head = this.head.next;
            this.head.prev = null;
        }
        this.length--;
        return cache;
    }
}
exports.default = Queue;
class QueueNode {
    constructor(value) {
        this.value = value;
        this.next = null;
        this.prev = null;
    }
}
