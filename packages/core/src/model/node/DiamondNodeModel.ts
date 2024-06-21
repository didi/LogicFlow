import { cloneDeep, forEach, map } from 'lodash-es'
import { computed, observable } from 'mobx'
import BaseNodeModel from './BaseNodeModel'
import LogicFlow from '../../LogicFlow'
import { ModelType } from '../../constant'
import PointTuple = LogicFlow.PointTuple
import Point = LogicFlow.Point
import { ResizeControl } from '../../view/Control'

import ResizeInfo = ResizeControl.ResizeInfo
import ResizeNodeData = ResizeControl.ResizeNodeData

export class DiamondNodeModel extends BaseNodeModel {
  modelType = ModelType.DIAMOND_NODE
  @observable rx = 30
  @observable ry = 50
  @observable properties: any = {}

  getNodeStyle() {
    const style = super.getNodeStyle()
    const {
      graphModel: {
        theme: { diamond },
      },
    } = this
    return {
      ...style,
      ...cloneDeep(diamond),
    }
  }

  @computed get points(): PointTuple[] {
    const { x, y, rx, ry } = this
    return [
      [x, y - ry],
      [x + rx, y],
      [x, y + ry],
      [x - rx, y],
    ]
  }

  @computed get pointsPosition(): Point[] {
    return map(this.points, ([x, y]) => ({ x, y }))
  }

  @computed get width(): number {
    let min = Number.MAX_SAFE_INTEGER
    let max = Number.MIN_SAFE_INTEGER
    forEach(this.points, ([x]) => {
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
    forEach(this.points, ([, y]) => {
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
    return map(this.points, ([x, y], idx) => ({
      x,
      y,
      id: `${this.id}_${idx}`,
    }))
  }

  resize(resizeInfo: ResizeInfo): ResizeNodeData {
    const { width, height, deltaX, deltaY } = resizeInfo
    // 移动节点以及文本内容
    this.move(deltaX / 2, deltaY / 2)

    this.rx = width
    this.ry = height
    // this.setProperties({
    //   rx,
    //   ry,
    // })

    return this.getData()
  }
}

export default DiamondNodeModel
