import { h } from 'preact';
import BaseNode from './BaseNode';
import GraphModel from '../../model/GraphModel';
import { PolygonNodeModel } from '../../model';
import Polygon from '../basic-shape/Polygon';

type IProps = {
  model: PolygonNodeModel;
  graphModel: GraphModel;
};

export default class PolygonNode extends BaseNode {
  getShape() {
    const { model } = this.props;
    const { x, y, width, height, points } = model;
    const style = model.getNodeStyle();
    const attr = {
      transform: `matrix(1 0 0 1 ${x - width / 2} ${y - height / 2})`,
    };
    return (
      <g {...attr}>
        <Polygon
          {
            ...style
          }
          points={points}
          x={x}
          y={y}
        />
      </g>
    );
  }
}
