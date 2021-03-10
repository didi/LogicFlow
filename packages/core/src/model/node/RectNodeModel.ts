import { computed, observable } from 'mobx';
import { assign } from 'lodash-es';
import { Point } from '../../type';
import BaseNodeModel from './BaseNodeModel';
import { ModelType } from '../../constant/constant';
import GraphModel from '../GraphModel';
import { defaultTheme } from '../../constant/DefaultTheme';
import { pickNodeConfig } from '../../util/node';

class RectNodeModel extends BaseNodeModel {
  modelType = ModelType.RECT_NODE;
  @observable width = defaultTheme.rect.width;
  @observable height = defaultTheme.rect.height;
  @observable radius = defaultTheme.rect.radius;

  constructor(data, graphModel: GraphModel) {
    super(data);
    this.setStyleFromTheme('rect', graphModel);
    const attrs = this.setAttributes(data);
    assign(this, pickNodeConfig(data), attrs);
  }

  @computed get anchors(): Point[] {
    const {
      anchorsOffset, x, y, width, height,
    } = this;
    if (Array.isArray(anchorsOffset) && anchorsOffset.length > 0) {
      return anchorsOffset.map((el) => ({
        x: x + el[0],
        y: y + el[1],
      }));
    }
    return [
      { x, y: y - height / 2 },
      { x: x + width / 2, y },
      { x, y: y + height / 2 },
      { x: x - width / 2, y },
    ];
  }
}

export { RectNodeModel };
export default RectNodeModel;
