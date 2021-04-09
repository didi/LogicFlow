import { h } from 'preact';
import BaseNode from './BaseNode';
import Ellipse from '../basic-shape/Ellipse';
import EllipseNodeModel from '../../model/node/EllipseNodeModel';
import GraphModel from '../../model/GraphModel';
import EventEmitter from '../../event/eventEmitter';

type IProps = {
  model: EllipseNodeModel;
  graphModel: GraphModel;
  eventCenter: EventEmitter;
};
export default class EllipseNode extends BaseNode {
  getAttributes() {
    const attributes = super.getAttributes();
    const { model: { rx, ry } } = this.props as IProps;
    return { ...attributes, rx, ry };
  }
  getShape() {
    const attributes = this.getAttributes();
    return (
      <Ellipse
        {...attributes}
      />
    );
  }
}
