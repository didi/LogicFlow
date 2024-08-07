import LogicFlow, {
  GraphModel,
  EllipseNode,
  EllipseNodeModel,
} from '@logicflow/core'
import { PCTResizeParams } from './RectResize'
import ControlGroup from '../control/ControlGroup'

import NodeConfig = LogicFlow.NodeConfig

export type ResizeEllipseNodeConfig = NodeConfig & {
  properties: {
    nodeSize: {
      rx: number
      ry: number
    }
  } & Record<string, unknown>
}

export class EllipseResizeModel extends EllipseNodeModel {
  PCTResizeInfo?: PCTResizeParams
  minWidth!: number
  minHeight!: number
  maxWidth!: number
  maxHeight!: number

  constructor(data: ResizeEllipseNodeConfig, graphModel: GraphModel) {
    super(data, graphModel)
    const { nodeSize } = data.properties
    if (nodeSize) {
      this.rx = nodeSize.rx
      this.ry = nodeSize.ry
    }
  }

  initNodeData(data: any): void {
    super.initNodeData(data)
    this.minWidth = 30
    this.minHeight = 30
    this.maxWidth = 2000
    this.maxHeight = 2000
  }

  getOutlineStyle() {
    const style = super.getOutlineStyle()
    const {
      editConfigModel: { isSilentMode },
    } = this.graphModel
    if (isSilentMode) return style
    style.stroke = 'none'
    if (style.hover) {
      style.hover.stroke = 'none'
    }
    return style
  }

  getResizeOutlineStyle() {
    return {
      fill: 'none',
      stroke: 'transparent',
      strokeWidth: 1,
      strokeDasharray: '3,3',
    }
  }

  getControlPointStyle() {
    return {
      width: 7,
      height: 7,
      fill: '#FFFFFF',
      stroke: '#000000',
    }
  }

  // 该方法需要在重设宽高和最大、最小限制后被调用，不建议在 initNodeData() 方法中使用
  enableProportionResize(turnOn = true) {
    if (turnOn) {
      const ResizePCT = {
        widthPCT: 100,
        heightPCT: 100,
      }
      const ResizeBasis = {
        basisWidth: this.rx,
        basisHeight: this.ry,
      }
      const ScaleLimit = {
        maxScaleLimit: Math.min(
          (this.maxWidth / (this.rx * 2)) * 100,
          (this.maxHeight / (this.ry * 2)) * 100,
        ),
        minScaleLimit: Math.max(
          (this.minWidth / (this.rx * 2)) * 100,
          (this.minHeight / (this.ry * 2)) * 100,
        ),
      }
      this.PCTResizeInfo = {
        ResizePCT,
        ResizeBasis,
        ScaleLimit,
      }
    } else {
      delete this.PCTResizeInfo
    }
  }
}

export class EllipseResizeView extends EllipseNode {
  getControlGroup() {
    const { model, graphModel } = this.props
    return <ControlGroup model={model} graphModel={graphModel} />
  }

  // getResizeShape绘制图形，功能等同于基础椭圆的getShape功能，可以通过复写此方法，进行节点自定义
  getResizeShape() {
    return super.getShape()
  }

  getShape() {
    const {
      model,
      graphModel: {
        editConfigModel: { isSilentMode },
      },
    } = this.props
    return (
      <g>
        {this.getResizeShape()}
        {model.isSelected && !isSilentMode ? this.getControlGroup() : ''}
      </g>
    )
  }
}

export const EllipseResize = {
  type: 'ellipse',
  view: EllipseResizeView,
  model: EllipseResizeModel,
}

export default EllipseResize
