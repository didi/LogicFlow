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
  getRect(arrt) {
    return <g><Rect {...arrt} /></g>;
  }
  getShape() {
    const attributes = super.getAttributes();
    const {
      model: { isSelected },
    } = this.props;
    return (
      <g>
        {this.getRect(attributes)}
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
