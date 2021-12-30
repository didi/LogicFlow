import { h } from 'preact';
import BaseNode from './BaseNode';
import Polygon from '../basic-shape/Polygon';

export default class DiamondNode extends BaseNode {
  getShape() {
    const { model } = this.props;
    const style = model.getNodeStyle();
    return (
      <g>
        <Polygon
          {...style}
          points={model.points}
          x={model.x}
          y={model.y}
        />
      </g>
    );
  }
}
