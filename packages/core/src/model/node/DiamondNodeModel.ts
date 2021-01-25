import { computed, observable } from 'mobx';
import { assign } from 'lodash-es';
import { NodeData, Point, PointTuple } from '../../type';
import BaseNodeModel from './BaseNodeModel';
import { ModelType } from '../../constant/constant';
import GraphModel from '../GraphModel';

class DiamondNodeModel extends BaseNodeModel {
  modelType = ModelType.DIAMOND;
  @observable rx: number;
  @observable ry: number;

  constructor(data, graphModel: GraphModel) {
    super(data);
    this.setStyleFromTheme('diamond', graphModel);
    assign(this, data);
  }

  getData(): NodeData {
    const { rx, ry } = this;
    const data = super.getData();
    return { ...data, rx, ry };
  }

  @computed get points(): PointTuple[] {
    const {
      x, y, rx, ry,
    } = this;
    return [
      [x + rx, y],
      [x, y + ry],
      [x - rx, y],
      [x, y - ry],
    ];
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
    return this.points.map(([x, y]) => ({ x, y }));
  }
}

export { DiamondNodeModel };
export default DiamondNodeModel;
