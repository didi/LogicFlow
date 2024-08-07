import { createElement as h } from 'preact/compat'
import { Text, ITextProps, Rect, IRectProps } from '..'
import { BaseText } from '.'
import { BaseEdgeModel, GraphModel } from '../../model'
import { getHtmlTextHeight, getSvgTextSize } from '../../util'

export type ILineTextProps = {
  model: BaseEdgeModel
  graphModel: GraphModel
  draggable: boolean
  editable: boolean
  [key: string]: unknown
}

export type ILineTextState = {
  isHovered: boolean
}

export class LineText extends BaseText<ILineTextProps, ILineTextState> {
  constructor(props: ILineTextProps) {
    super(props)
    this.state = {
      isHovered: false,
    }
  }

  // Hover 状态相关
  setHoverOn = () => {
    this.setState({
      isHovered: true,
    })
  }
  setHoverOff = () => {
    this.setState({
      isHovered: false,
    })
  }

  getBackground(): h.JSX.Element | null {
    const { isHovered } = this.state
    const { model } = this.props
    const { text } = model
    const style = model.getTextStyle()

    let backgroundStyle = style.background || {}
    if (isHovered && style.hover && style.hover.background) {
      backgroundStyle = { ...backgroundStyle, ...style.hover.background }
    }

    // 当存在文本并且文本背景不为透明时，计算背景框
    if (text?.value && backgroundStyle?.fill !== 'transparent') {
      const { fontSize, textWidth, lineHeight, overflowMode } = style
      const { wrapPadding } = backgroundStyle
      const rows = text?.value.split(/[\r\n]/g)
      const rowsLength = rows.length

      let { x, y } = text
      let rectAttr: unknown = {}

      if (overflowMode === 'autoWrap' && textWidth) {
        const textHeight = getHtmlTextHeight({
          rows,
          style: {
            fontSize: `${fontSize}px`,
            width: `${textWidth}px`,
            lineHeight,
            padding: wrapPadding,
          },
          rowsLength,
          className: 'lf-get-text-height',
        })

        rectAttr = {
          ...backgroundStyle,
          x,
          y,
          width: textWidth,
          height: textHeight,
        }
      } else {
        // 背景框宽度，最长一行字节数 / 2 * fontSize + 2
        // 背景框宽度，行数 * fontSize + 2
        let { width, height } = getSvgTextSize({ rows, rowsLength, fontSize })
        if (overflowMode === 'ellipsis') {
          // https://github.com/didi/LogicFlow/issues/1151
          // 边上的文字过长（使用"ellipsis"模式）出现省略号，背景也需要进行宽度的重新计算

          // 跟Text.tsx保持同样的计算逻辑(overflowMode === 'ellipsis')
          // Text.tsx使用textRealWidth=textWidth || width
          // Text.tsx使用foreignObjectHeight = fontSize + 2;
          width = textWidth
          height = fontSize + 2
        }

        // 根据设置的 padding 调整 width, height, x, y 的值
        // TODO: 下面方法感觉可以提取成工具方法
        if (typeof backgroundStyle.wrapPadding === 'string') {
          let padding = backgroundStyle.wrapPadding
            .split(',')
            .filter((padding) => padding.trim())
            .map((padding) => parseFloat(padding.trim()))

          if (padding.length > 0 && padding.length <= 4) {
            if (padding.length === 1) {
              const [allSides] = padding
              padding = [allSides, allSides, allSides, allSides]
            } else if (padding.length === 2) {
              const [vertical, horizontal] = padding
              padding = [vertical, horizontal, vertical, horizontal]
            } else if (padding.length === 3) {
              const [top, horizontal, bottom] = padding
              padding = [top, horizontal, bottom, horizontal]
            }

            const [top, right, bottom, left] = padding
            width += right + left
            height += top + bottom
            x = x + (right - left) / 2
            y = y + (bottom - top) / 2
          }
        }

        rectAttr = {
          ...backgroundStyle,
          x: x - 1,
          y: y - 1,
          width,
          height,
        }
      }

      return <Rect {...(rectAttr as IRectProps)} />
    }

    return null
  }

  getShape(): h.JSX.Element | null {
    const { model } = this.props
    const {
      text: { x, y, value },
    } = model
    if (!value) return null

    const style = model.getTextStyle()
    const attrs: ITextProps = {
      x,
      y,
      value,
      model,
      className: 'lf-element-text',
      ...style, // 透传 edgeText 属性，如：color, fontSize, fontWeight, fontFamily, textAnchor 等
    }

    return (
      <g
        className="lf-line-text"
        onMouseEnter={this.setHoverOn}
        onMouseLeave={this.setHoverOff}
      >
        {this.getBackground()}
        <Text {...attrs} />
      </g>
    )
  }
}

export default LineText
