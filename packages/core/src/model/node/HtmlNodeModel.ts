import BaseNodeModel from './BaseNodeModel'
import { ModelType } from '../../constant'

export class HtmlNodeModel extends BaseNodeModel {
  modelType = ModelType.HTML_NODE
  getDefaultAnchor() {
    const { x, y, width, height } = this
    return [
      { x, y: y - height / 2, id: `${this.id}_0` },
      { x: x + width / 2, y, id: `${this.id}_1` },
      { x, y: y + height / 2, id: `${this.id}_2` },
      { x: x - width / 2, y, id: `${this.id}_3` },
    ]
  }
}

export default HtmlNodeModel
