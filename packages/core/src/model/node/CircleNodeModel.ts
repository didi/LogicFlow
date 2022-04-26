import { cloneDeep } from 'lodash-es';
import { computed, observable, makeObservable } from '../../util/stateUtil';
import BaseNodeModel from './BaseNodeModel';
import { ModelType } from '../../constant/constant';

class CircleNodeModel extends BaseNodeModel {
  modelType = ModelType.CIRCLE_NODE;
  r = 50;

  constructor(data, graphData) {
    super(data, graphData);

    makeObservable(this, {
      r: observable,
      width: computed,
      height: computed,
    });
  }

  get width(): number {
    return this.r * 2;
  }
  get height(): number {
    return this.r * 2;
  }
  getNodeStyle() {
    const style = super.getNodeStyle();
    const {
      graphModel: {
        theme: {
          circle,
        },
      },
    } = this;
    return {
      ...style,
      ...cloneDeep(circle),
    };
  }
  getDefaultAnchor() {
    const { x, y, r } = this;
    return [
      { x, y: y - r, id: `${this.id}_0` },
      { x: x + r, y, id: `${this.id}_1` },
      { x, y: y + r, id: `${this.id}_2` },
      { x: x - r, y, id: `${this.id}_3` },
    ];
  }
}

export { CircleNodeModel };
export default CircleNodeModel;
