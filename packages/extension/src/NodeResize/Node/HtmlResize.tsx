import { BaseNodeModel, GraphModel, h, HtmlNode, HtmlNodeModel } from '@logicflow/core';
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
class HtmlResizeModel extends HtmlNodeModel {
  initNodeData(data: any): void {
    super.initNodeData(data);
    this.minWidth = 30;
    this.minHeight = 30;
    this.maxWidth = 2000;
    this.maxHeight = 2000;
  }
  init() {
    super.init();
    const { nodeSize } = this.properties;
    if (nodeSize) {
      this.width = nodeSize.width;
      this.height = nodeSize.height;
    }
  }
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
}
class HtmlResizeView extends HtmlNode {
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
  // getResizeShape绘制图形，功能等同于基础矩形的getShape功能，可以通过复写此方法，进行节点自定义
  getResizeShape() {
    return super.getShape();
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

const HtmlResize = {
  type: 'html',
  view: HtmlResizeView,
  model: HtmlResizeModel,
};

export default HtmlResize;
