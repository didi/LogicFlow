import { EllipseNode, EllipseNodeModel, LogicFlow } from '@logicflow/core';
import { cloneDeep } from 'lodash-es';

export type CustomProperties = {
  // 形状属性
  rx?: number;
  ry?: number;

  // 文字位置属性
  refX?: number;
  refY?: number;

  // 样式属性
  style?: LogicFlow.CommonTheme;
  textStyle?: LogicFlow.TextNodeTheme;
};

class CustomEllipseNode extends EllipseNode {}

class CustomEllipseNodeModel extends EllipseNodeModel {
  setAttributes() {
    const { rx, ry } = this.properties as CustomProperties;
    if (rx) {
      this.rx = rx;
    }
    if (ry) {
      this.ry = ry;
    }
  }

  getTextStyle(): LogicFlow.TextNodeTheme {
    // const { x, y, width, height } = this
    const {
      refX = 0,
      refY = 0,
      textStyle,
    } = this.properties as CustomProperties;
    const style = super.getTextStyle();

    // 通过 transform 重新设置 text 的位置
    return {
      ...style,
      ...(cloneDeep(textStyle) || {}),
      transform: `matrix(1 0 0 1 ${refX} ${refY})`,
    };
  }

  getNodeStyle(): LogicFlow.CommonTheme {
    const style = super.getNodeStyle();
    const { style: customNodeStyle } = this.properties as CustomProperties;

    return {
      ...style,
      ...(cloneDeep(customNodeStyle) || {}),
    };
  }
}

export default {
  type: 'customEllipse',
  view: CustomEllipseNode,
  model: CustomEllipseNodeModel,
};
