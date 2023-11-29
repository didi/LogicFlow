import EventEmitter from '../../src/event/eventEmitter';

describe('event/eventEmitter', () => {
  const em = new EventEmitter();
  test('event emitter', () => {
    const fn = jest.fn();
    em.on('test', fn);
    em.emit('test', { a: 1 });
    expect(fn).toBeCalledWith({ a: 1 });
    em.off('test', fn);
    em.emit('test', { a: 1 });
    expect(fn).toBeCalledTimes(1);

    em.once('test1', fn);
    em.emit('test1', { a: 1 });
    expect(fn).toBeCalledTimes(2);
    em.once('test1', fn);
    em.emit('test1', { a: 1 });
    const test1Events = em.getEvents().test1;
    expect(test1Events).toBeUndefined();
  });
});
