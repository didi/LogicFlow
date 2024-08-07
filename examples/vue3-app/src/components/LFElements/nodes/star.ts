import { PolygonNode, PolygonNodeModel } from '@logicflow/core'

class StarModel extends PolygonNodeModel {
  setAttributes() {
    this.points = [
      [45, 0],
      [20, 90],
      [90, 30],
      [0, 30],
      [80, 90]
    ]
    this.fill = '#456789'
    this.stroke = '#456789'
  }
}

export default {
  type: 'star',
  view: PolygonNode,
  model: StarModel
}
