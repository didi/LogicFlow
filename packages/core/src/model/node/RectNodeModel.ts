import { computed, observable } from 'mobx';
import { Point } from '../../type';
import BaseNodeModel from './BaseNodeModel';
import { ModelType } from '../../constant/constant';
import GraphModel from '../GraphModel';
import { defaultTheme } from '../../constant/DefaultTheme';

class RectNodeModel extends BaseNodeModel {
  modelType = ModelType.RECT_NODE;
  @observable radius = defaultTheme.rect.radius;

  constructor(data, graphModel: GraphModel) {
    super(data, graphModel, 'rect');
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
