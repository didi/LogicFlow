import { h } from 'preact';
import Circle from '../basic-shape/Circle';
import BaseNode from './BaseNode';
import GraphModel from '../../model/GraphModel';
import { CircleNodeModel } from '../../model';

type IProps = {
  model: CircleNodeModel;
  graphModel: GraphModel;
};

export default class CircleNode extends BaseNode {
  getShape() {
    const { model } = this.props;
    const { x, y, r } = model;
    const style = model.getNodeStyle();
    return (
      <Circle
        {...style}
        x={x}
        y={y}
        r={r}
      />
    );
  }
}
