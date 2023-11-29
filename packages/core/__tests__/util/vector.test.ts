import { Vector } from '../../src/util/vector';

describe('util/vector', () => {
  test('construct', () => {
    const v = new Vector(1, 2);
    expect(v.x).toEqual(1);
    expect(v[0]).toEqual(1);

    expect(v.y).toEqual(2);
    expect(v[1]).toEqual(2);

    expect(v.z).toEqual(0);
    expect(v[2]).toEqual(0);
  });
  test('add', () => {
    const v = new Vector(1, 2);
    const v1 = new Vector(3, 4);
    expect(v.add(v1)).toEqual(new Vector(4, 6));
  });
  test('subtract', () => {
    const v = new Vector(1, 2);
    const v1 = new Vector(3, 4);
    expect(v.subtract(v1)).toEqual(new Vector(-2, -2));
  });
  test('dot', () => {
    const v = new Vector(1, 2);
    const v1 = new Vector(3, 4);
    expect(v.dot(v1)).toEqual(11);
  });
  test('cross', () => {
    const v = new Vector(1, 2);
    const v1 = new Vector(3, 4);
    expect(v.cross(v1)).toEqual(new Vector(0, 0, -2));
  });
  test('getLength', () => {
    const v = new Vector(1, 2);
    expect(v.getLength()).toEqual(Math.sqrt(5));
  });
  test('normalize', () => {
    const v = new Vector(1, 2);
    expect(v.normalize()).toEqual(
      new Vector(1 / Math.sqrt(5), 2 / Math.sqrt(5)),
    );
  });
  test('angle', () => {
    const v = new Vector(1, 1);
    const v1 = new Vector(0, 1);
    expect(v.angle(v1) - Math.PI / 4 < Number.EPSILON).toBeTruthy();
  });
});
