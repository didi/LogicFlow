import { Vector, Point } from './vector'

export class Matrix extends Array {
  rows: number
  columns: number

  constructor(...vectors: any[]) {
    super(vectors.length)
    this.fill(new Array(3))
    vectors.forEach((v: any, index: number) => {
      this[index] = v
    })
    this.columns = vectors[0].length
    this.rows = vectors.length
    Object.setPrototypeOf(this, Matrix.prototype)
  }

  getRow(index: number) {
    return this[index]
  }

  getColumn(index: number) {
    return [...this.map((row: Vector) => row[index])]
  }

  // 转置
  transpose() {
    const vectors: any[] = []
    for (let i = 0; i < this.columns; i++) {
      vectors.push(this.getColumn(i))
    }
    return new Matrix(...vectors)
  }

  // 叉乘
  cross(m1: Matrix) {
    const arr = new Array(this.rows).fill('').map((): any => [])
    if (this.columns === m1.rows) {
      for (let i = 0; i < this.rows; i++) {
        const row = this.getRow(i)
        for (let j = 0; j < m1.columns; j++) {
          const column = m1.getColumn(j)
          // eslint-disable-next-line max-len
          arr[i][j] = row.reduce(
            (prev: number, r: number, index: number) =>
              prev + r * column[index],
            0,
          )
        }
      }
    }
    return new Matrix(...arr)
  }

  // 返回二维坐标（降维）
  to2D() {
    return this.map((item: any) => [item[0], item[1]])
  }

  toPoints() {
    return this.map((item: any) => new Point(item[0], item[1]))
  }

  toString(): string {
    const [a, b] = this[0]
    const [c, d] = this[1]
    const [e, f] = this[2]
    return `matrix(${a} ${b} ${c} ${d} ${e} ${f})`
  }

  translate(tx: number, ty: number): Matrix {
    return this.cross(new TranslateMatrix(tx, ty))
  }

  rotate(angle: number): Matrix {
    return this.cross(new RotateMatrix(angle))
  }

  scale(sx: number, sy: number): Matrix {
    return this.cross(new ScaleMatrix(sx, sy))
  }
}

export class RotateMatrix extends Matrix {
  constructor(theta: number) {
    super(
      new Vector(+Math.cos(theta).toFixed(2), +Math.sin(theta).toFixed(2), 0),
      new Vector(-Math.sin(theta).toFixed(2), +Math.cos(theta).toFixed(2), 0),
      new Vector(0, 0, 1),
    )
    Object.setPrototypeOf(this, RotateMatrix.prototype)
  }

  inverse() {
    return this.transpose()
  }
}

export class ScaleMatrix extends Matrix {
  private sx: number
  private sy: number

  constructor(sx: number, sy: number) {
    super(new Vector(sx, 0, 0), new Vector(0, sy, 0), new Vector(0, 0, 1))
    this.sx = sx
    this.sy = sy
    Object.setPrototypeOf(this, ScaleMatrix.prototype)
  }

  inverse() {
    return new ScaleMatrix(1 / this.sx, 1 / this.sy)
  }
}

export class TranslateMatrix extends Matrix {
  private tx: number
  private ty: number

  constructor(tx: number, ty: number) {
    super(new Vector(1, 0, 0), new Vector(0, 1, 0), new Vector(tx, ty, 1))
    this.tx = tx
    this.ty = ty
    Object.setPrototypeOf(this, TranslateMatrix.prototype)
  }

  inverse() {
    return new TranslateMatrix(-this.tx, -this.ty)
  }
}
