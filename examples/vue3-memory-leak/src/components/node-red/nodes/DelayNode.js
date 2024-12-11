import { h } from '@logicflow/core'
import BaseNode from './BaseNode'

class DelayNode extends BaseNode.view {
  getIcon() {
    const { width, height } = this.props.model
    return h('image', {
      width: 30,
      height: 30,
      x: -width / 2,
      y: -height / 2,
      href: 'images/delay.svg',
    })
  }
}

class DelayNodeModel extends BaseNode.model {
  initNodeData(data) {
    super.initNodeData(data)
    this.defaultFill = 'rgb(230, 224, 248)'
  }
}

export default {
  type: 'delay-node',
  model: DelayNodeModel,
  view: DelayNode,
}
