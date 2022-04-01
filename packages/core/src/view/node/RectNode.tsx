import { h } from 'preact';
import Rect from '../basic-shape/Rect';
import BaseNode from './BaseNode';

export default class RectNode extends BaseNode {
  getShape() {
    const { model } = this.props;
    const style = model.getNodeStyle();
    return (
      <Rect
        {...style}
        x={model.x}
        y={model.y}
        width={model.width}
        height={model.height}
        radius={model.radius}
      />
    );
  }
}
