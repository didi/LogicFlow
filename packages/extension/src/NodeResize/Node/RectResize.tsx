import { BaseNodeModel, GraphModel, h, RectNode, RectNodeModel } from '@logicflow/core';
import ControlGroup from '../Control/ControlGroup';
import Rect from '../BasicShape/Rect';

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
  setAttributes() {
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
  // getShapeResize绘制图形，功能等同于基础矩形的getShape功能，可以通过复写此方法，进行节点自定义
  getShapeResize(arrt) {
    return <g><Rect {...arrt} /></g>;
  }
  getShape() {
    const attributes = super.getAttributes();
    const {
      model: { isSelected },
    } = this.props;
    return (
      <g>
        {this.getShapeResize(attributes)}
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
