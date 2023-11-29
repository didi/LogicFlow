import { getEdgeOutline } from '../../src/algorithm/outline';

describe('algorithm/outline', () => {
  test('get edge outline', () => {
    const edge1 = {
      modelType: 'line-edge',
      startPoint: {
        x: 0,
        y: 0,
      },
      endPoint: {
        x: 10,
        y: 10,
      },
    };
    expect(getEdgeOutline(edge1)).toEqual({
      x: -5,
      y: -5,
      x1: 15,
      y1: 15,
    });
    const edge2 = {
      modelType: 'polyline-edge',
      points: '0,0 10,10',
    };
    expect(getEdgeOutline(edge2)).toEqual({
      x: -4,
      y: -4,
      x1: 14,
      y1: 14,
    });
    const edge3 = {
      modelType: 'bezier-edge',
      path: 'M 270 195C 370 195,305 290,405 290',
    };
    expect(getEdgeOutline(edge3)).toEqual({
      x: 266,
      y: 191,
      x1: 409,
      y1: 294,
    });
  });
});
