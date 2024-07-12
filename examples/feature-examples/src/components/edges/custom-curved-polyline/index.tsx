import { LogicFlow } from '@logicflow/core'
import { CurvedEdge, CurvedEdgeModel } from '@logicflow/extension'

class CustomCurvedEdge extends CurvedEdge {}

class CustomCurvedEdgeModel extends CurvedEdgeModel {
  initEdgeData(data: LogicFlow.EdgeData) {
    super.initEdgeData(data)
    this.radius = 20
  }
  getEdgeStyle() {
    const style = super.getEdgeStyle()
    style.strokeWidth = 3
    return style
  }
}

export default {
  type: 'customCurvedEdge',
  model: CustomCurvedEdgeModel,
  view: CustomCurvedEdge,
}
