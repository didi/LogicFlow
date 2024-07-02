import { cloneDeep, reduce, max } from 'lodash-es'
import { computed } from 'mobx'
import BaseNodeModel from './BaseNodeModel'
import { ModelType, TextMode } from '../../constant'
import LogicFlow from '../../LogicFlow'
import { getSvgTextWidthHeight } from '../../util'

import LabelType = LogicFlow.LabelType
export class TextNodeModel extends BaseNodeModel {
  modelType = ModelType.TEXT_NODE

  getTextStyle() {
    const style = super.getTextStyle()
    const { text } = this.graphModel.theme
    return {
      ...style,
      ...cloneDeep(text),
    }
  }
  getWidthByText(textValue: LabelType) {
    const rows = String(textValue.value).split(/[\r\n]/g)
    const { fontSize } = this.getTextStyle()
    const { width } = getSvgTextWidthHeight({
      rows,
      fontSize,
      rowsLength: rows.length,
    })
    console.log('text width', width)
    return width
  }
  getHeightByText(textValue: LabelType) {
    const rows = String(textValue.value).split(/[\r\n]/g)
    const { fontSize } = this.getTextStyle()
    const { height } = getSvgTextWidthHeight({
      rows,
      fontSize,
      rowsLength: rows.length,
    })
    return height
  }
  @computed get width(): number {
    if (this.textMode === TextMode.LABEL) {
      return reduce(
        this.label,
        (result: number, item: LabelType) => {
          const curWidth = this.getWidthByText(item)
          return max([result, curWidth]) || result
        },
        0,
      )
    }
    return this.getWidthByText(this.text) + 20
  }

  @computed get height(): number {
    if (this.textMode === TextMode.LABEL) {
      return reduce(
        this.label,
        (result: number, item: LabelType) => {
          const curHeight = this.getHeightByText(item)
          return max([result, curHeight]) || result
        },
        0,
      )
    }
    return this.getHeightByText(this.text) + 20
  }
}

export default TextNodeModel
