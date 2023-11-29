import { formatData } from '../../src/util/compatible';

describe('util/compatible', () => {
  test('formatData', () => {
    const data = {
      nodes: [
        {
          id: 'node1',
          x: 100,
          y: 100,
        },
      ],
      edges: [
        {
          id: 'edge1',
          source: 'node1',
          target: 'node2',
        },
      ],
      a: undefined,
      b: {
        c: null,
        d: [],
      },
    };
    expect(formatData(data)).toEqual({
      nodes: [
        {
          id: 'node1',
          x: 100,
          y: 100,
        },
      ],
      edges: [
        {
          id: 'edge1',
          source: 'node1',
          target: 'node2',
        },
      ],
      a: undefined,
      b: {
        c: null,
        d: [],
      },
    });
  });
});
