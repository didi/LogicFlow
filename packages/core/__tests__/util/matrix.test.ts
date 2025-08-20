import { Matrix } from '../../src/util/matrix'
import { Vector } from '../../src/util/vector'

describe('Matrix Utils', () => {
  test('Matrix constructor should create matrix from vectors', () => {
    const vector1 = new Vector(1, 2, 3)
    const vector2 = new Vector(4, 5, 6)
    const matrix = new Matrix(vector1, vector2)

    expect(matrix.rows).toBe(2)
    expect(matrix.columns).toBe(3)
    expect(matrix[0]).toBe(vector1)
    expect(matrix[1]).toBe(vector2)
  })

  test('Matrix getRow should return correct row', () => {
    const vector1 = new Vector(1, 2, 3)
    const vector2 = new Vector(4, 5, 6)
    const matrix = new Matrix(vector1, vector2)

    expect(matrix.getRow(0)).toBe(vector1)
    expect(matrix.getRow(1)).toBe(vector2)
  })

  test('Matrix getColumn should return correct column', () => {
    const vector1 = new Vector(1, 2, 3)
    const vector2 = new Vector(4, 5, 6)
    const matrix = new Matrix(vector1, vector2)

    const column0 = matrix.getColumn(0)
    const column1 = matrix.getColumn(1)
    const column2 = matrix.getColumn(2)

    expect(column0).toEqual([1, 4])
    expect(column1).toEqual([2, 5])
    expect(column2).toEqual([3, 6])
  })

  test('Matrix transpose should create transposed matrix', () => {
    const vector1 = new Vector(1, 2)
    const vector2 = new Vector(3, 4)
    const matrix = new Matrix(vector1, vector2)

    const transposed = matrix.transpose()

    // Original matrix: 2 rows x 3 columns (Vector has z coordinate)
    // Transposed matrix: 3 rows x 2 columns
    expect(transposed.rows).toBe(3)
    expect(transposed.columns).toBe(2)
    expect(transposed.getRow(0)).toEqual([1, 3])
    expect(transposed.getRow(1)).toEqual([2, 4])
    expect(transposed.getRow(2)).toEqual([0, 0]) // z coordinates
  })
})
