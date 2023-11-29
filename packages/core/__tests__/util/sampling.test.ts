import {
  degrees,
  getThetaOfVector,
  Vector,
} from '../../src/util';

describe('util/sampling', () => {
  test('degrees', () => {
    expect(degrees(1)).toBe(57.29577951308232);
  });
  test('getThetaOfVector', () => {
    expect(
      getThetaOfVector(new Vector(1, 1)) - 45 < Number.EPSILON,
    ).toBeTruthy();
  });
});
