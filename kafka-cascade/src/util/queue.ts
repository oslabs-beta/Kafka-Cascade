export default class Queue<Type> {
  head: QueueNode<Type> | null;
  tail: QueueNode<Type> | null;
  length: number;

  constructor() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  push(val: Type) {
    if(!this.head) this.head = this.tail = new QueueNode<Type>(val);
    else {
      this.tail.next = new QueueNode<Type>(val);
      this.tail.next.prev = this.tail;
      this.tail = this.tail.next;
    }

    return ++this.length;
  }

  shift():Type|undefined {
    if(!this.head) return undefined;
    const cache = this.head.value;
    
    if(this.head === this.tail) {
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

class QueueNode<T> {
    value: T;
    next: QueueNode<T> | null;
    prev: QueueNode<T> | null;

    constructor(value: T) {
      this.value = value;
      this.next = null;
      this.prev = null; 
    }
}
