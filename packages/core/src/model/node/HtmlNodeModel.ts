import BaseNodeModel from './BaseNodeModel'
import { Model } from '../BaseModel'
import { ModelType } from '../../constant'

import AnchorConfig = Model.AnchorConfig

export class HtmlNodeModel extends BaseNodeModel {
  modelType = ModelType.HTML_NODE
  getDefaultAnchor(): AnchorConfig[] {
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
