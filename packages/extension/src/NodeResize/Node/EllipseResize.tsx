import { BaseNodeModel, GraphModel, h, EllipseNode, EllipseNodeModel } from '@logicflow/core';
import ControlGroup from '../Control/ControlGroup';

interface IProps {
  x: number,
  y: number,
  width: number,
  height: number,
  nodeModel: BaseNodeModel,
  graphModel: GraphModel,
  style?: CSSStyleDeclaration,
  hoverStyle?: CSSStyleDeclaration,
  edgeStyle?: CSSStyleDeclaration,
}
class EllipseResizeModel extends EllipseNodeModel {
  minWidth = 30;
  minHeight = 30;
  maxWidth = 2000;
  maxHeight = 2000;
  constructor(data, graphModel) {
    super(data, graphModel);
    this.rx = 50;
    this.ry = 50;
  }
  getOutlineStyle() {
    const style = super.getOutlineStyle();
    style.stroke = 'none';
    if (style.hover) {
      style.hover.stroke = 'none';
    }
    return style;
  }
  setAttributes() {
    // @ts-ignore
    const { nodeSize } = this.properties;
    if (nodeSize) {
      this.rx = nodeSize.rx;
      this.ry = nodeSize.ry;
    }
  }
}
class EllipseResizeView extends EllipseNode {
  getControlGroup() {
    const {
      model,
      graphModel,
    } = this.props;
    return (
      <ControlGroup
        model={model}
        graphModel={graphModel}
      />
    );
  }
  // getResizeShape绘制图形，功能等同于基础椭圆的getShape功能，可以通过复写此方法，进行节点自定义
  getResizeShape() {
    return super.getShape();
  }
  getShape() {
    const {
      model,
    } = this.props;
    return (
      <g>
        {this.getResizeShape()}
        {model.isSelected ? this.getControlGroup() : ''}
      </g>
    );
  }
}

const EllipseResize = {
  type: 'ellipse',
  view: EllipseResizeView,
  model: EllipseResizeModel,
};

export default EllipseResize;
