import { BaseNode, RectNodeModel } from '@logicflow/core'

class MarkRootModel extends RectNodeModel {
  static extendKey = 'MarkRootModel'
}

class MarkRootView extends BaseNode<any> {
  getShape() {
    return null
  }
}

const MarkRoot = {
  type: 'faker:root',
  view: MarkRootView,
  model: MarkRootModel,
}

export default MarkRoot
