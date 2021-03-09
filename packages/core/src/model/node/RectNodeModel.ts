import { computed, observable } from 'mobx';
import { assign } from 'lodash-es';
import { Point } from '../../type';
import BaseNodeModel from './BaseNodeModel';
import { ModelType } from '../../constant/constant';
import GraphModel from '../GraphModel';
import { defaultTheme } from '../../constant/DefaultTheme';
import { pickNodeConfig, pickNodeAttributes } from '../../util/node';

class RectNodeModel extends BaseNodeModel {
  modelType = ModelType.RECT_NODE;
  @observable width = defaultTheme.rect.width;
  @observable height = defaultTheme.rect.height;
  @observable radius = defaultTheme.rect.radius;

  constructor(data, graphModel: GraphModel) {
    super(data);
    this.setStyleFromTheme('rect', graphModel);
    const attrs = this.setAttributes(data);
    assign(this, pickNodeConfig(data), pickNodeAttributes(attrs));
  }

  @computed get anchors(): Point[] {
    return [
      { x: this.x, y: this.y - this.height / 2 },
      { x: this.x + this.width / 2, y: this.y },
      { x: this.x, y: this.y + this.height / 2 },
      { x: this.x - this.width / 2, y: this.y },
    ];
  }
}

export { RectNodeModel };
export default RectNodeModel;
