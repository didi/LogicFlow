import { cloneDeep, isNil } from 'lodash-es'
import { observable } from 'mobx'
import BaseNodeModel from './BaseNodeModel'
import GraphModel from '../GraphModel'
import LogicFlow from '../../LogicFlow'
import { ModelType } from '../../constant'

export type IRectNodeProperties = {
  width?: number
  height?: number
  radius?: number
  style?: LogicFlow.CommonTheme
  textStyle?: LogicFlow.CommonTheme

  [key: string]: unknown
}

export class RectNodeModel<
  P extends IRectNodeProperties = IRectNodeProperties,
> extends BaseNodeModel<P> {
  modelType = ModelType.RECT_NODE
  @observable radius = 0
  // @observable properties: P

  constructor(data: LogicFlow.NodeConfig<P>, graphModel: GraphModel) {
    super(data, graphModel)

    // TODO：类字段初始化会覆盖 super、setAttributes 中设置的属性
    // this.properties = data.properties || {}
    // TODO: bug here, 上面更新 properties 会触发 setAttributes，下面再主动调用，会导致触发两次
    this.initNodeData(data)
    this.setAttributes()
  }

  setAttributes() {
    super.setAttributes()

    const { width, height, radius } = this.properties
    if (!isNil(width)) this.width = width
    if (!isNil(height)) this.height = height

    // 矩形特有
    if (!isNil(radius)) this.radius = radius
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
    const { style: customStyle = {} } = this.properties
    return {
      ...style,
      ...cloneDeep(rect),
      ...cloneDeep(customStyle),
    }
  }
}

export default RectNodeModel
