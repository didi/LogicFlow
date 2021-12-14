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
  getShapeStyle() {
    const style = super.getShapeStyle();
    const { model: { rx, ry } } = this.props as IProps;
    const {
      graphModel,
    } = this.props;
    return { ...style, ...graphModel.theme.ellipse, rx, ry };
  }
  getShape() {
    const { x, y } = this.getAttributes();
    const style = this.getShapeStyle();
    return (
      <Ellipse
        {...style}
        x={x}
        y={y}
      />
    );
  }
}
