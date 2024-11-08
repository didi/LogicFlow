import { getCrossPointOfLine, isInSegment } from '../../src/algorithm/edge'

describe('algorithm/edge', () => {
  // one intersection
  test('one intersection', () => {
    const line1 = [
      {
        x: 0,
        y: 0,
      },
      {
        x: 10,
        y: 10,
      },
    ]
    const line2 = [
      {
        x: 10,
        y: 0,
      },
      {
        x: 0,
        y: 10,
      },
    ]
    expect(
      getCrossPointOfLine(line1[0], line1[1], line2[0], line2[1]),
    ).toBeTruthy()
  })
  // multiple intersection
  test('multiple intersection', () => {
    const line1 = [
      {
        x: 0,
        y: 0,
      },
      {
        x: 10,
        y: 10,
      },
    ]
    const line2 = [
      {
        x: 0,
        y: 0,
      },
      {
        x: 10,
        y: 10,
      },
    ]
    expect(
      getCrossPointOfLine(line1[0], line1[1], line2[0], line2[1]),
    ).toBeFalsy()
  })
  // no intersection
  test('intersection', () => {
    const line1 = [
      {
        x: 0,
        y: 0,
      },
      {
        x: 10,
        y: 10,
      },
    ]
    const line2 = [
      {
        x: 10,
        y: 0,
      },
      {
        x: 20,
        y: 10,
      },
    ]
    expect(
      getCrossPointOfLine(line1[0], line1[1], line2[0], line2[1]),
    ).toBeFalsy()
  })

  test('in segment', () => {
    const point = {
      x: 0,
      y: 0,
    }
    const line1 = [
      {
        x: -10,
        y: -10,
      },
      {
        x: 10,
        y: 10,
      },
    ]
    const line2 = [
      {
        x: -10,
        y: 10,
      },
      {
        x: 10,
        y: -10,
      },
    ]
    expect(isInSegment(point, line1[0], line1[1])).toBeTruthy()
    expect(isInSegment(point, line1[1], line1[0])).toBeTruthy()
    expect(isInSegment(point, line2[0], line2[1])).toBeTruthy()
    expect(isInSegment(point, line2[1], line2[0])).toBeTruthy()
  })
  // not in segment
  test('not in segment', () => {
    const point = {
      x: 10,
      y: 0,
    }
    const line = [
      {
        x: -10,
        y: -10,
      },
      {
        x: 10,
        y: 10,
      },
    ]
    expect(isInSegment(point, line[0], line[1])).toBeFalsy()
  })
})
