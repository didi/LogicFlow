import { h } from '@logicflow/core'
import BaseNode from './BaseNode'

class FunctionNode extends BaseNode.view {
  getIcon() {
    const { width, height } = this.props.model
    return h('image', {
      width: 30,
      height: 30,
      x: -width / 2,
      y: -height / 2,
      href: 'images/function.svg',
    })
  }
}

class FunctionNodeModel extends BaseNode.model {
  initNodeData(data) {
    super.initNodeData(data)
    this.defaultFill = 'rgb(253, 208, 162)'
  }
}

export default {
  type: 'function-node',
  model: FunctionNodeModel,
  view: FunctionNode,
}
