import History from '../../src/history/History';
import EventEmitter from '../../src/event/eventEmitter';

describe('history', () => {
  const event = new EventEmitter();
  const history = new History(event);
  expect(history).toBeDefined();
  test('add', () => {
    history.add(1);
    expect(history.undos).toEqual([1]);
    expect(history.redos).toEqual([]);
  });
  test('undo', () => {
    history.add(1);
    history.add(2);
    history.undo();
    expect(history.undos).toEqual([]);
    expect(history.redos).toEqual([2]);
  });
  test('redo', () => {
    history.add(1);
    history.add(2);
    history.undo();
    history.redo();
    expect(history.undos).toEqual([]);
    expect(history.redos).toEqual([]);
  });
});
