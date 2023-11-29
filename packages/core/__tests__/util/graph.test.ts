import { isPointInArea } from '../../src/util/graph';

describe('util/graph', () => {
  test('if element is in an area, truthy', () => {
    const point: [number, number] = [1, 1];
    const leftTopPoint: [number, number] = [0, 0];
    const rightBottomPoint: [number, number] = [2, 2];
    expect(isPointInArea(point, leftTopPoint, rightBottomPoint)).toBeTruthy();
  });
  test('if element is in an area, falsy', () => {
    const point: [number, number] = [1, 1];
    const leftTopPoint: [number, number] = [2, 2];
    const rightBottomPoint: [number, number] = [4, 4];
    expect(isPointInArea(point, leftTopPoint, rightBottomPoint)).toBeFalsy();
  });
});
