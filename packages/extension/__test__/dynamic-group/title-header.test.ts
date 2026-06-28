/**
 * @jest-environment jsdom
 */
import LogicFlow from '@logicflow/core'
import type { DynamicGroupNodeModel } from '../../src/dynamic-group'
import { DynamicGroup } from '../../src/dynamic-group'
import {
  DEFAULT_TITLE_TEXT_ALIGN,
  DEFAULT_TITLE_WRAP_PADDING,
  DG_OPERATE_INSET,
  DG_TITLE_LEFT_CLEARANCE,
  formatWrapPaddingCss,
  getTitleBand,
  getTitleForeignObjectRect,
  parseWrapPadding,
  resolveTitleTextPosition,
  textAlignToAnchor,
} from '../../src/dynamic-group/utils'
import { createContainer } from './fixtures'

afterEach(() => {
  document.body.innerHTML = ''
})

function createLF(textEdit?: boolean) {
  return new LogicFlow({
    container: createContainer(),
    width: 1200,
    height: 800,
    plugins: [DynamicGroup],
    ...(textEdit !== undefined ? { textEdit } : {}),
  })
}

function renderGroup(
  lf: LogicFlow,
  properties: Record<string, unknown> = {},
  opts: {
    x?: number
    y?: number
    text?: string
    width?: number
    height?: number
  } = {},
) {
  const x = opts.x ?? 400
  const y = opts.y ?? 300
  const width = opts.width ?? 400
  const height = opts.height ?? 200
  lf.render({
    nodes: [
      {
        id: 'group_1',
        type: 'dynamic-group',
        x,
        y,
        text: opts.text ?? 'My Group',
        properties: {
          width,
          height,
          collapsedWidth: 80,
          collapsedHeight: 60,
          collapsible: true,
          isCollapsed: false,
          ...properties,
        },
      },
    ],
  })
  return lf.getNodeModelById('group_1') as DynamicGroupNodeModel
}

describe('dynamic-group title textStyle utils', () => {
  test('parseWrapPadding: four-value shorthand', () => {
    expect(parseWrapPadding('15,8,4,12')).toEqual({
      top: 15,
      right: 8,
      bottom: 4,
      left: 12,
    })
  })

  test('formatWrapPaddingCss converts to valid CSS padding', () => {
    expect(formatWrapPaddingCss('15,8,4,12')).toBe('15px 8px 4px 12px')
  })

  test('textAlignToAnchor maps CSS alignment to SVG anchor', () => {
    expect(textAlignToAnchor('left')).toBe('start')
    expect(textAlignToAnchor('center')).toBe('middle')
    expect(textAlignToAnchor('right')).toBe('end')
  })

  test('getTitleBand: full-width band with inset top', () => {
    expect(getTitleBand({ x: 400, y: 300, width: 400, height: 200 })).toEqual({
      bandLeft: 200,
      bandTop: 210,
      bandWidth: 400,
      bandHeight: 190,
    })
  })

  test('resolveTitleTextPosition: center with zero padding', () => {
    expect(
      resolveTitleTextPosition({
        x: 400,
        y: 300,
        width: 400,
        height: 200,
        textAlign: 'center',
        pad: parseWrapPadding('0,0,0,0'),
      }),
    ).toEqual({ x: 400, y: 210 })
  })

  test('resolveTitleTextPosition: left with zero padding starts at DG left edge', () => {
    expect(
      resolveTitleTextPosition({
        x: 400,
        y: 300,
        width: 400,
        height: 200,
        textAlign: 'left',
        pad: parseWrapPadding('0,0,0,0'),
      }),
    ).toEqual({ x: 200, y: 210 })
  })

  test('resolveTitleTextPosition: left with clearance padding clears operator', () => {
    expect(
      resolveTitleTextPosition({
        x: 400,
        y: 300,
        width: 400,
        height: 200,
        textAlign: 'left',
        pad: parseWrapPadding(`0,0,0,${DG_TITLE_LEFT_CLEARANCE}`),
      }),
    ).toEqual({ x: 200 + DG_TITLE_LEFT_CLEARANCE, y: 210 })
  })

  test('getTitleForeignObjectRect: autoWrap uses band top-left and remaining height', () => {
    expect(
      getTitleForeignObjectRect({
        x: 400,
        y: 300,
        width: 400,
        height: 200,
        overflowMode: 'autoWrap',
        fontSize: 12,
        pad: parseWrapPadding('0,0,0,0'),
      }),
    ).toEqual({
      foX: 200,
      foY: 210,
      foWidth: 400,
      foHeight: 190,
    })
  })

  test('getTitleForeignObjectRect: ellipsis uses single-line height', () => {
    expect(
      getTitleForeignObjectRect({
        x: 400,
        y: 300,
        width: 400,
        height: 200,
        overflowMode: 'ellipsis',
        fontSize: 12,
        pad: parseWrapPadding('20,0,6,0'),
      }),
    ).toEqual({
      foX: 200,
      foY: 210,
      foWidth: 400,
      foHeight: 20 + 12 + 2 + 6,
    })
  })
})

describe('DynamicGroupNodeModel textStyle (integration)', () => {
  test('getTextStyle defaults wrapPadding and textAlign', () => {
    const lf = createLF()
    const model = renderGroup(lf)

    const style = model.getTextStyle()
    expect(style.wrapPadding).toBe(
      formatWrapPaddingCss(DEFAULT_TITLE_WRAP_PADDING),
    )
    expect(style.textAlign).toBe(DEFAULT_TITLE_TEXT_ALIGN)
    expect(style.textAnchor).toBe('middle')
    expect(style.dominantBaseline).toBe('hanging')
  })

  test('html overflow modes do not shrink textWidth', () => {
    const lf = createLF()
    const ellipsisModel = renderGroup(
      lf,
      { textStyle: { overflowMode: 'ellipsis' } },
      { width: 400 },
    )
    const autoWrapModel = renderGroup(
      lf,
      { textStyle: { overflowMode: 'autoWrap' } },
      { width: 400 },
    )

    expect(ellipsisModel.getTextStyle().textWidth).toBeUndefined()
    expect(autoWrapModel.getTextStyle().textWidth).toBeUndefined()
  })

  test('setTextPosition centers title on full DG width when padding is zero', () => {
    const lf = createLF()
    const model = renderGroup(
      lf,
      {
        textStyle: {
          wrapPadding: '0,0,0,0',
          textAlign: 'center',
          overflowMode: 'ellipsis',
        },
      },
      { width: 400, x: 400, y: 300 },
    )

    model.setTextPosition()
    expect(model.text.x).toBe(400)
    expect(model.text.y).toBe(300 - 200 / 2 + DG_OPERATE_INSET)
  })

  test('setTextPosition uses band top for default overflow', () => {
    const lf = createLF()
    const model = renderGroup(
      lf,
      { textStyle: { wrapPadding: '0,0,0,0' } },
      { width: 400, y: 300 },
    )

    model.setTextPosition()
    expect(model.text.y).toBe(300 - 200 / 2 + DG_OPERATE_INSET)
  })

  test('collapsible false keeps the same y as collapsible true', () => {
    const lf = createLF()
    const collapsibleModel = renderGroup(lf, {
      collapsible: true,
      textStyle: { wrapPadding: '0,0,0,0' },
    })
    const plainModel = renderGroup(lf, {
      collapsible: false,
      textStyle: { wrapPadding: '0,0,0,0' },
    })

    collapsibleModel.setTextPosition()
    plainModel.setTextPosition()

    expect(plainModel.text.y).toBe(collapsibleModel.text.y)
  })

  test('ellipsis sets textHeight from wrapPadding', () => {
    const lf = createLF()
    const model = renderGroup(lf, {
      textStyle: {
        overflowMode: 'ellipsis',
        wrapPadding: '20,0,6,0',
      },
    })

    const style = model.getTextStyle()
    expect(style.textHeight).toBe(20 + 12 + 2 + 6)
    expect(style.wrapPadding).toBe('20px 0px 6px 0px')
  })

  test('setTextPosition replaces text object when padding changes', () => {
    const lf = createLF()
    const model = renderGroup(lf, {}, { y: 300 })
    const before = model.text

    model.setProperties({
      textStyle: { wrapPadding: '40,0,0,0' },
    })

    expect(model.text.y).toBe(300 - 200 / 2 + DG_OPERATE_INSET + 40)
    expect(model.text).not.toBe(before)
  })

  test('setTextPosition keeps collapsed text centered on node', () => {
    const lf = createLF()
    const model = renderGroup(lf, { isCollapsed: true }, { x: 120, y: 80 })

    model.setTextPosition()
    expect(model.text.x).toBe(model.x)
    expect(model.text.y).toBe(model.y)
  })

  test('getTitleHtmlRect matches foreign object band for autoWrap', () => {
    const lf = createLF()
    const model = renderGroup(
      lf,
      { textStyle: { overflowMode: 'autoWrap', wrapPadding: '0,0,0,0' } },
      { x: 400, y: 300, width: 400, height: 200 },
    )

    expect(model.getTitleHtmlRect()).toEqual({
      foX: 200,
      foY: 210,
      foWidth: 400,
      foHeight: 190,
    })
  })

  test('text remains editable when textEdit enabled', () => {
    const lf = createLF(true)
    const model = renderGroup(lf)
    expect(model.text.editable).not.toBe(false)
  })
})
