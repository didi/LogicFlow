import { createElement as h } from 'preact/compat'
import { BaseNodeModel, BaseEdgeModel } from '../../model'
import { ElementType, ModelType } from '../../constant'
import { getHtmlTextHeight } from '../../util'
import { forEach, toPairs } from 'lodash-es'

export type ITextProps = {
  x: number
  y: number
  value: string
  fontSize?: number
  fill?: string
  overflowMode?: 'default' | 'autoWrap' | 'ellipsis'
  textWidth?: number
  lineHeight?: number
  fontFamily?: string | null
  wrapPadding?: string | number | null
  model: BaseNodeModel | BaseEdgeModel
  [key: string]: any
}
export type ForeignObjectPropsType =
  'string | number | SignalLike<string | number | undefined> | undefined'

export function Text(props: ITextProps): h.JSX.Element | null {
  const {
    x = 0,
    y = 0,
    value,
    fontSize = 12,
    fill = 'currentColor',
    overflowMode = 'default',
    // TODO: 确认该 textWidth 为 '' 时跟设置什么值一致
    textWidth = undefined,
    model,
  } = props

  const attrs: Record<string, any> = {
    x,
    y,
    fill,
    fontSize,
    textAnchor: 'middle',
    dominantBaseline: 'central',
    // ...props,
  }

  forEach(toPairs(props), ([k, v]: [k: string, v: any]) => {
    if (typeof v !== 'object') {
      attrs[k] = v
    }
  })

  if (value) {
    // String(value)，兼容纯数字的文案
    // TODO: 将 value 转为纯文本，移除其中 \n \r 等特殊字符，看是否应该丰富该功能
    const rows = String(value).split(/[\r\n]/g)
    const rowsLength = rows.length

    if (overflowMode !== 'default') {
      // 非文本节点设置了自动换行，或者边设置了自动换行并且设置了 textWidth
      const { BaseType, modelType } = model
      if (
        (BaseType === ElementType.NODE && modelType !== ModelType.TEXT_NODE) ||
        (BaseType === ElementType.EDGE && textWidth)
      ) {
        return renderHtmlText(props)
      }
    }

    if (rowsLength > 1) {
      const tSpans = rows.map((row, idx) => {
        // 保证文字居中，文字 Y 轴偏移为当前行数对应中心行数的偏移行 * 行高
        const tSpanLineHeight = fontSize + 2
        const offsetY = (idx - (rowsLength - 1) / 2) * tSpanLineHeight
        return (
          <tspan className="lf-text-tspan" x={x} y={y + offsetY}>
            {row}
          </tspan>
        )
      })
      return <text {...attrs}>{tSpans}</text>
    }
    return <text {...attrs}>{value}</text>
  }
  return null
}

export function renderHtmlText(props: ITextProps): h.JSX.Element {
  const {
    x,
    y,
    value,
    model,
    textWidth,
    fontSize = 12,
    lineHeight,
    fontFamily = '',
    wrapPadding = '0, 0',
    overflowMode,
  } = props

  const { width, height, textHeight } = model
  // TODO: 设置文本宽度为 textWidth 或 节点的宽度
  const textRealWidth: number = textWidth || (width as number)
  const rows = String(value).split(/[\r\n]/g)
  const rowsLength = rows.length
  const textRealHeight = getHtmlTextHeight({
    rows,
    style: {
      fontSize: `${fontSize}px`,
      width: `${textRealWidth}px`,
      fontFamily,
      lineHeight,
      padding: wrapPadding,
    },
    rowsLength,
    className: 'lf-get-text-height',
  })

  // 当文字超过边框时，取文字高度的实际值，也就是文字可以超过边框
  let foreignObjectHeight: number =
    (height as number) > textRealHeight ? (height as number) : textRealHeight
  // 如果设置了文本高度，取设置的高度
  if (textHeight) {
    foreignObjectHeight = textHeight as number
  }

  const isEllipsis = overflowMode === 'ellipsis'
  if (isEllipsis) {
    foreignObjectHeight = fontSize + 2
  }

  return (
    <g>
      <foreignObject
        width={textRealWidth}
        height={foreignObjectHeight}
        x={x - textRealWidth / 2}
        y={y - foreignObjectHeight / 2}
        style={{ overflow: 'visible', textAlign: 'left' }}
      >
        <div
          className="lf-node-text-auto-wrap"
          style={{
            minHeight: foreignObjectHeight,
            width: textRealWidth,
            padding: wrapPadding,
          }}
        >
          <div
            className={
              isEllipsis
                ? 'lf-node-text-ellipsis-content'
                : 'lf-node-text-auto-wrap-content'
            }
            title={isEllipsis ? rows.join('') : ''}
            style={{ ...(props as h.JSX.CSSProperties) }}
          >
            {rows.map((row) => (
              <div className="lf-node-text--auto-wrap-inner">{row}</div>
            ))}
          </div>
        </div>
      </foreignObject>
    </g>
  )
}

export default Text
