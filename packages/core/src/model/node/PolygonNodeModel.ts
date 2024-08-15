import { cloneDeep, map } from 'lodash-es'
import { computed, observable } from 'mobx'
import BaseNodeModel from './BaseNodeModel'
import GraphModel from '../GraphModel'
import LogicFlow from '../../LogicFlow'
import { ModelType } from '../../constant'
import { ResizeControl } from '../../view/Control'
import Point = LogicFlow.Point
import PointTuple = LogicFlow.PointTuple
import NodeConfig = LogicFlow.NodeConfig
import ResizeInfo = ResizeControl.ResizeInfo
import ResizeNodeData = ResizeControl.ResizeNodeData
import { normalizePolygon } from '../../util'

export type IPolygonNodeProperties = {
  points?: PointTuple[]
  width?: number
  height?: number
  style?: LogicFlow.CommonTheme
  textStyle?: LogicFlow.CommonTheme

  [key: string]: unknown
}

export class PolygonNodeModel<
  P extends IPolygonNodeProperties = IPolygonNodeProperties,
> extends BaseNodeModel<P> {
  modelType = ModelType.POLYGON_NODE
  @observable points: PointTuple[] = [
    [50, 0],
    [100, 50],
    [50, 100],
    [0, 50], // 菱形
    // [0,100], [50,25], [50,75], [100,0] // 闪电
    // [100, 10],
    // [40, 198],
    // [190, 78],
    // [10, 78],
    // [160, 198], // 五角星
  ]
  // @observable properties: IPolygonNodeProperties = {}

  constructor(data: NodeConfig<P>, graphModel: GraphModel) {
    super(data, graphModel)
    // this.properties = data.properties || {}

    this.initNodeData(data)
    this.setAttributes()
  }

  setAttributes() {
    super.setAttributes()

    const { points, width, height } = this.properties
    // DONE: 如果设置了 points，又设置了节点的宽高，则需要做如下操作
    // 1. 将 points 的位置置零，即将图形向原点移动（找到 points 中 x,y 的最小值，所有坐标值减掉该值）
    // 2. 按宽高的比例重新计算最新的 points
    // if (points) {
    //   this.points = points
    // }
    const nextPoints = points || this.points
    this.points = normalizePolygon(nextPoints, width, height)
  }

  getNodeStyle() {
    const style = super.getNodeStyle()
    const {
      graphModel: {
        theme: { polygon },
      },
    } = this
    const { style: customStyle = {} } = this.properties
    return {
      ...style,
      ...cloneDeep(polygon),
      ...cloneDeep(customStyle),
    }
  }

  /**
   * 由于大多数情况下，我们初始化拿到的多边形坐标都是基于原点的（例如绘图工具到处的svg）。
   * 在logicflow中对多边形进行移动，我们不需要去更新points，
   * 而是去更新多边形中心点即可。
   */
  @computed get pointsPosition(): Point[] {
    const { x, y, width, height } = this
    return this.points.map((item) => ({
      x: item[0] + x - width / 2,
      y: item[1] + y - height / 2,
    }))
  }

  @computed get width(): number {
    let min = Number.MAX_SAFE_INTEGER
    let max = Number.MIN_SAFE_INTEGER
    this.points.forEach(([x]) => {
      if (x < min) {
        min = x
      }
      if (x > max) {
        max = x
      }
    })
    return max - min
  }

  @computed get height(): number {
    let min = Number.MAX_SAFE_INTEGER
    let max = Number.MIN_SAFE_INTEGER
    this.points.forEach(([, y]) => {
      if (y < min) {
        min = y
      }
      if (y > max) {
        max = y
      }
    })
    return max - min
  }

  getDefaultAnchor() {
    const { x, y, width, height, points } = this
    return points.map(([x1, y1], idx) => ({
      x: x + x1 - width / 2,
      y: y + y1 - height / 2,
      id: `${this.id}_${idx}`,
    }))
  }

  resize(resizeInfo: ResizeInfo): ResizeNodeData {
    const { width, height, deltaX, deltaY } = resizeInfo
    // 移动节点以及文本内容
    this.move(deltaX / 2, deltaY / 2)

    const nextPoints: PointTuple[] = map(this.points, ([x, y]) => [
      (x * width) / this.width,
      (y * height) / this.height,
    ])
    this.points = nextPoints

    this.properties.points = nextPoints
    // this.setProperties({
    //   points: toJS(nextPoints),
    // })

    return this.getData()
  }
}

export default PolygonNodeModel
