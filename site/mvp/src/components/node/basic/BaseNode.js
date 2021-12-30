import { BaseNode, BaseNodeModel } from '@logicflow/core'

class BaseNewNode extends BaseNode {
}

class BaseNewModel extends BaseNodeModel {
  setAttributes () {
    this.fill = 'red'
  }
}

export default {
  type: 'BaseNode',
  view: BaseNewNode,
  model: BaseNewModel
}
