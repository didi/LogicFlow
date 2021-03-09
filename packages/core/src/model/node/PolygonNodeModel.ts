import { computed, observable } from 'mobx';
import { assign } from 'lodash-es';
import { Point, PointTuple, NodeData } from '../../type';
import BaseNodeModel from './BaseNodeModel';
import { ModelType } from '../../constant/constant';
import GraphModel from '../GraphModel';
import { pickNodeConfig, pickAttributes } from '../../util/node';

class PolygonNodeModel extends BaseNodeModel {
  modelType = ModelType.POLYGON_NODE;
  @observable points: PointTuple[] = [
    [50, 0],
    [100, 50],
    [50, 100],
    [0, 50],
  ];

  constructor(data, graphModel: GraphModel) {
    super(data);
    this.setStyleFromTheme('polygon', graphModel);
    const attrs = this.setAttributes(data);
    assign(this, pickNodeConfig(data), pickAttributes(attrs));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setAttributes(data: NodeData) {
    return {};
  }

  @computed get pointsPosition(): Point[] {
    const {
      x, y, width, height,
    } = this;
    const pointsPosition = this.points.map(item => ({
      x: item[0] + x - width / 2,
      y: item[1] + y - height / 2,
    }));
    return pointsPosition;
  }
  @computed get width(): number {
    let min = Number.MAX_SAFE_INTEGER;
    let max = Number.MIN_SAFE_INTEGER;
    this.points.forEach(([x]) => {
      if (x < min) {
        min = x;
      }
      if (x > max) {
        max = x;
      }
    });
    return max - min;
  }
  @computed get height(): number {
    let min = Number.MAX_SAFE_INTEGER;
    let max = Number.MIN_SAFE_INTEGER;
    this.points.forEach(([, y]) => {
      if (y < min) {
        min = y;
      }
      if (y > max) {
        max = y;
      }
    });
    return max - min;
  }
  @computed get anchors(): Point[] {
    return this.points.map(([x1, y1]) => ({
      x: this.x + x1 - this.width / 2,
      y: this.y + y1 - this.height / 2,
    }));
  }
}

export { PolygonNodeModel };
export default PolygonNodeModel;
