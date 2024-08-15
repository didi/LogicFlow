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

export type IEllipseNodeProperties = {
  rx?: number
  ry?: number
  style?: LogicFlow.CommonTheme
  textStyle?: LogicFlow.CommonTheme

  [key: string]: unknown
}

export class EllipseNodeModel<
  P extends IEllipseNodeProperties = IEllipseNodeProperties,
> extends BaseNodeModel<P> {
  modelType = ModelType.ELLIPSE_NODE
  @observable rx = 30
  @observable ry = 45
  // @observable properties: IEllipseNodeProperties = {}

  constructor(data: NodeConfig<P>, graphModel: GraphModel) {
    super(data, graphModel)
    // this.properties = data.properties || {}

    this.initNodeData(data)
    this.setAttributes()
  }

  setAttributes() {
    super.setAttributes()

    const { rx, ry } = this.properties
    if (rx) {
      this.rx = rx
    }
    if (ry) {
      this.ry = ry
    }
  }

  getNodeStyle() {
    const style = super.getNodeStyle()
    const {
      graphModel: {
        theme: { ellipse },
      },
    } = this
    const { style: customStyle = {} } = this.properties
    return {
      ...style,
      ...cloneDeep(ellipse),
      ...cloneDeep(customStyle),
    }
  }

  @computed get width(): number {
    return this.rx * 2
  }

  @computed get height(): number {
    return this.ry * 2
  }

  getDefaultAnchor() {
    const { x, y, rx, ry } = this
    return [
      { x, y: y - ry, id: `${this.id}_0` },
      { x: x + rx, y, id: `${this.id}_1` },
      { x, y: y + ry, id: `${this.id}_2` },
      { x: x - rx, y, id: `${this.id}_3` },
    ]
  }

  resize(resizeInfo: ResizeInfo): ResizeNodeData {
    const { width, height, deltaX, deltaY } = resizeInfo
    // 移动节点以及文本内容
    this.move(deltaX / 2, deltaY / 2)

    this.rx = width
    this.ry = height
    this.setProperties({
      rx: width,
      ry: height,
    })
    return this.getData()
  }
}

export default EllipseNodeModel
