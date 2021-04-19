import { computed, observable } from 'mobx';
import { NodeData, Point, PointTuple } from '../../type';
import BaseNodeModel from './BaseNodeModel';
import { ModelType } from '../../constant/constant';
import GraphModel from '../GraphModel';

class DiamondNodeModel extends BaseNodeModel {
  modelType = ModelType.DIAMOND_NODE;
  @observable rx: number;
  @observable ry: number;

  constructor(data, graphModel: GraphModel) {
    super(data, graphModel, 'diamond');
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
      [x, y - ry],
      [x + rx, y],
      [x, y + ry],
      [x - rx, y],
    ];
  }

  @computed get pointsPosition(): Point[] {
    const pointsPosition = this.points.map(item => ({
      x: item[0],
      y: item[1],
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
    const {
      anchorsOffset, points,
    } = this;
    if (Array.isArray(anchorsOffset) && anchorsOffset.length > 0) {
      return this.getAnchorsByOffset();
    }
    return points.map(([x1, y1]) => ({ x: x1, y: y1 }));
  }
}

export { DiamondNodeModel };
export default DiamondNodeModel;
