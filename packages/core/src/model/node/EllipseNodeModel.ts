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
    if (anchorsOffset && anchorsOffset.length > 0) {
      return this.getAnchorsByOffset();
    }
    return [
      { x, y: y - ry, id: `${this.id}_0`, isSourceAnchor: true, isTargetAnchor: true },
      { x: x + rx, y, id: `${this.id}_1`, isSourceAnchor: true, isTargetAnchor: true },
      { x, y: y + ry, id: `${this.id}_2`, isSourceAnchor: true, isTargetAnchor: true },
      { x: x - rx, y, id: `${this.id}_3`, isSourceAnchor: true, isTargetAnchor: true },
    ];
  }
}

export { EllipseNodeModel };
export default EllipseNodeModel;
