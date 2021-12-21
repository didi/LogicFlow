import { h } from 'preact';
import BaseNode from './BaseNode';
import Ellipse from '../basic-shape/Ellipse';
import EllipseNodeModel from '../../model/node/EllipseNodeModel';
import GraphModel from '../../model/GraphModel';

type IProps = {
  model: EllipseNodeModel;
  graphModel: GraphModel;
};
export default class EllipseNode extends BaseNode {
  getShape() {
    const { model } = this.props;
    const style = model.getNodeStyle();
    return (
      <Ellipse
        {...style}
        x={model.x}
        y={model.y}
        rx={model.rx}
        ry={model.ry}
      />
    );
  }
}
