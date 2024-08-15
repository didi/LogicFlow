import LogicFlow, { CircleNode, CircleNodeModel } from '@logicflow/core'
import NodeConfig = LogicFlow.NodeConfig

class CustomCircleModel extends CircleNodeModel {
  // constructor(data: any, graphModel: any) {
  //   console.log('CustomCircleModel', 'constructor');
  //   super(data, graphModel)
  // }

  initNodeData(data: NodeConfig) {
    // console.log('CustomCircleModel', 'initNodeData', data);
    super.initNodeData(data)
    this.r = 60
  }

  // or
  // setAttributes() {
  //   console.log('CustomCircleModel', 'setAttributes');
  //   this.r = 30;
  //   console.log(this.r, 'r', this);
  // }
}

export default {
  type: 'customCircle',
  view: CircleNode,
  model: CustomCircleModel,
}
