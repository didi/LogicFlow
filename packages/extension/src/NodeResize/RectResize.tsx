import { BaseNodeModel, GraphModel, h, RectNode, RectNodeModel } from '@logicflow/core';
import ControlGroup from './ControlGroup';
import Rect from './Rect';

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
  getShape() {
    const attributes = super.getAttributes();
    const {
      x,
      y,
      width,
      height,
      fill,
      stroke,
      strokeWidth,
      radius,
    } = attributes;
    const arrt = {
      x,
      y,
      width,
      height,
      fill,
      stroke,
      strokeWidth,
      radius,
    };
    console.log(arrt);
    const {
      model: { isSelected },
    } = this.props;
    return (
      <g>
        <Rect {...arrt} />
        {isSelected ? this.getControlGroup(attributes) : ''}
      </g>
    );
  }
}

const RectResize = {
  type: 'rect',
  view: RectResizeView,
  model: RectNodeModel,
};

export { RectResizeView, RectNodeModel };
export default RectResize;
