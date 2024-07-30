import { cloneDeep } from 'lodash-es'
import { computed } from 'mobx'
import BaseNodeModel from './BaseNodeModel'
import { ModelType } from '../../constant'
import { getSvgTextWidthHeight } from '../../util'

export class TextNodeModel extends BaseNodeModel {
  modelType = ModelType.TEXT_NODE

  getTextStyle() {
    const style = super.getTextStyle()
    const { text } = this.graphModel.theme
    const { textStyle } = this.properties
    return {
      ...style,
      ...cloneDeep(text),
      ...cloneDeep(textStyle as object),
    }
  }
  @computed get width(): number {
    const rows = String(this.text.value).split(/[\r\n]/g)
    const { fontSize } = this.getTextStyle()
    const { width } = getSvgTextWidthHeight({
      rows,
      fontSize,
      rowsLength: rows.length,
    })
    return width
  }

  @computed get height(): number {
    const rows = String(this.text.value).split(/[\r\n]/g)
    const { fontSize } = this.getTextStyle()
    const { height } = getSvgTextWidthHeight({
      rows,
      fontSize,
      rowsLength: rows.length,
    })
    return height
  }
}

export default TextNodeModel
