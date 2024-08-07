import {
  isBboxOverLapping,
  mergeBBox,
  isPointOutsideBBox,
  isSegmentCrossingBBox,
  getLongestEdge,
  getSimplePolyline,
  pointDirection,
  getBBoxCrossPointsByPoint,
  isSegmentsInNode,
  isSegmentsCrossNode,
  getCrossPointInRect,
  segmentDirection,
} from '../../src/util/edge'

describe('util/edge', () => {
  test('is bbox overlapping', () => {
    const bbox1 = {
      centerX: 1,
      centerY: 1,
      width: 2,
      height: 2,
    }
    const bbox2 = {
      centerX: 2,
      centerY: 2,
      width: 2,
      height: 2,
    }
    expect(isBboxOverLapping(bbox1, bbox2)).toBeTruthy()

    const bbox3 = {
      centerX: 3,
      centerY: 3,
      width: 2,
      height: 2,
    }
    expect(isBboxOverLapping(bbox1, bbox3)).toBeFalsy()
  })
  test('filter repeat points', () => {
    const sPoint1 = {
      x: 0,
      y: 0,
    }
    const tPoint1 = {
      x: 10,
      y: 10,
    }
    expect(getSimplePolyline(sPoint1, tPoint1)).toEqual([
      { x: 0, y: 0, id: '0-0' },
      { x: 0, y: 10, id: '0-10' },
      { x: 10, y: 10, id: '10-10' },
    ])

    const sPoint2 = {
      x: 0,
      y: 0,
    }
    const tPoint2 = {
      x: 0,
      y: 10,
    }
    expect(getSimplePolyline(sPoint2, tPoint2)).toEqual([
      { x: 0, y: 0, id: '0-0' },
      { x: 0, y: 10, id: '0-10' },
    ])
  })
  test('merge two BBoxes', () => {
    const bbox1 = {
      minX: 0,
      minY: 0,
      maxX: 2,
      maxY: 2,
    }
    const bbox2 = {
      minX: 1,
      minY: 1,
      maxX: 3,
      maxY: 3,
    }
    expect(mergeBBox(bbox1, bbox2)).toEqual({
      minX: 0,
      minY: 0,
      maxX: 3,
      maxY: 3,
      centerX: 1.5,
      centerY: 1.5,
      width: 3,
      height: 3,
    })
  })
  test('get direction of two points', () => {
    const point = {
      x: 0,
      y: 0,
    }
    const bbox1 = {
      width: 2,
      height: 4,
      centerX: 1,
      centerY: 1,
    }
    const bbox2 = {
      width: 4,
      height: 2,
      centerX: 1,
      centerY: 1,
    }
    expect(pointDirection(point, bbox1)).toEqual('horizontal')
    expect(pointDirection(point, bbox2)).toEqual('vertical')
  })
  test('is point inside the bbox', () => {
    const bbox = {
      minX: 0,
      minY: 0,
      maxX: 2,
      maxY: 2,
    }
    expect(isPointOutsideBBox({ x: 1, y: 1 }, bbox)).toBeFalsy()
    expect(isPointOutsideBBox({ x: 3, y: 3 }, bbox)).toBeTruthy()
  })
  test('get cross points of bbox and point', () => {
    const bbox = {
      minX: 0,
      minY: 0,
      maxX: 2,
      maxY: 2,
    }
    const point1 = {
      x: 1,
      y: 1,
    }
    const point2 = {
      x: 3,
      y: 3,
    }
    expect(getBBoxCrossPointsByPoint(bbox, point1)).toEqual([
      { x: 1, y: 0 },
      { x: 1, y: 2 },
      { x: 0, y: 1 },
      { x: 2, y: 1 },
    ])
    expect(getBBoxCrossPointsByPoint(bbox, point2)).toEqual([])
  })
  test('is segment cross the bbox', () => {
    const bbox = {
      minX: 0,
      minY: 0,
      maxX: 2,
      maxY: 2,
    }
    expect(
      isSegmentCrossingBBox({ x: 1, y: 1 }, { x: 3, y: 3 }, bbox),
    ).toBeTruthy()
    expect(
      isSegmentCrossingBBox({ x: 3, y: 3 }, { x: 4, y: 4 }, bbox),
    ).toBeFalsy()
  })
  test('get longest edge', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 },
    ]
    expect(getLongestEdge(points)).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 1 },
    ])
  })

  const segment1 = [
    {
      x: 0,
      y: 0,
    },
    {
      x: 0,
      y: 10,
    },
  ]
  const segment2 = [
    {
      x: -30,
      y: 0,
    },
    {
      x: 30,
      y: 0,
    },
  ]
  const bbox = {
    x: 0,
    y: 0,
    width: 20,
    height: 20,
  }
  test('is segments in node', () => {
    expect(isSegmentsInNode(segment1[0], segment1[1], bbox)).toBeTruthy()
    expect(isSegmentsInNode(segment2[0], segment2[1], bbox)).toBeFalsy()
  })
  test('is segments cross node', () => {
    expect(isSegmentsCrossNode(segment1[0], segment1[1], bbox)).toBeFalsy()
    expect(isSegmentsCrossNode(segment2[0], segment1[0], bbox)).toBeTruthy()
  })
  test('get cross point in rect', () => {
    expect(getCrossPointInRect(segment1[0], segment1[1], bbox)).toEqual({
      x: 0,
      y: 10,
    })
    expect(getCrossPointInRect(segment2[0], segment2[1], bbox)).toEqual({
      x: -10,
      y: 0,
    })
  })
  test('segment direction', () => {
    expect(segmentDirection(segment1[0], segment1[1])).toEqual('vertical')
    expect(
      segmentDirection(segment1[0], {
        x: 10,
        y: 0,
      }),
    ).toEqual('horizontal')
  })
})
