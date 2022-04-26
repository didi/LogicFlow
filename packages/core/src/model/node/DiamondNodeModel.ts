import { cloneDeep } from 'lodash-es';
import { computed, observable, makeObservable } from '../../util/stateUtil';
import { Point, PointTuple } from '../../type';
import BaseNodeModel from './BaseNodeModel';
import { ModelType } from '../../constant/constant';

class DiamondNodeModel extends BaseNodeModel {
  modelType = ModelType.DIAMOND_NODE;
  rx = 30;
  ry = 50;

  constructor(data, graphData) {
    super(data, graphData);

    makeObservable(this, {
      rx: observable,
      ry: observable,
      points: computed,
      pointsPosition: computed,
      width: computed,
      height: computed,
    });
  }

  getNodeStyle() {
    const style = super.getNodeStyle();
    const {
      graphModel: {
        theme: {
          diamond,
        },
      },
    } = this;
    return {
      ...style,
      ...cloneDeep(diamond),
    };
  }
  get points(): PointTuple[] {
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

  get pointsPosition(): Point[] {
    const pointsPosition = this.points.map(item => ({
      x: item[0],
      y: item[1],
    }));
    return pointsPosition;
  }

  get width(): number {
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

  get height(): number {
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

  getDefaultAnchor() {
    return this.points.map(([x1, y1], idx) => ({ x: x1, y: y1, id: `${this.id}_${idx}` }));
  }
}

export { DiamondNodeModel };
export default DiamondNodeModel;
