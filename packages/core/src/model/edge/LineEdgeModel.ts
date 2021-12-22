import { cloneDeep } from 'lodash-es';
import BaseEdgeModel from './BaseEdgeModel';
import { Point } from '../../type';
import { ModelType } from '../../constant/constant';

export { LineEdgeModel };
export default class LineEdgeModel extends BaseEdgeModel {
  modelType = ModelType.LINE_EDGE;
  constructor(data, graphModel) {
    super(data, graphModel, 'line');
  }
  getEdgeStyle() {
    const { line } = this.graphModel.theme;
    const style = super.getEdgeStyle();
    return {
      ...style,
      ...cloneDeep(line),
    };
  }
  getTextPosition(): Point {
    return {
      x: (this.startPoint.x + this.endPoint.x) / 2,
      y: (this.startPoint.y + this.endPoint.y) / 2,
    };
  }
}
