import { computed } from 'mobx';
import { assign } from 'lodash-es';
import BaseEdgeModel from './BaseEdgeModel';
import { Point } from '../../type';
import { ModelType } from '../../constant/constant';
import { pickEdgeConfig } from '../../util/edge';

export { LineEdgeModel };
export default class LineEdgeModel extends BaseEdgeModel {
  modelType = ModelType.LINE_EDGE;
  constructor(data, graphModel) {
    super(data, graphModel);
    this.setStyleFromTheme('line', graphModel);
    const attrs = this.setAttributes(data);
    assign(this, pickEdgeConfig(data), attrs);
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
