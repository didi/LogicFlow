import LogicFlow, {
  BaseEdgeModel,
  BaseNodeModel,
  GraphModel,
  LogicFlowUtil,
  h,
} from '@logicflow/core'
import { observable, action } from 'mobx'
import { assign, cloneDeep, findIndex } from 'lodash-es'

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

  // 编辑态记录
  @observable isHovered: boolean = false
  @observable isDragging: boolean = false
  @observable isEditing: boolean = false

  // TODO: 是否在 LabelModel 中管理当前 Label 的大小

  @observable vertical: boolean = false // 文字是否垂直显示
  @observable editable: boolean = true // label 是否可编辑
  @observable draggable: boolean = true // label 是否可拖拽

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
    console.log('this.id ===>>>', this.id)

    this.initLabelData(config)
  }

  initLabelData(config: LabelConfig): void {
    // console.log('config', config)
    assign(this, config)

    // 1. 将一些节点维度的配置，添加到节点 model 上，eg: isVertical
    // this.updateElementProperty()
  }

  // TODO: 如何将 label 的数据同步到 element 上
  // 1. 调用 element.updateProperties()，包括 labelConfig, labelOption, labelData。分别如何返回呢？
  //
  // 2. 需要重写 node.getData 吗？

  @action moveLabel(deltaX: number, deltaY: number) {
    this.x += deltaX
    this.y += deltaY

    console.log('this.x', this.x)
    console.log('this.y', this.y)

    // this.element.moveText(deltaX, deltaY)
    this.updateElementProperty()
  }

  @action updateLabel(text: string, content: string) {
    console.log('text ->', text)
    console.log('content ->', content)

    // TODO: 调用 element.updateProperty() 更新 label 的数据
    // this.element.updateText(text)
    this.updateElementProperty()
  }

  updateElementProperty() {
    const labelData = this.getData()
    console.log('labelData --->>>', labelData)
    // 1. 得到 _label 中当前 label 对应的数据，做替换
    const { _label } = this.element.getProperties()
    const elementLabels = cloneDeep(_label) as LabelConfig[]
    const idx = findIndex(elementLabels as LabelConfig[], labelData.id)
    console.log('idx', idx)
    if (idx > -1) {
      elementLabels[idx] = labelData
    }

    console.log('elementLabels --->>>', elementLabels)

    this.element.setProperty('_label', elementLabels)
  }

  getData(): LabelData {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      content: this.content,
      value: this.value,
      style: this.style,

      draggable: this.draggable,
      editable: this.editable,

      vertical: this.vertical,
    }
  }
}

export default LabelModel
