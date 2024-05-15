import { RectNode, RectNodeModel } from '@logicflow/core'

export type CustomProperties = {
  size: number
}

export class UserNode extends RectNode {
  getAnchorStyle() {
    return {
      stroke: '#18905F',
      strokeWidth: 2,
    }
  }

  getTextStyle() {
    return {
      fontSize: 12,
      fill: '#FFFFFF',
      autoWrap: true,
      lineHeight: 1.5,
      background: {
        fill: '#FF00FF',
        wrapPadding: '10,10',
      },
    }
  }
}

export class UserModel extends RectNodeModel {
  setAttributes() {
    const { size } = this.properties as CustomProperties
    this.width = size * 40
    this.height = size * 40
    this.textWidth = 150
    this.stroke = '#18905F'
    this.fill = 'red'
    this.radius = 10
    this.text.value = 'id:' + this.id
  }
}

export default {
  type: 'user',
  view: UserNode,
  model: UserModel,
}
