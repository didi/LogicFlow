import { computed } from 'mobx';
import BaseEdgeModel from './BaseEdgeModel';
import { Point } from '../../type';
import { ModelType } from '../../constant/constant';

export { LineEdgeModel };
export default class LineEdgeModel extends BaseEdgeModel {
  modelType = ModelType.LINE_EDGE;
  constructor(data, graphModel) {
    super(data, graphModel);
    this.setStyleFromTheme('line', graphModel);
    this.setAnchors();
    this.formatText(data);
  }
  @computed get textPosition(): Point {
    return {
      x: (this.startPoint.x + this.endPoint.x) / 2,
      y: (this.startPoint.y + this.endPoint.y) / 2,
    };
  }
}
