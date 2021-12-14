import { h } from 'preact';
import Circle from '../basic-shape/Circle';
import BaseNode from './BaseNode';
import GraphModel from '../../model/GraphModel';
import EventEmitter from '../../event/eventEmitter';
import { CircleNodeModel } from '../../model';

type IProps = {
  model: CircleNodeModel;
  graphModel: GraphModel;
  eventCenter: EventEmitter;
};

export default class CircleNode extends BaseNode {
  getShapeStyle() {
    const style = super.getShapeStyle();
    const {
      graphModel,
    } = this.props;
    return {
      ...style,
      ...graphModel.theme.circle,
    };
  }
  getShape() {
    const { x, y, width } = this.getAttributes();
    const style = this.getShapeStyle();
    return (
      <Circle
        {...style}
        x={x}
        y={y}
        r={width / 2}
      />
    );
  }
}
