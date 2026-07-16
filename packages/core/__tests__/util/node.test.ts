import {
  getClosestAnchor,
  isInNode,
  getClosestRadiusCenter,
  getCrossPointWithCircle,
  getCrossPointWithEllipse,
} from '../../src/util/node'

describe('util/node', () => {
  test('get closest anchor', () => {
    const position = { x: 0, y: 0 }
    const node = {
      anchors: [
        { x: 0, y: 0, id: '1' },
        { x: 1, y: 1, id: '2' },
        { x: 2, y: 2, id: '3' },
      ],
    }
    expect(getClosestAnchor(position, node)).toEqual({
      anchor: { x: 0, y: 0, id: '1' },
      index: 0,
    })
  })
  test('is point inside the node', () => {
    const position1 = { x: 0, y: 0 }
    const position2 = { x: 110, y: 110 }
    const node = {
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      rotate: 0,
    }
    expect(isInNode(position1, node)).toBeTruthy()
    expect(isInNode(position2, node)).toBeFalsy()
  })
  test('get cross point with circle', () => {
    const position = { x: 0, y: 0 }
    const node = {
      x: 0,
      y: 0,
      r: 10,
    }
    expect(getCrossPointWithCircle(position, 'horizontal', node)).toEqual({
      x: 10,
      y: 0,
    })
    expect(getCrossPointWithCircle(position, 'vertical', node)).toEqual({
      x: 0,
      y: 10,
    })
  })
  test('get cross point from the straight side of a rounded rectangle', () => {
    const node = {
      x: 650,
      y: 220,
      width: 220,
      height: 160,
      radius: 24,
    }

    expect(
      getClosestRadiusCenter(
        { x: 546.1114561800017, y: 198 },
        'horizontal',
        node,
      ),
    ).toEqual({
      x: 540,
      y: 198,
    })
    expect(
      getClosestRadiusCenter({ x: 650, y: 198 }, 'vertical', node),
    ).toEqual({
      x: 650,
      y: 140,
    })
  })
  test('keeps using a rounded corner when the line intersects its circle', () => {
    const node = {
      x: 650,
      y: 220,
      width: 220,
      height: 160,
      radius: 24,
    }
    const expectedX = 564 - Math.sqrt(24 ** 2 - (148 - 164) ** 2)

    expect(
      getClosestRadiusCenter({ x: expectedX, y: 148 }, 'horizontal', node),
    ).toEqual({
      x: expectedX,
      y: 148,
    })
  })
  test('get cross point with ellipse', () => {
    const position = { x: 0, y: 0 }
    const node = {
      x: 0,
      y: 0,
      rx: 10,
      ry: 5,
    }
    expect(getCrossPointWithEllipse(position, 'horizontal', node)).toEqual({
      x: 10,
      y: 0,
    })
    expect(getCrossPointWithEllipse(position, 'vertical', node)).toEqual({
      x: 0,
      y: 5,
    })
  })
})
