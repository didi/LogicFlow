import { h } from 'preact';
import Rect from '../basic-shape/Rect';
import BaseNode from './BaseNode';
import { RectNodeModel } from '../../model';
import GraphModel from '../../model/GraphModel';
import EventEmitter from '../../event/eventEmitter';

type IProps = {
  model: RectNodeModel;
  graphModel: GraphModel;
  eventCenter: EventEmitter;
};

export default class RectNode extends BaseNode {
  getShapeStyle() {
    const style = super.getShapeStyle();
    const {
      graphModel,
    } = this.props;
    return {
      ...style,
      ...graphModel.theme.rect,
    };
  }
  getShape() {
    const attributes = this.getAttributes();
    const style = this.getShapeStyle();
    return (
      <Rect
        {...style}
        x={attributes.x}
        y={attributes.y}
      />
    );
  }
}
