import { cloneDeep } from 'lodash-es'
import { observable } from 'mobx'
import BaseNodeModel from './BaseNodeModel'
import GraphModel from '../GraphModel'
import LogicFlow from '../../LogicFlow'
import { ModelType } from '../../constant'

export type IRectNodeModel = {
  width?: number
  height?: number
  style?: LogicFlow.CommonTheme
  textStyle?: LogicFlow.CommonTheme

  [key: string]: any
}

export class RectNodeModel extends BaseNodeModel {
  modelType = ModelType.RECT_NODE
  @observable radius = 0
  @observable properties: IRectNodeModel = {}

  constructor(data: LogicFlow.NodeConfig, graphModel: GraphModel) {
    super(data, graphModel)
    this.properties = data.properties || {}

    this.setAttributes()
  }

  setAttributes() {
    super.setAttributes()

    const { width, height } = this.properties
    if (width) this.width = width
    if (height) this.height = height
  }

  getDefaultAnchor() {
    const { x, y, width, height } = this
    return [
      { x, y: y - height / 2, id: `${this.id}_0` },
      { x: x + width / 2, y, id: `${this.id}_1` },
      { x, y: y + height / 2, id: `${this.id}_2` },
      { x: x - width / 2, y, id: `${this.id}_3` },
    ]
  }

  getNodeStyle() {
    const style = super.getNodeStyle()
    const { rect } = this.graphModel.theme
    return {
      ...style,
      ...cloneDeep(rect),
    }
  }
}

export default RectNodeModel
