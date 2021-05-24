import { CircleNode, CircleNodeModel, EventArgs } from '@logicflow/core';

class CustomCircleModel extends CircleNodeModel {
  setAttributes() {
    this.fill = 'red';
    this.menu = [{
      text: '自定义元素菜单',
      icon: true,
      className: 'custom-menu',
      callback: (res: EventArgs) => {
        this.graphModel.eventCenter.emit('custom:node:event', res);
      }
    }]
  }
}

const CustomCircle = {
  type: 'custom:circle',
  model: CustomCircleModel,
  view: CircleNode,
}

export default CustomCircle;
