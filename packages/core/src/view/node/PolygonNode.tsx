import { h } from 'preact';
import BaseNode, { NodeAttributes } from './BaseNode';
import EventEmitter from '../../event/eventEmitter';
import GraphModel from '../../model/GraphModel';
import { PolygonNodeModel } from '../../model';
import Polygon from '../basic-shape/Polygon';
import { PointTuple } from '../../type';

type IProps = {
  model: PolygonNodeModel;
  graphModel: GraphModel;
  eventCenter: EventEmitter;
};

export default class PolygonNode extends BaseNode {
  getShapeStyle() {
    const style = super.getShapeStyle();
    const { model: { points } } = this.props as IProps;
    return {
      ...style,
      points,
    };
  }
  getShape() {
    const { x, y } = this.getAttributes();
    const style = this.getShapeStyle();
    const { width, height } = style;
    const attr = {
      transform: `matrix(1 0 0 1 ${x - width / 2} ${y - height / 2})`,
    };
    return (
      <g {...attr}>
        <Polygon
          {
            ...style
          }
          x={x}
          y={y}
        />
      </g>
    );
  }
}
