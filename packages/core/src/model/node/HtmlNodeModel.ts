import { computed } from 'mobx';
import { Point } from '../../type';
import BaseNodeModel from './BaseNodeModel';
import { ModelType } from '../../constant/constant';
import GraphModel from '../GraphModel';

class HtmlNodeModel extends BaseNodeModel {
  modelType = ModelType.HTML_NODE;

  constructor(data, graphModel: GraphModel) {
    super(data, graphModel, 'html');
  }

  @computed get anchors(): Point[] {
    const {
      anchorsOffset, x, y, width, height,
    } = this;
    if (anchorsOffset && anchorsOffset.length > 0) {
      return this.getAnchorsByOffset();
    }
    return [
      { x, y: y - height / 2, id: `${this.id}_0`, isSourceAnchor: true, isTargetAnchor: true },
      { x: x + width / 2, y, id: `${this.id}_1`, isSourceAnchor: true, isTargetAnchor: true },
      { x, y: y + height / 2, id: `${this.id}_2`, isSourceAnchor: true, isTargetAnchor: true },
      { x: x - width / 2, y, id: `${this.id}_3`, isSourceAnchor: true, isTargetAnchor: true },
    ];
  }
}

export { HtmlNodeModel };
export default HtmlNodeModel;
