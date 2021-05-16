import { computed, observable } from 'mobx';
import { Point } from '../../type';
import BaseNodeModel from './BaseNodeModel';
import { ModelType } from '../../constant/constant';
import GraphModel from '../GraphModel';
import { defaultTheme } from '../../constant/DefaultTheme';

class CircleNodeModel extends BaseNodeModel {
  modelType = ModelType.CIRCLE_NODE;
  @observable r = defaultTheme.circle.r;

  constructor(data, graphModel: GraphModel) {
    super(data, graphModel, 'circle');
  }
  @computed get width(): number {
    return this.r * 2;
  }
  @computed get height(): number {
    return this.r * 2;
  }
  @computed get anchors(): Point[] {
    const {
      anchorsOffset, x, y, r,
    } = this;
    if (anchorsOffset && anchorsOffset.length > 0) {
      return this.getAnchorsByOffset();
    }
    return [
      { x, y: y - r },
      { x: x + r, y },
      { x, y: y + r },
      { x: x - r, y },
    ];
  }
}

export { CircleNodeModel };
export default CircleNodeModel;
