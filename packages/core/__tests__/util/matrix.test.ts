import { Matrix } from '../../src/util/matrix';

describe('util/matrix', () => {
  test('construct', () => {
    const m = new Matrix([1, 2, 3], [4, 5, 6], [7, 8, 9]);
    expect(m[0]).toEqual([1, 2, 3]);
    expect(m[1]).toEqual([4, 5, 6]);
    expect(m[2]).toEqual([7, 8, 9]);
  });
  test('cross', () => {
    const m = new Matrix([1, 2, 3], [4, 5, 6], [7, 8, 9]);
    const n = new Matrix([9, 8, 7], [6, 5, 4], [3, 2, 1]);
    expect(m.cross(n)).toEqual(
      new Matrix([30, 24, 18], [84, 69, 54], [138, 114, 90]),
    );
  });
  test('transpose', () => {
    const m = new Matrix([1, 2, 3], [4, 5, 6], [7, 8, 9]);
    expect(m.transpose()).toEqual(new Matrix([1, 4, 7], [2, 5, 8], [3, 6, 9]));
  });
  test('translate', () => {
    const m = new Matrix([1, 0, 0], [0, 1, 0], [0, 0, 1]);
    expect(m.translate(2, 3)).toEqual(
      new Matrix([1, 0, 0], [0, 1, 0], [2, 3, 1]),
    );
  });
  test('rotate', () => {
    const m = new Matrix([1, 0, 0], [0, 1, 0], [0, 0, 1]);
    expect(m.rotate(Math.PI / 2)).toEqual(
      new Matrix([0, 1, 0], [-1, 0, 0], [0, 0, 1]),
    );
  });
  test('scale', () => {
    const m = new Matrix([1, 0, 0], [0, 1, 0], [0, 0, 1]);
    expect(m.scale(2, 3)).toEqual(new Matrix([2, 0, 0], [0, 3, 0], [0, 0, 1]));
  });
  test('toString', () => {
    const m = new Matrix([1, 0, 0], [0, 1, 0], [1, 1, 1]);
    expect(m.toString()).toEqual('matrix(1 0 0 1 1 1)');
  });
});
