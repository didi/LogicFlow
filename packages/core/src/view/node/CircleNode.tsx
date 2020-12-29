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
  r: number;
  constructor(props: IProps) {
    super(props);
    const {
      model: {
        r,
      },
    } = props as IProps;
    this.r = r;
  }
  getShapeStyle() {
    const style = super.getShapeStyle();
    return {
      ...style,
      r: this.r,
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
