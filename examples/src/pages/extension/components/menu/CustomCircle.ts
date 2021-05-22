import { CircleNode, CircleNodeModel } from '@logicflow/core';

class CustomCircleModel extends CircleNodeModel {
  setAttributes() {
    this.fill = 'red';
    this.menu = [{
      text: '自定义元素菜单',
      icon: true,
      className: 'custom-menu',
      callback: (res) => {
        this.graphModel.eventCenter.emit('custom:node:event', res);
      }
    }]
  }
}

export default {
  type: 'custom:circle',
  model: CustomCircleModel,
  view: CircleNode,
}
