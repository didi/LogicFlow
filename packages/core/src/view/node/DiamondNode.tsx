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
    const {
      model: {
        points,
      },
    } = this.props as IProps;
    const attributes = super.getShapeStyle();
    return {
      ...attributes,
      points,
    };
  }
  getShape() {
    const { x, y } = this.getAttributes();
    const style = this.getShapeStyle();
    return (
      <g>
        <Polygon
          {...style}
          x={x}
          y={y}
        />
      </g>
    );
  }
}
