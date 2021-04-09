import { h } from 'preact';
import Rect from '../basic-shape/Rect';
import BaseNode from './BaseNode';
import { RectNodeModel } from '../../LogicFlow';
import GraphModel from '../../model/GraphModel';
import EventEmitter from '../../event/eventEmitter';

type IProps = {
  model: RectNodeModel;
  graphModel: GraphModel;
  eventCenter: EventEmitter;
};

export default class RectNode extends BaseNode {
  getShapeStyle() {
    const attributes = super.getShapeStyle();
    const { model: { radius } } = this.props as IProps;
    return {
      ...attributes,
      radius,
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
      <Rect
        {...attributes}
      />
    );
  }
}
