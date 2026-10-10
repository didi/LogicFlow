import { createElement as h } from 'preact/compat'
import classNames from 'classnames'
import { BaseText, IBaseTextProps, IBaseTextState } from '@logicflow/core'
import {
  formatWrapPaddingCss,
  isHtmlTextOverflow,
} from '../dynamic-group/utils'
import { TitlePosition } from './constant'
import { getPoolTitleForeignObjectRect } from './utils'

type PoolTitleTextModel = IBaseTextProps['model'] & {
  getTitleTextBox: () => { x: number; y: number; width: number; height: number }
  getResolvedTitlePosition: () => TitlePosition
  getTitleRenderPosition?: () => TitlePosition
  isTitleTextVerticallyCentered?: () => boolean
}

export class PoolTitleText extends BaseText<IBaseTextProps, IBaseTextState> {
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
    const { graphModel } = this.props
    const model = this.props.model as PoolTitleTextModel
    const {
      text: { editable, draggable },
    } = model
    const { editConfigModel } = graphModel
    const rawWrapPadding = style.wrapPadding as string | undefined
    const wrapPadding = formatWrapPaddingCss(rawWrapPadding)
    const titlePosition =
      model.getTitleRenderPosition?.() ?? model.getResolvedTitlePosition()
    const isVerticalTitle =
      titlePosition === 'left' || titlePosition === 'right'
    const { foX, foY, foWidth, foHeight } = getPoolTitleForeignObjectRect({
      titleBox: model.getTitleTextBox(),
      textAnchor: { x: model.text.x, y: model.text.y },
      isVerticalTitle,
    })
    const fontSize = Number(style.fontSize ?? 12)
    const isEllipsis = style.overflowMode === 'ellipsis'
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
          transform={
            isVerticalTitle
              ? `rotate(-90 ${model.text.x} ${model.text.y})`
              : undefined
          }
          style={{ overflow: 'visible', textAlign: 'left' }}
        >
          <div
            className="lf-node-text-auto-wrap lf-pool-title-html"
            style={{
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: model.isTitleTextVerticallyCentered?.()
                ? 'center'
                : 'flex-start',
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

export default PoolTitleText
