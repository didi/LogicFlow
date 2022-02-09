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
  minWidth = 30;
  minHeight = 30;
  maxWidth = 2000;
  maxHeight = 2000;
  getOutlineStyle() {
    const style = super.getOutlineStyle();
    style.stroke = 'none';
    if (style.hover) {
      style.hover.stroke = 'none';
    }
    return style;
  }
  getResizeOutlineStyle() {
    return {
      stroke: '#000000',
      strokeWidth: 1,
      strokeDasharray: '3,3',
    };
  }
  getControlPointStyle() {
    return {
      width: 7,
      height: 7,
      fill: '#FFFFFF',
      stroke: '#000000',
    };
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
class DiamondResizeView extends DiamondNode {
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
  // getResizeShape绘制图形，功能等同于基础菱形的getShape功能，可以通过复写此方法，进行节点自定义
  getResizeShape() {
    const { model } = this.props;
    const { points } = model;
    const style = model.getNodeStyle();
    return (
      <g>
        <Polygon
          {...style}
          points={points}
        />
      </g>
    );
  }
  getShape() {
    const {
      model: { isSelected },
    } = this.props;
    return (
      <g>
        {this.getResizeShape()}
        {isSelected ? this.getControlGroup() : ''}
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
