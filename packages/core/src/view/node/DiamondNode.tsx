import { h } from 'preact';
import BaseNode from './BaseNode';
import EventEmitter from '../../event/eventEmitter';
import GraphModel from '../../model/GraphModel';
import DiamondNodeModel from '../../model/node/DiamondNodeModel';
import Polygon from '../basic-shape/Polygon';

type IProps = {
  model: DiamondNodeModel;
  graphModel: GraphModel;
  eventCenter: EventEmitter;
};

export default class DiamondNode extends BaseNode {
  getShapeStyle() {
    const style = super.getShapeStyle();
    const {
      graphModel,
    } = this.props;
    return {
      ...style,
      ...graphModel.theme.diamond,
    };
  }
  getAttributes() {
    const attributes = super.getAttributes();
    const {
      model: {
        points,
      },
    } = this.props;
    attributes.points = points;
    return attributes;
  }
  getShape() {
    const { x, y, points } = this.getAttributes();
    const style = this.getShapeStyle();
    return (
      <g>
        <Polygon
          {...style}
          points={points}
          x={x}
          y={y}
        />
      </g>
    );
  }
}
