import { RectNode, RectNodeModel } from '@logicflow/core'

class UserTaskNode extends RectNode {}
class UsetTaskModel extends RectNodeModel {
  constructor(data: any, graphModel: any) {
    if (data.text && typeof data.text === 'string') {
      data.text = {
        value: data.text,
        x: data.x,
        y: data.y,
      }
    }
    super(data, graphModel)
    this.width = 100
    this.height = 80
    this.strokeWidth = 2
    this.stroke = 'rgb(24, 125, 255)'
    this.radius = 10
    this.fillOpacity = 0.95
  }
}
export default {
  view: UserTaskNode,
  model: UsetTaskModel,
  type: 'user-task',
}
