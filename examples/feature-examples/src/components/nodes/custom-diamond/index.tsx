import LogicFlow, { DiamondNode, DiamondNodeModel } from '@logicflow/core'
import NodeConfig = LogicFlow.NodeConfig

class CustomDiamondModel extends DiamondNodeModel {
  // constructor(data: any, graphModel: any) {
  //   console.log('CustomCircleModel', 'constructor');
  //   super(data, graphModel)
  // }

  initNodeData(data: NodeConfig) {
    super.initNodeData(data)
    this.rx = 50
    this.ry = 60
  }

  // or
  // setAttributes() {
  //  this.rx = 50
  //  this.ry = 60
  // }
}

export default {
  type: 'customDiamond',
  view: DiamondNode,
  model: CustomDiamondModel,
}
