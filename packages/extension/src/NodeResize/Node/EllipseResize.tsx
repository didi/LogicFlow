import { BaseNodeModel, GraphModel, h, EllipseNode, EllipseNodeModel } from '@logicflow/core';
import ControlGroup from '../Control/ControlGroup';
import Ellipse from '../BasicShape/Ellipse';

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
  setAttributes() {
    this.hideOutline = true;
    // @ts-ignore
    const { nodeSize } = this.properties;
    if (nodeSize) {
      this.rx = nodeSize.rx;
      this.ry = nodeSize.ry;
    }
  }
}
class EllipseResizeView extends EllipseNode {
  getControlGroup(attributes) {
    const {
      model,
      graphModel,
    } = this.props;
    return (
      <ControlGroup
        {...attributes}
        nodeModel={model}
        graphModel={graphModel}
      />
    );
  }
  // getResizeShape绘制图形，功能等同于基础椭圆的getShape功能，可以通过复写此方法，进行节点自定义
  getResizeShape(arrt) {
    return <g><Ellipse {...arrt} /></g>;
  }
  getShape() {
    const attributes = super.getAttributes();
    const {
      model: { isSelected },
    } = this.props;
    return (
      <g>
        {this.getResizeShape(attributes)}
        {isSelected ? this.getControlGroup(attributes) : ''}
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
