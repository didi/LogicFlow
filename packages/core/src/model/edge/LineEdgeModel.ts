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
    const {
      graphModel,
    } = this;
    const style = super.getEdgeStyle();
    return {
      ...style,
      ...graphModel.theme.line,
    };
  }
  getTextPosition(): Point {
    return {
      x: (this.startPoint.x + this.endPoint.x) / 2,
      y: (this.startPoint.y + this.endPoint.y) / 2,
    };
  }
}
