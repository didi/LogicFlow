import { RectNode, RectNodeModel } from '@logicflow/core';

class CustomRectNode extends RectNode {}

class CustomRectModel extends RectNodeModel {
  setAttributes() {
    this.width = 200;
    this.height = 80;
    this.radius = 50;
  }
  getTextStyle(): LogicFlow.TextNodeTheme {
    const { refX = 0, refY = 0 } = this.properties as CustomProperties;
    const style = super.getTextStyle();

    // 通过 transform 重新设置 text 的位置
    return {
      ...style,
      transform: `matrix(1 0 0 1 ${refX} ${refY + 60})`,
    };
  }
  getNodeStyle() {
    const style = super.getNodeStyle();
    style.stroke = 'blue';
    return style;
  }
}

export default {
  type: 'custom-rect',
  view: CustomRectNode,
  model: CustomRectModel,
};
