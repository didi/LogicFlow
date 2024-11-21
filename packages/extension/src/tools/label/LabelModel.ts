import LogicFlow, {
  BaseEdgeModel,
  BaseNodeModel,
  GraphModel,
  LogicFlowUtil,
  h,
  observable,
  toJS,
} from '@logicflow/core'
import { assign } from 'lodash-es'

import LabelData = LogicFlow.LabelData
import LabelConfig = LogicFlow.LabelConfig
import GraphElement = LogicFlow.GraphElement

// export type ILabelConfig = {}
const { createUuid } = LogicFlowUtil

export class LabelModel {
  id: string
  type: string = 'label' // 目前写死，后续可以根据业务需求进行扩展

  @observable x!: number
  @observable y!: number
  @observable content: string = ''
  @observable value: string = ''
  @observable rotate?: number
  @observable style: h.JSX.CSSProperties = {}

  @observable zIndex?: number
  @observable vertical: boolean = false // 文字是否垂直显示
  @observable editable: boolean = true // label 是否可编辑
  @observable draggable: boolean = true // label 是否可拖拽
  @observable labelWidth?: number
  @observable textOverflowMode:
    | 'ellipsis'
    | 'wrap'
    | 'clip'
    | 'nowrap'
    | 'default' = 'default' // Label 节点的文本溢出模式

  // TODO: 后续看 label 是否可以独立存在，不依赖节点 or 边
  element: BaseNodeModel | BaseEdgeModel // 当前节点关联的元素 Model
  graphModel: GraphModel

  constructor(
    config: LabelConfig,
    element: GraphElement,
    graphModel: GraphModel,
  ) {
    this.element = element
    this.graphModel = graphModel
    this.id = config.id ?? createUuid()

    this.initLabelData(config)
  }

  initLabelData(config: LabelConfig): void {
    assign(this, config)
  }

  getData(): LabelData {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      type: 'label',
      content: this.content,
      value: this.value,
      rotate: this.rotate,
      style: toJS(this.style),

      draggable: this.draggable,
      editable: this.editable,
      labelWidth: this.labelWidth,
      textOverflowMode: this.textOverflowMode,

      vertical: this.vertical,
    }
  }
}

export default LabelModel
