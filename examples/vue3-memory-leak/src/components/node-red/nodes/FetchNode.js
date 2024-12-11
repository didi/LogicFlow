import { h } from '@logicflow/core'
import BaseNode from './BaseNode'

class FetchNode extends BaseNode.view {
  getIcon() {
    const { width, height } = this.props.model
    return h('image', {
      width: 30,
      height: 30,
      x: -width / 2,
      y: -height / 2,
      href: 'images/fetch.svg',
    })
  }
}

class FetchNodeModel extends BaseNode.model {
  initNodeData(data) {
    super.initNodeData(data)
    this.defaultFill = 'rgb(231, 231, 174)'
  }
}

export default {
  type: 'fetch-node',
  model: FetchNodeModel,
  view: FetchNode,
}
