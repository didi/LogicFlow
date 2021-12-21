import { computed, observable } from 'mobx';
import { Point } from '../../type';
import BaseNodeModel from './BaseNodeModel';
import { ModelType } from '../../constant/constant';

class RectNodeModel extends BaseNodeModel {
  modelType = ModelType.RECT_NODE;
  @observable radius = 0;
  @computed get anchors(): Point[] {
    const {
      anchorsOffset, x, y, width, height,
    } = this;
    if (anchorsOffset && anchorsOffset.length > 0) {
      return this.getAnchorsByOffset();
    }
    return [
      { x, y: y - height / 2, id: `${this.id}_0` },
      { x: x + width / 2, y, id: `${this.id}_1` },
      { x, y: y + height / 2, id: `${this.id}_2` },
      { x: x - width / 2, y, id: `${this.id}_3` },
    ];
  }
  getNodeStyle() {
    const style = super.getNodeStyle();
    return {
      ...style,
      ...this.graphModel.theme.rect,
    };
  }
}

export { RectNodeModel };
export default RectNodeModel;
