import { h } from '@logicflow/core'
import BaseNode from './BaseNode'

class SwitchNode extends BaseNode.view {
  getIcon() {
    const { width, height } = this.props.model
    return h('image', {
      width: 30,
      height: 30,
      x: -width / 2,
      y: -height / 2,
      href: 'images/switch.svg',
    })
  }
}

class SwitchNodeModel extends BaseNode.model {
  initNodeData(data) {
    super.initNodeData(data)
    this.defaultFill = 'rgb(226, 217, 110)'
  }
}

export default {
  type: 'switch-node',
  model: SwitchNodeModel,
  view: SwitchNode,
}
