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

  [key: string]: any
}

export class EllipseNodeModel extends BaseNodeModel {
  modelType = ModelType.ELLIPSE_NODE
  @observable rx = 30
  @observable ry = 45
  @observable properties: IEllipseNodeProperties = {}

  constructor(data: NodeConfig, graphModel: GraphModel) {
    super(data, graphModel)
    this.properties = data.properties || {}

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
    return {
      ...style,
      ...cloneDeep(ellipse),
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
    const { width, height } = resizeInfo

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
