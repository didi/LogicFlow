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
  setAttributes() {
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
  getShape() {
    const attributes = super.getAttributes();
    const {
      model: { isSelected },
    } = this.props;
    return (
      <g>
        <Ellipse {...attributes} />
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
