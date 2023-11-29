import { snapToGrid, getGridOffset } from '../../src/util';

describe('util/geometry', () => {
  test('snapToGrid', () => {
    const point = 2.5;
    const grid = 1.5;
    expect(snapToGrid(point, grid) - 3 < Number.EPSILON).toBeTruthy();
  });
  test('getGridOffset', () => {
    const distance = 3;
    const grid = 1.5;
    expect(getGridOffset(distance, grid) - 2 < Number.EPSILON).toBeTruthy();
  });
});
