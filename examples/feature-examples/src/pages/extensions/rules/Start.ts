import { CircleNode, CircleNodeModel } from '@logicflow/core'

class StartNode extends CircleNode {}
class StartModel extends CircleNodeModel {
  constructor(data: any, graphModel: any) {
    if (data.text && typeof data.text === 'string') {
      data.text = {
        value: data.text,
        x: data.x,
        y: data.y + 35,
      }
    }
    super(data, graphModel)
    this.r = 18
    this.strokeWidth = 2
    this.stroke = 'rgb(24, 125, 255)'
  }
  getConnectedTargetRules() {
    const rules = super.getConnectedTargetRules()
    const notAsTarget = {
      message: '起始节点不能作为边的终点',
      validate: () => false,
    }
    rules.push(notAsTarget)
    return rules
  }
}
export default {
  type: 'start',
  view: StartNode,
  model: StartModel,
}
