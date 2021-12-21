import { computed, observable } from 'mobx';
import { Point, PointTuple } from '../../type';
import BaseNodeModel from './BaseNodeModel';
import { ModelType } from '../../constant/constant';

class PolygonNodeModel extends BaseNodeModel {
  modelType = ModelType.POLYGON_NODE;
  @observable points: PointTuple[] = [
    [50, 0],
    [100, 50],
    [50, 100],
    [0, 50],
  ];
  getNodeStyle() {
    const style = super.getNodeStyle();
    const {
      graphModel: {
        theme: {
          polygon,
        },
      },
    } = this;
    return {
      ...style,
      ...polygon,
    };
  }
  /**
   * 由于大多数情况下，我们初始化拿到的多边形坐标都是基于原点的（例如绘图工具到处的svg）。
   * 在logicflow中对多边形进行移动，我们不需要去更新points，
   * 而是去更新多边形中心点即可。
   */
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
    const {
      anchorsOffset, x, y, width, height, points,
    } = this;
    if (anchorsOffset && anchorsOffset.length > 0) {
      return this.getAnchorsByOffset();
    }
    return points.map(([x1, y1], idx) => ({
      x: x + x1 - width / 2,
      y: y + y1 - height / 2,
      id: `${this.id}_${idx}`,
    }));
  }
}

export { PolygonNodeModel };
export default PolygonNodeModel;
