import LogicFlow, {
  HtmlNodeModel,
  IHtmlNodeProperties,
  BaseNodeModel,
  GraphModel,
} from '@logicflow/core'
import { cloneDeep, isNil, isArray, isEmpty } from 'lodash-es'

import NodeConfig = LogicFlow.NodeConfig

export type NodeAction = {
  name: string
  callback?: (node: BaseNodeModel, graph: GraphModel) => void
}

export interface ReactCustomProperties extends IHtmlNodeProperties {
  // 形状属性
  width?: number
  height?: number
  radius?: number

  // 文字位置属性
  refX?: number
  refY?: number

  // 样式属性
  style?: LogicFlow.CommonTheme
  textStyle?: LogicFlow.TextNodeTheme
  // 标题配置
  _showTitle?: boolean
  _title?: string
  _icon?: string
  _titleHeight?: number
  _expanded?: boolean
}

export class ReactNodeModel<
  P extends ReactCustomProperties = ReactCustomProperties,
> extends HtmlNodeModel<P> {
  private __baseHeight?: number
  public __actions?: {
    name: string
    callback?: (node: BaseNodeModel, graph: GraphModel) => void
  }[]
  constructor(data: NodeConfig<P>, graphModel: GraphModel) {
    super(data, graphModel)
    const { properties } = data
    if (properties) {
      const { _showTitle = false, style = {} } = properties
      if (_showTitle) {
        this.minWidth = 160
        this.minHeight = 80
        this.text.editable = false
        // 判断当前节点宽高是否小于最小宽高，如果是，强制设置为最小宽高
        const newWidth = this.width < this.minWidth ? this.minWidth : this.width
        const newHeight =
          this.height < this.minHeight ? this.minHeight : this.height

        this.setProperties({
          _expanded: false,
          ...properties,
          style: {
            overflow: 'visible',
            ...cloneDeep(style),
          },
          width: newWidth,
          height: newHeight,
        })
        this.setNodeActions([
          {
            name: '复制',
            callback: (nodeModel: BaseNodeModel, graphModel: GraphModel) => {
              graphModel.cloneNode(nodeModel.id)
            },
          },
          {
            name: '删除',
            callback: (nodeModel: BaseNodeModel, graphModel: GraphModel) => {
              graphModel.deleteNode(nodeModel.id)
            },
          },
        ])
      }
    }
  }

  setAttributes() {
    const { width, height, radius, _showTitle, _titleHeight } = this.properties
    if (!isNil(width)) {
      this.width = width
    }
    if (!isNil(height)) {
      this.height = height
    }
    if (!isNil(radius)) {
      this.radius = radius
    }
    if (this.__baseHeight === undefined) {
      this.__baseHeight = isNil(height) ? this.height : height
    }
    const extra = _showTitle ? (_titleHeight ?? 28) : 0
    const base = isNil(height) ? this.__baseHeight : height
    this.height = base + extra
  }

  getTextStyle(): LogicFlow.TextNodeTheme {
    // const { x, y, width, height } = this
    const { refX = 0, refY = 0, textStyle } = this.properties
    const style = super.getTextStyle()

    // 通过 transform 重新设置 text 的位置
    return {
      ...style,
      ...(cloneDeep(textStyle) || {}),
      transform: `matrix(1 0 0 1 ${refX} ${refY})`,
    }
  }

  getNodeStyle(): LogicFlow.CommonTheme {
    const style = super.getNodeStyle()
    const {
      style: customNodeStyle,
      // radius = 0, // 第二种方式，设置圆角
    } = this.properties

    return {
      ...style,
      ...(cloneDeep(customNodeStyle) || {}),
      // rx: radius,
      // ry: radius,
    }
  }

  setNodeActions(actions: NodeAction[]) {
    this.__actions =
      isArray(actions) && !isEmpty(actions) ? cloneDeep(actions) : []
  }
}

export default ReactNodeModel
