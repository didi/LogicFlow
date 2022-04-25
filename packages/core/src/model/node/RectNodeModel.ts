import { cloneDeep } from 'lodash-es';
import { observable, makeObservable } from '../../util/stateUtil';
import BaseNodeModel from './BaseNodeModel';
import { ModelType } from '../../constant/constant';

class RectNodeModel extends BaseNodeModel {
  modelType = ModelType.RECT_NODE;
  radius = 0;

  constructor(data, graphModel) {
    super(data, graphModel);

    makeObservable(this, {
      radius: observable,
    });
  }

  getDefaultAnchor() {
    const { x, y, width, height } = this;
    return [
      { x, y: y - height / 2, id: `${this.id}_0` },
      { x: x + width / 2, y, id: `${this.id}_1` },
      { x, y: y + height / 2, id: `${this.id}_2` },
      { x: x - width / 2, y, id: `${this.id}_3` },
    ];
  }
  getNodeStyle() {
    const style = super.getNodeStyle();
    const { rect } = this.graphModel.theme;
    return {
      ...style,
      ...cloneDeep(rect),
    };
  }
}

export { RectNodeModel };
export default RectNodeModel;
