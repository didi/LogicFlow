import { BaseNodeModel, GraphModel, h, DiamondNode, DiamondNodeModel } from '@logicflow/core';
import ControlGroup from '../Control/ControlGroup';
import Polygon from '../BasicShape/Polygon';

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
  // getShapeResize绘制图形，功能等同于基础菱形的getShape功能，可以通过复写此方法，进行节点自定义
  getShapeResize(arrt) {
    return <g><Polygon {...arrt} /></g>;
  }
  getShape() {
    const attributes = super.getAttributes() as any;
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

const EllipseResize = {
  type: 'diamond',
  view: DiamondResizeView,
  model: DiamondResizeModel,
};

export default EllipseResize;
