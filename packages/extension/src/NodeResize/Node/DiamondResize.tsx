import { BaseNodeModel, GraphModel, h, DiamondNode, DiamondNodeModel } from '@logicflow/core';
import ControlGroup from '../Control/ControlGroup';
import polygon from '../BasicShape/polygon';

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
class DiamondResizeModel extends DiamondNodeModel {
  setAttributes() {
    // @ts-ignore
    const { nodeSize } = this.properties;
    if (nodeSize) {
      this.rx = nodeSize.rx;
      this.ry = nodeSize.ry;
    }
  }
}
class DiamondResizeView extends DiamondNode {
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
    const attributes = super.getAttributes() as any;
    const {
      model: { isSelected },
    } = this.props;
    return (
      <g>
        <polygon {...attributes} />
        {isSelected ? this.getControlGroup(attributes) : ''}
      </g>
    );
  }
}

const EllipseResize = {
  type: 'diamond',
  view: DiamondResizeView,
  model: DiamondResizeModel,
};

export default EllipseResize;
