import LogicFlow, { RectNode, RectNodeModel } from '@logicflow/core';

export type CustomProperties = {
  // 形状属性
  width?: number;
  height?: number;
  radius?: number;

  // 文字位置属性
  refX?: number;
  refY?: number;

  // 样式属性
  style?: LogicFlow.CommonTheme;
  textStyle?: LogicFlow.TextNodeTheme;
};

class CustomRectNode extends RectNode {}

class CustomRectModel extends RectNodeModel {
  // 设置矩形的形状属性：大小和圆角
  setAttributes() {
    this.width = 200;
    this.height = 80;
    this.radius = 50;
  }

  // 重写文本样式属性
  getTextStyle(): LogicFlow.TextNodeTheme {
    const { refX = 0, refY = 0 } = this.properties as CustomProperties;
    const style = super.getTextStyle();

    // 通过 transform 重新设置 text 的位置：向下移动70px
    return {
      ...style,
      transform: `matrix(1 0 0 1 ${refX} ${refY + 60})`,
    };
  }

  // 设置矩形的样式属性：边框颜色
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
