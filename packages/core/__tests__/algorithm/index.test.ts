import { getVerticalPointOfLine } from '../../src/algorithm';

describe('algorithm/index', () => {
  test('getVerticalPointOfLine', () => {
    const config1 = {
      start: {
        x: 0,
        y: 0,
      },
      end: {
        x: 0,
        y: 10,
      },
      offset: 3,
      verticalLength: 3,
      type: 'start',
    };
    const config2 = {
      start: {
        x: 0,
        y: 0,
      },
      end: {
        x: 10,
        y: 0,
      },
      offset: 3,
      verticalLength: 3,
      type: 'end',
    };
    const config3 = {
      start: {
        x: 10,
        y: 10,
      },
      end: {
        x: 0,
        y: 0,
      },
      offset: 3,
      verticalLength: 3,
      type: 'start',
    };
    const config4 = {
      start: {
        x: 10,
        y: 10,
      },
      end: {
        x: 0,
        y: 0,
      },
      offset: 3,
      verticalLength: 3,
      type: 'end',
    };
    const res1 = getVerticalPointOfLine(config1);
    expect(Math.abs(res1.leftX) - 5 < Number.EPSILON).toBeTruthy();
    expect(Math.abs(res1.leftY) - 3 < Number.EPSILON).toBeTruthy();
    expect(Math.abs(res1.rightX) - 5 < Number.EPSILON).toBeTruthy();
    expect(Math.abs(res1.rightY) - 3 < Number.EPSILON).toBeTruthy();

    const res2 = getVerticalPointOfLine(config2);
    expect(Math.abs(res2.leftX) - 7 < Number.EPSILON).toBeTruthy();
    expect(Math.abs(res2.leftY) - 3 < Number.EPSILON).toBeTruthy();
    expect(Math.abs(res2.rightX) - 7 < Number.EPSILON).toBeTruthy();
    expect(Math.abs(res2.rightY) - 3 < Number.EPSILON).toBeTruthy();
  });
});
