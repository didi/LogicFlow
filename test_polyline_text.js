// 测试折线边文本居中问题
const {
  PolylineEdgeModel,
} = require('./packages/core/src/model/edge/PolylineEdgeModel.ts')

// 模拟一个简单的折线边模型
class TestPolylineEdgeModel extends PolylineEdgeModel {
  constructor() {
    super()
    this.points = '0,0 100,0 100,100 0,100'
    this.startPoint = { x: 0, y: 0 }
    this.endPoint = { x: 0, y: 100 }
  }
}

// 测试文本位置计算
const model = new TestPolylineEdgeModel()
const textPosition = model.getTextPosition()

console.log('文本位置计算结果:', textPosition)
console.log('期望的中心位置应该是所有点的平均值')

// 手动计算所有点的中心
const points = [
  { x: 0, y: 0 },
  { x: 100, y: 0 },
  { x: 100, y: 100 },
  { x: 0, y: 100 },
]

const avgX = points.reduce((sum, p) => sum + p.x, 0) / points.length
const avgY = points.reduce((sum, p) => sum + p.y, 0) / points.length

console.log('手动计算的中心位置:', { x: avgX, y: avgY })
console.log(
  '计算结果是否匹配:',
  Math.abs(textPosition.x - avgX) < 0.001 &&
    Math.abs(textPosition.y - avgY) < 0.001,
)
