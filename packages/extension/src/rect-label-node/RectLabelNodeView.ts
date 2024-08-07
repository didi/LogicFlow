import { RectNode, h } from '@logicflow/core'

export class RectLabelNodeView extends RectNode {
  getLabelShape(): h.JSX.Element {
    const { x, y, width, height, properties } = this.props.model

    return h(
      'text',
      {
        x: x - width / 2 + 5,
        y: y - height / 2 + 16,
        fontSize: 12,
        fill: 'blue',
      },
      properties.moreText as string,
    )
  }

  getShape(): h.JSX.Element {
    const { x, y, width, height } = this.props.model
    const style = this.props.model.getNodeStyle()
    // todo: 将basic-shape对外暴露，在这里可以直接用。现在纯手写有点麻烦。
    return h('g', {}, [
      h('rect', {
        ...style,
        fill: '#FFFFFF',
        x: x - width / 2,
        y: y - height / 2,
      }),
      this.getLabelShape(),
    ])
  }
}
