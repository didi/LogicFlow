import { computed, observable } from 'mobx';
import { Point } from '../../type';
import BaseNodeModel from './BaseNodeModel';
import { ModelType } from '../../constant/constant';
import { defaultTheme } from '../../constant/DefaultTheme';
import GraphModel from '../GraphModel';

class EllipseNodeModel extends BaseNodeModel {
  modelType = ModelType.ELLIPSE_NODE;
  @observable rx = defaultTheme.ellipse.rx;
  @observable ry = defaultTheme.ellipse.ry;

  constructor(data, graphModel: GraphModel) {
    super(data, graphModel, 'ellipse');
  }

  @computed get width(): number {
    return this.rx * 2;
  }
  @computed get height(): number {
    return this.ry * 2;
  }
  @computed get anchors(): Point[] {
    const {
      anchorsOffset, x, y, rx, ry,
    } = this;
    if (Array.isArray(anchorsOffset) && anchorsOffset.length > 0) {
      return this.getAnchorsByOffset();
    }
    return [
      { x, y: y - ry },
      { x: x + rx, y },
      { x, y: y + ry },
      { x: x - rx, y },
    ];
  }
}

export { EllipseNodeModel };
export default EllipseNodeModel;
