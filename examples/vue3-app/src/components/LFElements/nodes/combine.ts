import { h, BaseNode, BaseNodeModel } from '@logicflow/core'

export class CombineNode extends BaseNode {
  getShape() {
    const { x, y } = this.props.model
    const { fill } = this.props.model.getNodeStyle()
    return h(
      'g',
      {
        transform: `matrix(1 0 0 1 ${x - 25} ${y - 25})`
      },
      h('path', {
        d: 'm  0,6.65 l  0,36.885245901639344 c  1.639344262295082,8.196721311475411 47.540983606557376,8.196721311475411  49.18032786885246,0 l  0,-36.885245901639344 c -1.639344262295082,-8.196721311475411 -47.540983606557376,-8.196721311475411 -49.18032786885246,0c  1.639344262295082,8.196721311475411 47.540983606557376,8.196721311475411  49.18032786885246,0 m  -49.18032786885246,5.737704918032787c  1.639344262295082,8.196721311475411 47.540983606557376,8.196721311475411 49.18032786885246,0m  -49.18032786885246,5.737704918032787c  1.639344262295082,8.196721311475411 47.540983606557376,8.196721311475411  49.18032786885246,0',
        fill: fill,
        strokeWidth: 2,
        stroke: 'red',
        fillOpacity: 0.95
      })
    )
  }
}

export class CombineModel extends BaseNodeModel {
  setAttributes() {
    this.width = 50
    this.height = 60
    this.fill = 'orange'

    this.anchorsOffset = [
      [0, -this.height / 2],
      [this.width / 2, 0],
      [0, this.height / 2],
      [-this.width / 2, 0]
    ]
  }
}

export default {
  type: 'combine',
  view: CombineNode,
  model: CombineModel
}
