import LogicFlow from '@logicflow/core'
import { GroupNode, GroupNodeModel } from '@logicflow/extension'

import TextConfig = LogicFlow.TextConfig
import NodeData = LogicFlow.NodeData

export class SubProcess extends GroupNode {}

export class SubProcessModel extends GroupNodeModel {
  foldedText?: TextConfig
  setAttributes() {
    // const size = 80
    const circleOnlyAsTarget = {
      message: '正方形节点下一个节点只能是圆形节点',
      validate: () => {
        return false
      },
    }
    this.targetRules.push(circleOnlyAsTarget)
  }

  initNodeData(data: NodeData) {
    super.initNodeData(data)
    this.foldable = true
    this.resizable = true
    this.width = 400
    this.height = 200
  }

  getNodeStyle() {
    const style = super.getNodeStyle()
    style.stroke = '#989891'
    style.strokeWidth = 1
    style.strokeDasharray = '3 3'
    if (this.isSelected) {
      style.stroke = 'rgb(124, 15, 255)'
    }
    if (this.isFolded) {
      style.fill = '#47C769'
    }
    return style
  }

  foldGroup(folded: boolean) {
    super.foldGroup(folded)
    if (folded) {
      if (this.foldedText) {
        this.text = { ...this.foldedText }
      }
      if (!this.text.value) {
        this.text.value = '已折叠分组已折叠分组已折叠分组'
      }
      this.text.x = this.x + 10
      this.text.y = this.y
    } else {
      this.foldedText = { ...this.text }
      this.text.value = ''
    }
  }

  // isAllowAppendIn(nodeData) {
  //   return false
  // }
}

export const subProcess = {
  type: 'sub-process',
  view: SubProcess,
  model: SubProcessModel,
}

export default subProcess
