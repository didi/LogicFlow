import LogicFlow, { PolygonNode, PolygonNodeModel } from '@logicflow/core'
import NodeConfig = LogicFlow.NodeConfig

class CustomPolygonModel extends PolygonNodeModel {
  // constructor(data: any, graphModel: any) {
  //   super(data, graphModel)
  // }

  initNodeData(data: NodeConfig) {
    super.initNodeData(data)
    this.points = [
      [0, 100],
      [50, 25],
      [50, 75],
      [100, 0],
    ] // 闪电
  }

  // or
  // setAttributes() {
  //   this.points = [[0,100], [50,25], [50,75], [100,0]] // 闪电
  // }
}

export default {
  type: 'customPolygon',
  view: PolygonNode,
  model: CustomPolygonModel,
}
