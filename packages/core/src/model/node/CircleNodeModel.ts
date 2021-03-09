import { computed, observable } from 'mobx';
import { assign } from 'lodash-es';
import { Point, NodeData } from '../../type';
import BaseNodeModel from './BaseNodeModel';
import { ModelType } from '../../constant/constant';
import GraphModel from '../GraphModel';
import { defaultTheme } from '../../constant/DefaultTheme';
import { pickNodeConfig, pickAttributes } from '../../util/node';

class CircleNodeModel extends BaseNodeModel {
  modelType = ModelType.CIRCLE_NODE;
  @observable r = defaultTheme.circle.r;

  constructor(data, graphModel: GraphModel) {
    super(data);
    this.setStyleFromTheme('circle', graphModel);
    const attrs = this.setAttributes(data);
    assign(this, pickNodeConfig(data), pickAttributes(attrs));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setAttributes(data: NodeData) {
    return {};
  }

  @computed get width(): number {
    return this.r * 2;
  }
  @computed get height(): number {
    return this.r * 2;
  }
  @computed get anchors(): Point[] {
    return [
      { x: this.x, y: this.y - this.r },
      { x: this.x + this.r, y: this.y },
      { x: this.x, y: this.y + this.r },
      { x: this.x - this.r, y: this.y },
    ];
  }
}

export { CircleNodeModel };
export default CircleNodeModel;
