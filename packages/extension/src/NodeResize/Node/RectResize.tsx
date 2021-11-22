import { BaseNodeModel, GraphModel, h, RectNode, RectNodeModel } from '@logicflow/core';
import ControlGroup from '../Control/ControlGroup';
// import Rect from '../BasicShape/Rect';

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
class RectResizeModel extends RectNodeModel {
  minWidth = 30;
  minHeight = 30;
  maxWidth = 2000;
  maxHeight = 2000;
  setAttributes() {
    this.hideOutline = true;
    // @ts-ignore
    const { nodeSize } = this.properties;
    if (nodeSize) {
      this.width = nodeSize.width;
      this.height = nodeSize.height;
    }
  }
}
class RectResizeView extends RectNode {
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
  // getResizeShape绘制图形，功能等同于基础矩形的getShape功能，可以通过复写此方法，进行节点自定义
  getResizeShape() {
    return super.getShape();
  }
  getShape() {
    const attributes = super.getAttributes();
    const {
      model: { isSelected },
    } = this.props;
    return (
      <g>
        {this.getResizeShape()}
        {isSelected ? this.getControlGroup(attributes) : ''}
      </g>
    );
  }
}

const RectResize = {
  type: 'rect',
  view: RectResizeView,
  model: RectResizeModel,
};

export default RectResize;
