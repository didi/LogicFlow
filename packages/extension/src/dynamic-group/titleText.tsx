import { createElement as h } from 'preact/compat'
import classNames from 'classnames'
import { BaseText, IBaseTextProps, IBaseTextState } from '@logicflow/core'
import {
  formatWrapPaddingCss,
  getTitleForeignObjectRect,
  isHtmlTextOverflow,
  parseWrapPadding,
} from './utils'

type DynamicGroupTextProps = IBaseTextProps

export class DynamicGroupText extends BaseText<
  DynamicGroupTextProps,
  IBaseTextState
> {
  getShape(): h.JSX.Element | null {
    const { model } = this.props
    const {
      text: { value },
    } = model
    const style = model.getTextStyle()
    const overflowMode = (style.overflowMode as string) ?? 'default'

    if (isHtmlTextOverflow(overflowMode)) {
      return this.renderTitleHtmlText(value, style)
    }

    return super.getShape()
  }

  private renderTitleHtmlText(
    value: string,
    style: Record<string, unknown>,
  ): h.JSX.Element {
    const { model, graphModel } = this.props
    const {
      text: { editable, draggable },
    } = model
    const { editConfigModel } = graphModel
    const overflowMode = style.overflowMode as 'autoWrap' | 'ellipsis'
    const fontSize = Number(style.fontSize ?? 12)
    const rawWrapPadding = style.wrapPadding as string | undefined
    const pad = parseWrapPadding(rawWrapPadding)
    const wrapPadding = formatWrapPaddingCss(rawWrapPadding)
    const { foX, foY, foWidth, foHeight } = getTitleForeignObjectRect({
      x: model.x as number,
      y: model.y as number,
      width: model.width as number,
      height: model.height as number,
      overflowMode,
      fontSize,
      pad,
    })
    const isEllipsis = overflowMode === 'ellipsis'
    const rows = String(value).split(/\r\n|\r|\n/g)
    const isDraggable = editConfigModel.nodeTextDraggable || draggable

    return (
      <g
        className={classNames({
          'lf-element-text': editable,
          'lf-text-draggable': !editable && isDraggable,
          'lf-text-disabled': !editable && !isDraggable,
        })}
      >
        <foreignObject
          width={foWidth}
          height={foHeight}
          x={foX}
          y={foY}
          style={{ overflow: 'visible', textAlign: 'left' }}
        >
          <div
            className="lf-node-text-auto-wrap lf-dg-title-html"
            style={{
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'stretch',
              width: foWidth,
              height: foHeight,
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
              style={{
                textAlign: style.textAlign as h.JSX.CSSProperties['textAlign'],
                fontSize,
                lineHeight: style.lineHeight as string | number | undefined,
                fontFamily: style.fontFamily as string | undefined,
                color: style.fill as string | undefined,
                width: '100%',
              }}
            >
              {rows.map((row, i) => (
                <div key={i} className="lf-node-text--auto-wrap-inner">
                  {row}
                </div>
              ))}
            </div>
          </div>
        </foreignObject>
      </g>
    )
  }
}

export default DynamicGroupText
