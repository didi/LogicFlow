import { assign, keys, set } from 'lodash-es'
import { createElement as h } from 'preact/compat'
import { action, observable } from 'mobx'
import LogicFlow from '@logicflow/core'
import LabelData = LogicFlow.LabelData

export interface ILabelModel {
  id: string // label唯一标识
  x: number // label中心在x轴上的位置
  y: number // label中心在y轴上的位置
  content: string // label html的内容，
  value: string // label文本内容
  relateId: string // 关联节点/关联边的id
  type: string // 关联元素的类型，目前取值：节点node/边edge
  //样式属性
  style: h.JSX.CSSProperties // label自定义样式
  // 状态属性
  editable: boolean
  draggable: boolean
  verticle: boolean // 是否渲染纵向文本
  isFocus: boolean // label是否获焦
  isHovered: boolean // label是否hover
  isInLine: boolean // label是否在边上
  // 位置属性
  xDeltaPercent: number // label在节点/边上相对x轴最左边的偏移比例，用于节点和边调整后更新文本坐标
  yDeltaPercent: number // label在节点/边上相对y轴最上面的偏移比例，用于节点和边调整后更新文本坐标
  yDeltaDistance: number // label在x轴上相对节点/边的偏移距离
  xDeltaDistance: number // label在y轴上相对节点/边的偏移距离
  ratio: number // 文本在边上的位置占比
  // setAttribute: (key: string, value: any) => void
  // setAttributes: (config?: any) => void
  // initLabelData: (config: any) => void
}

export class LabelModel implements ILabelModel {
  public id = ''
  @observable type = ''
  @observable x = 0
  @observable y = 0
  @observable content = ''
  @observable value = ''
  @observable relateId = ''
  // 样式属性
  @observable style: h.JSX.CSSProperties = {}
  // 状态属性
  @observable editable = true
  @observable draggable = false
  @observable verticle = false
  @observable isFocus = false
  @observable isHovered = false
  @observable isInLine = true
  // 位置属性
  @observable xDeltaPercent
  @observable yDeltaPercent
  @observable yDeltaDistance
  @observable xDeltaDistance
  @observable ratio

  constructor(data) {
    assign(this, data)
  }
  @action setAttributes(config): void {
    keys(config).forEach((key) => {
      set(this, key, config[key])
    })
  }
  @action moveLabel(deltaX, deltaY) {
    this.x += deltaX
    this.y += deltaY
  }
  @action setAttribute(key: string, value: any) {
    set(this, key, value)
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
