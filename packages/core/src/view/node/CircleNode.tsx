import { h } from 'preact';
import Circle from '../basic-shape/Circle';
import BaseNode from './BaseNode';
import GraphModel from '../../model/GraphModel';
import EventEmitter from '../../event/eventEmitter';
import { CircleNodeModel } from '../../LogicFlow';

type IProps = {
  model: CircleNodeModel;
  graphModel: GraphModel;
  eventCenter: EventEmitter;
};

export default class CircleNode extends BaseNode {
  getShapeStyle() {
    const style = super.getShapeStyle();
    const { model: { r } } = this.props as IProps;
    return {
      ...style,
      r,
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
    const attributes = this.getAttributes();
    return (
      <Circle
        {...attributes}
      />
    );
  }
}
