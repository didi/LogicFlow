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

type PolygonNodeAttributes = {
  points: PointTuple[]
} & NodeAttributes;

export default class PolygonNode extends BaseNode {
  getShapeStyle() {
    const attributes = super.getShapeStyle();
    const { model: { points } } = this.props as IProps;
    return {
      ...attributes,
      points,
    };
  }
  getAttributes(): PolygonNodeAttributes {
    const attributes = super.getAttributes();
    const style = this.getShapeStyle();
    return {
      ...attributes,
      ...style,
    };
  }
  getShape() {
    const attributes = this.getAttributes();
    const {
      width,
      height,
      x,
      y,
    } = attributes;
    const attr = {
      transform: `matrix(1 0 0 1 ${x - width / 2} ${y - height / 2})`,
    };
    return (
      <g {...attr}>
        <Polygon
          {...attributes}
        />
      </g>
    );
  }
}
