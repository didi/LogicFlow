import { GroupNode, GroupNodeModel } from '@logicflow/extension'
// import { size, gap } from '../confg'

class FirstGroupView extends GroupNode {}

class FirstGroupModel extends GroupNodeModel {
  // 除了初始化调用外，还会在 properties 发生变化了调用
  setAttributes() {
    // const { left, right, top, bottom } = this.properties
    // let width = right - left
    // if (width < size.width - gap.margin * 2) {
    //   width = size.width - gap.margin * 2
    // }
    // this.width = width
    // this.height = bottom - top
    // this.x = this.width * 0.5 + gap.margin
    // this.y = this.height * 0.5 + gap.margin
  }

  getNodeStyle() {
    const style = super.getNodeStyle()
    style.stroke = '#f00'
    style.strokeDasharray = '3 3'
    style.strokeWidth = 1
    return style
  }
}

export default {
  type: 'firstGroup',
  view: FirstGroupView,
  model: FirstGroupModel
}
