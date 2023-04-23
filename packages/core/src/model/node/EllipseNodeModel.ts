import { cloneDeep } from 'lodash-es';
import { computed, observable } from '../../util/mobx';
import { Point } from '../../type';
import BaseNodeModel from './BaseNodeModel';
import { ModelType } from '../../constant/constant';

class EllipseNodeModel extends BaseNodeModel {
  modelType = ModelType.ELLIPSE_NODE;
  @observable rx = 30;
  @observable ry = 45;
  getNodeStyle() {
    const style = super.getNodeStyle();
    const {
      graphModel: {
        theme: {
          ellipse,
        },
      },
    } = this;
    return {
      ...style,
      ...cloneDeep(ellipse),
    };
  }
  @computed get width(): number {
    return this.rx * 2;
  }
  @computed get height(): number {
    return this.ry * 2;
  }

  getDefaultAnchor() {
    const {
      x, y, rx, ry,
    } = this;
    return [
      { x, y: y - ry, id: `${this.id}_0` },
      { x: x + rx, y, id: `${this.id}_1` },
      { x, y: y + ry, id: `${this.id}_2` },
      { x: x - rx, y, id: `${this.id}_3` },
    ];
  }
}

export { EllipseNodeModel };
export default EllipseNodeModel;
