import LogicFlow from '@logicflow/core'
import { GroupNode, GroupNodeModel } from '@logicflow/extension'

import NodeConfig = LogicFlow.NodeConfig
import TextConfig = LogicFlow.TextConfig

export class CustomGroup extends GroupNode {}

export class CustomGroupModel extends GroupNodeModel {
  foldedText?: TextConfig

  initNodeData(data: NodeConfig) {
    super.initNodeData(data)
    this.isRestrict = true
    this.resizable = true
    this.width = 480
    this.height = 280
  }

  getNodeStyle() {
    const style = super.getNodeStyle()
    style.stroke = '#AEAFAE'
    style.strokeWidth = 1
    return style
  }

  foldGroup(folded: boolean) {
    super.foldGroup(folded)
    // this.isFolded = folded

    if (folded) {
      if (this.foldedText) {
        this.text = { ...this.foldedText }
      }
      if (!this.text.value) {
        this.text.value = '已折叠分组'
      }
      this.text.x = this.x + 10
      this.text.y = this.y
    } else {
      this.foldedText = { ...this.text }
      this.text.value = ''
    }
  }

  // isAllowAppendIn(nodeData) {
  //   if (nodeData.type === 'rect') {
  //     return false
  //   }
  //   return true
  // }
}

export const customGroup = {
  type: 'custom-group',
  view: CustomGroup,
  model: CustomGroupModel,
}

export default customGroup
