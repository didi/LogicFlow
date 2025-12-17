import LogicFlow, { GraphModel, RectNode, RectNodeModel } from '@logicflow/core'
import NodeConfig = LogicFlow.NodeConfig

class CenterAnchorNodeModel extends RectNodeModel {
  constructor(data: NodeConfig, graphModel: GraphModel) {
    super(data, graphModel)
    this.anchorsOffset = [
      [0, 0],
      [0, -10],
      [10, 0],
      [-10, 0],
    ]
  }
}

export default {
  type: 'centerAnchorRect',
  view: RectNode,
  model: CenterAnchorNodeModel,
}
