import Queue from '../kafka-cascade/src/util/queue';

describe('Queue tests', () => {
  it('Can push to queue', () => {
    const queue = new Queue<number>();
    queue.push(5);
    expect(queue).toHaveLength(1);
    expect(queue.head.value).toBe(5);
  });

  it('Can shift from queue', () => {
      const queue = new Queue<number>();
      queue.push(5);
      expect(queue.shift()).toBe(5);
      expect(queue).toHaveLength(0);
      expect(queue.head).toBeNull();
      expect(queue.tail).toBeNull();
  });

  it('Returns undefined when shifting on an empty list', () => {
    const queue = new Queue<number>();
    expect(queue.shift()).toBeUndefined();
  });

  it('Can push and shift multiple values', () => {
    const queue = new Queue<number>();
    for(let i = 1; i <= 10; i++) queue.push(i);
    expect(queue).toHaveLength(10);
    expect(queue.shift()).toBe(1);
    expect(queue.shift()).toBe(2);
    expect(queue.shift()).toBe(3);
    expect(queue.shift()).toBe(4);
    expect(queue.shift()).toBe(5);
    expect(queue).toHaveLength(5);
    expect(queue.push(11)).toBe(6);
    expect(queue.shift()).toBe(6);
    expect(queue).toHaveLength(5);
  });
});