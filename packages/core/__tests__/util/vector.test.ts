import { Vector, Point } from '../../src/util/vector'

describe('Vector Utils', () => {
  test('Vector constructor should create vector with x, y coordinates', () => {
    const vector = new Vector(10, 20)
    expect(vector.x).toBe(10)
    expect(vector.y).toBe(20)
    expect(vector.z).toBe(0)
  })

  test('Vector constructor with z coordinate', () => {
    const vector = new Vector(10, 20, 30)
    expect(vector.x).toBe(10)
    expect(vector.y).toBe(20)
    expect(vector.z).toBe(30)
  })

  test('Vector add method should add two vectors', () => {
    const vector1 = new Vector(10, 20)
    const vector2 = new Vector(5, 15)
    const result = vector1.add(vector2) as Vector

    expect(result.x).toBe(15)
    expect(result.y).toBe(35)
  })

  test('Vector subtract method should subtract two vectors', () => {
    const vector1 = new Vector(10, 20)
    const vector2 = new Vector(5, 15)
    const result = vector1.subtract(vector2) as Vector

    expect(result.x).toBe(5)
    expect(result.y).toBe(5)
  })

  test('Vector toString should return "Vector"', () => {
    const vector = new Vector(10, 20)
    expect(vector.toString()).toBe('Vector')
  })

  test('Point constructor should create point with x, y coordinates', () => {
    const point = new Point(10, 20)
    expect(point.x).toBe(10)
    expect(point.y).toBe(20)
    expect(point.z).toBe(1)
  })

  test('Point toString should return "Point"', () => {
    const point = new Point(10, 20)
    expect(point.toString()).toBe('Point')
  })
})
