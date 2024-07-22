import LogicFlow, {
  BaseEdgeModel,
  BaseNodeModel,
  GraphModel,
  LogicFlowUtil,
  h,
} from '@logicflow/core'
import { observable } from 'mobx'
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
  @observable style: h.JSX.CSSProperties = {}

  @observable editable: boolean = true // label 是否可编辑
  @observable draggable: boolean = false // label 是否可拖拽
  @observable vertical: boolean = false // 文字是否垂直显示

  // TODO: 后续看 label 是否可以独立存在，不依赖节点 or 边
  @observable relateId!: string // 当前 label 关联节点 id
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
    console.log('config', config)
    assign(this, config)
  }

  getData(): LabelData {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      content: this.content,
      value: this.value,
    }
  }
}

export default LabelModel
