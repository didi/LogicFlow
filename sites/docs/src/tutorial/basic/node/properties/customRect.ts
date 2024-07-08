import { RectNode, RectNodeModel } from '@logicflow/core';

class CustomRectModel extends RectNodeModel {
  getNodeStyle() {
    const style = super.getNodeStyle();

    const properties = this.properties;
    if (properties.statu === 'pass') {
      // 业务属性statu为‘pass’时 展示边框颜色为green
      style.stroke = 'green';
    } else if (properties.statu === 'reject') {
      // 业务属性statu为‘reject’时 展示边框颜色为red
      style.stroke = 'red';
    } else {
      style.stroke = 'rgb(24, 125, 255)';
    }
    return style;
  }
}

class CustomRectNode extends RectNode {}

export default {
  type: 'custom-rect',
  view: CustomRectNode,
  model: CustomRectModel,
};
