import { cloneDeep } from 'lodash-es'
import { computed, observable } from 'mobx'
import BaseNodeModel from './BaseNodeModel'
import GraphModel from '../GraphModel'
import LogicFlow from '../../LogicFlow'
import { ModelType } from '../../constant'
import { ResizeControl } from '../../view/Control'

import NodeConfig = LogicFlow.NodeConfig
import ResizeInfo = ResizeControl.ResizeInfo
import ResizeNodeData = ResizeControl.ResizeNodeData

export type ICircleNodeProperties = {
  r?: number
  style?: LogicFlow.CommonTheme
  textStyle?: LogicFlow.CommonTheme

  [key: string]: any
}

export class CircleNodeModel<
  P extends ICircleNodeProperties = ICircleNodeProperties,
> extends BaseNodeModel<P> {
  modelType = ModelType.CIRCLE_NODE
  // @observable properties: ICircleNodeProperties = {}
  @observable r = 50

  @computed get width(): number {
    return this.r * 2
  }

  @computed get height(): number {
    return this.r * 2
  }

  constructor(data: NodeConfig<P>, graphModel: GraphModel) {
    super(data, graphModel)
    // this.properties = data.properties || {}

    this.initNodeData(data)
    this.setAttributes()
  }

  setAttributes() {
    super.setAttributes()

    const { r } = this.properties
    if (r) {
      this.r = r
    }
  }

  getNodeStyle() {
    const style = super.getNodeStyle()
    const {
      graphModel: {
        theme: { circle },
      },
    } = this
    const { style: customStyle = {} } = this.properties
    return {
      ...style,
      ...cloneDeep(circle),
      ...cloneDeep(customStyle),
    }
  }

  getDefaultAnchor() {
    const { x, y, r } = this
    return [
      { x, y: y - r, id: `${this.id}_0` },
      { x: x + r, y, id: `${this.id}_1` },
      { x, y: y + r, id: `${this.id}_2` },
      { x: x - r, y, id: `${this.id}_3` },
    ]
  }

  resize(resizeInfo: ResizeInfo): ResizeNodeData {
    const { width, deltaX, deltaY } = resizeInfo
    // 移动节点以及文本内容
    this.move(deltaX / 2, deltaY / 2)

    this.r = width
    this.setProperties({
      r: width,
    })
    return this.getData()
  }
}

export default CircleNodeModel
