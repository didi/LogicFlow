import { cloneDeep } from 'lodash-es'
import LogicFlow from '../../LogicFlow'
import BaseEdgeModel from './BaseEdgeModel'
import { ModelType } from '../../constant'

import Point = LogicFlow.Point

export class LineEdgeModel extends BaseEdgeModel {
  modelType = ModelType.LINE_EDGE
  getEdgeStyle() {
    const { line } = this.graphModel.theme
    const style = super.getEdgeStyle()
    const { style: customStyle = {} } = this.properties
    return {
      ...style,
      ...cloneDeep(line),
      ...cloneDeep(customStyle),
    }
  }
  getTextPosition(): Point {
    return {
      x: (this.startPoint.x + this.endPoint.x) / 2,
      y: (this.startPoint.y + this.endPoint.y) / 2,
    }
  }
}

export default LineEdgeModel
