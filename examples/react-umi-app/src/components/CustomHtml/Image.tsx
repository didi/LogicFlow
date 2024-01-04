import { LogicFlow, RectNode, RectNodeModel, h } from '@logicflow/core';

export type CustomProperties = {
  // 形状属性
  width?: number;
  height?: number;
  radius?: number;

  imageHref: string;

  // 样式属性
  style?: LogicFlow.CommonTheme;
  textStyle?: LogicFlow.TextNodeTheme;
};

class CustomImageNode extends RectNode {
  getShape = (): h.JSX.Element => {
    const { model } = this.props;
    const { x, y, width, height, radius } = model;
    const href = this.getImageHref();
    console.log('model.modelType', model.modelType);
    const style = model.getNodeStyle();

    return h('g', {}, [
      h('image', {
        ...style,
        x: x - width / 2,
        y: y - height / 2,
        rx: radius,
        ry: radius,
        width,
        height,
        href,
        // 根据宽高缩放
        preserveAspectRatio: 'none meet',
      }),
    ]);
  };

  getImageHref = (): string => {
    return '';
  };
}

class CustomImageNodeModel extends RectNodeModel {
  setAttributes() {
    console.log('this.properties', this.properties);
    const { width, height, radius } = this.properties as CustomProperties;
    if (width) {
      this.width = width;
    }
    if (height) {
      this.height = height;
    }
    if (radius) {
      this.radius = radius;
    }
  }
}

export default {
  type: 'customImage',
  view: CustomImageNode,
  model: CustomImageNodeModel,
};
