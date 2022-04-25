import { cloneDeep } from 'lodash-es';
import { computed, observable, makeObservable } from '../../util/stateUtil';
import BaseNodeModel from './BaseNodeModel';
import { ModelType } from '../../constant/constant';

class EllipseNodeModel extends BaseNodeModel {
  modelType = ModelType.ELLIPSE_NODE;
  rx = 30;
  ry = 45;

  constructor(data, graphData) {
    super(data, graphData);

    makeObservable(this, {
      rx: observable,
      ry: observable,
      width: computed,
      height: computed,
    });
  }

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
  get width(): number {
    return this.rx * 2;
  }
  get height(): number {
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
