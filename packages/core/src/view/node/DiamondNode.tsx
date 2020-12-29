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
  getAttributes() {
    const attributes = super.getAttributes();
    const style = this.getShapeStyle();
    return {
      ...attributes,
      ...style,
    };
  }
  getShape() {
    const {
      model: {
        points,
      },
    } = this.props as IProps;
    const attributes = this.getAttributes();
    const {
      fill,
      fillOpacity,
      strokeWidth,
      stroke,
      strokeOpacity,
    } = attributes;

    const polygonAttr = {
      fill,
      fillOpacity,
      strokeWidth,
      stroke,
      strokeOpacity,
      points,
    };
    return (
      <g>
        <Polygon
          {...polygonAttr}
        />
      </g>
    );
  }
}
