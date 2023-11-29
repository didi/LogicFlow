import { getZIndex, getMinIndex } from '../../src/util/zIndex';

describe('util/zIndex', () => {
  test('getZIndex', () => {
    expect(getZIndex()).toBe(1001);
  });
  test('getMinIndex', () => {
    expect(getMinIndex()).toBe(998);
  });
});
