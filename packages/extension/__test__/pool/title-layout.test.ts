import {
  getPoolTitleForeignObjectRect,
  getTitleLayout,
  resolveLaneTitlePosition,
  resolvePoolTitlePosition,
} from '../../src/pool/utils'
import { PoolView } from '../../src/pool/PoolView'
import { LaneView } from '../../src/pool/LaneView'
import { getPoolLaneDragOverlayShapes } from '../../src/pool/PoolLaneDragOverlay'
import { POOL_STYLE_ID } from '../../src/pool/style'
import { createPoolLF, createPoolWithTwoLanes } from './fixtures'

function getShapeChildren(shape: any): any[] {
  return Array.isArray(shape?.props?.children) ? shape.props.children : []
}

function createView(ViewCtor: any, model: any, graphModel: any) {
  const view = Object.create(ViewCtor.prototype)
  view.props = { model, graphModel }
  return view
}

describe('pool title layout', () => {
  test('resolves pool and lane title positions and computes four-side geometry', () => {
    expect(resolvePoolTitlePosition({ direction: 'horizontal' } as any)).toBe(
      'left',
    )
    expect(resolvePoolTitlePosition({ direction: 'vertical' } as any)).toBe(
      'top',
    )
    expect(
      resolveLaneTitlePosition({}, {
        laneConfig: { titlePosition: 'bottom' },
      } as any),
    ).toBe('bottom')
    expect(
      resolveLaneTitlePosition({ titlePosition: 'right' }, {
        laneConfig: { titlePosition: 'bottom' },
      } as any),
    ).toBe('right')

    expect(
      getTitleLayout({ x: 0, y: 0, width: 300, height: 200 }, 'left', 40)
        .divider,
    ).toEqual(expect.objectContaining({ x1: -110, x2: -110 }))

    expect(
      getTitleLayout({ x: 0, y: 0, width: 300, height: 200 }, 'right', 40)
        .divider,
    ).toEqual(expect.objectContaining({ x1: 110, x2: 110 }))

    expect(
      getTitleLayout({ x: 0, y: 0, width: 300, height: 200 }, 'top', 40)
        .divider,
    ).toEqual(expect.objectContaining({ y1: -60, y2: -60 }))

    expect(
      getTitleLayout({ x: 0, y: 0, width: 300, height: 200 }, 'bottom', 40)
        .divider,
    ).toEqual(expect.objectContaining({ y1: 60, y2: 60 }))

    expect(
      getTitleLayout({ x: 0, y: 0, width: 300, height: 200 }, 'right', 40)
        .titleBox,
    ).toEqual(expect.objectContaining({ x: 130, y: 0, width: 40, height: 200 }))

    expect(
      getTitleLayout({ x: 0, y: 0, width: 300, height: 200 }, 'right', 40)
        .contentBox,
    ).toEqual(
      expect.objectContaining({ x: -20, y: 0, width: 260, height: 200 }),
    )

    expect(
      getTitleLayout({ x: 0, y: 0, width: 300, height: 200 }, 'top', 40)
        .titleBox,
    ).toEqual(expect.objectContaining({ x: 0, y: -80, width: 300, height: 40 }))

    expect(
      getTitleLayout({ x: 0, y: 0, width: 300, height: 200 }, 'top', 40)
        .contentBox,
    ).toEqual(expect.objectContaining({ x: 0, y: 20, width: 300, height: 160 }))

    expect(
      getTitleLayout({ x: 0, y: 0, width: 300, height: 200 }, 'left', 40)
        .textAnchor,
    ).toEqual(expect.objectContaining({ x: -130, y: 0 }))

    expect(
      getTitleLayout({ x: 0, y: 0, width: 300, height: 200 }, 'bottom', 40)
        .textAnchor,
    ).toEqual(expect.objectContaining({ x: 0, y: 80 }))
  })

  test('keeps the title size on one axis only', () => {
    const leftLayout = getTitleLayout(
      { x: 0, y: 0, width: 300, height: 200 },
      'left',
      40,
    )
    const topLayout = getTitleLayout(
      { x: 0, y: 0, width: 300, height: 200 },
      'top',
      40,
    )

    expect(leftLayout.titleBox.height).toBe(200)
    expect(leftLayout.contentBox.height).toBe(200)
    expect(topLayout.titleBox.width).toBe(300)
    expect(topLayout.contentBox.width).toBe(300)
  })

  test('uses the Pool or Lane title box for HTML title text bounds', () => {
    const titleBox = { x: 130, y: 0, width: 40, height: 200 }
    const rect = getPoolTitleForeignObjectRect({
      titleBox,
      textAnchor: { x: titleBox.x, y: titleBox.y },
      isVerticalTitle: true,
    })

    // 旋转前交换宽高，旋转后才会刚好贴合左右标题条。
    expect(rect).toEqual({ foX: 30, foY: -20, foWidth: 200, foHeight: 40 })
  })

  test('clamps title size to the title axis without creating negative content bounds', () => {
    const narrowHorizontalLayout = getTitleLayout(
      { x: 0, y: 0, width: 20, height: 200 },
      'left',
      100,
    )
    const narrowVerticalLayout = getTitleLayout(
      { x: 0, y: 0, width: 200, height: 20 },
      'top',
      100,
    )

    expect(narrowHorizontalLayout.titleBox.width).toBe(20)
    expect(narrowHorizontalLayout.contentBox.width).toBe(0)
    expect(narrowHorizontalLayout.contentBox.height).toBe(200)
    expect(narrowVerticalLayout.titleBox.height).toBe(20)
    expect(narrowVerticalLayout.contentBox.height).toBe(0)
    expect(narrowVerticalLayout.contentBox.width).toBe(200)
  })

  test('prefers explicit pool title position over the legacy direction', () => {
    expect(
      resolvePoolTitlePosition({
        direction: 'horizontal',
        titlePosition: 'bottom',
      } as any),
    ).toBe('bottom')
    expect(
      resolvePoolTitlePosition({
        direction: 'vertical',
        titlePosition: 'right',
      } as any),
    ).toBe('right')
  })

  test('uses the resolved title edge for Pool and Lane text anchors', () => {
    const graph = createPoolWithTwoLanes('horizontal') as any
    graph.nodes[0].properties = {
      ...graph.nodes[0].properties,
      titlePosition: 'right',
      laneConfig: { titlePosition: 'bottom' },
    }
    graph.nodes[1].properties = {
      ...graph.nodes[1].properties,
      titlePosition: 'top',
    }

    const lf = createPoolLF()
    lf.render(graph)

    const pool = lf.getNodeModelById('pool_1') as any
    const lane = lf.getNodeModelById('lane_1') as any

    expect(pool.getResolvedTitlePosition()).toBe('right')
    expect(lane.getResolvedTitlePosition()).toBe('top')
    expect(pool.text.x).toBe(
      getTitleLayout(
        { x: pool.x, y: pool.y, width: pool.width, height: pool.height },
        'right',
        pool.titleSize,
      ).textAnchor.x,
    )
    expect(lane.text.y).toBe(
      getTitleLayout(
        { x: lane.x, y: lane.y, width: lane.width, height: lane.height },
        'top',
        lane.titleSize,
      ).textAnchor.y,
    )
  })

  test('refreshes Pool and inherited Lane title text after title configuration changes', () => {
    const lf = createPoolLF()
    lf.render(createPoolWithTwoLanes('horizontal'))

    const pool = lf.getNodeModelById('pool_1') as any
    const lane = lf.getNodeModelById('lane_1') as any
    pool.setProperties({
      ...pool.properties,
      titlePosition: 'right',
      laneConfig: { ...pool.properties.laneConfig, titlePosition: 'bottom' },
    })

    const poolLayout = getTitleLayout(
      { x: pool.x, y: pool.y, width: pool.width, height: pool.height },
      'right',
      pool.titleSize,
    )
    const laneLayout = getTitleLayout(
      { x: lane.x, y: lane.y, width: lane.width, height: lane.height },
      'bottom',
      lane.titleSize,
    )

    expect(pool.text).toEqual(
      expect.objectContaining({
        x: poolLayout.textAnchor.x,
        y: poolLayout.textAnchor.y,
      }),
    )
    expect(lane.text).toEqual(
      expect.objectContaining({
        x: laneLayout.textAnchor.x,
        y: laneLayout.textAnchor.y,
      }),
    )
    expect(pool.getTextStyle()).toEqual(
      expect.objectContaining({ transform: 'rotate(-90deg)' }),
    )
  })

  test.each(['top', 'right', 'bottom', 'left'] as const)(
    'keeps the %s Lane collapse button inside its title area',
    (titlePosition) => {
      const graph = createPoolWithTwoLanes('horizontal') as any
      graph.nodes[0].properties = {
        ...graph.nodes[0].properties,
        laneConfig: { titlePosition },
      }
      const lf = createPoolLF()
      lf.render(graph)

      const graphModel = (lf as any).graphModel
      const lane = lf.getNodeModelById('lane_1') as any
      const titleBox = lane.getTitleTextBox()
      const icon = createView(LaneView, lane, graphModel).getOperateIcon()
      const button = getShapeChildren(icon)[0]

      expect(button.props.x).toBeGreaterThanOrEqual(
        titleBox.x - titleBox.width / 2,
      )
      expect(button.props.y).toBeGreaterThanOrEqual(
        titleBox.y - titleBox.height / 2,
      )
      expect(button.props.x + button.props.width).toBeLessThanOrEqual(
        titleBox.x + titleBox.width / 2,
      )
      expect(button.props.y + button.props.height).toBeLessThanOrEqual(
        titleBox.y + titleBox.height / 2,
      )
    },
  )

  test.each(['top', 'right', 'bottom', 'left'] as const)(
    'keeps the %s Pool collapse button inside its title area',
    (titlePosition) => {
      const graph = createPoolWithTwoLanes('horizontal') as any
      graph.nodes[0].properties = {
        ...graph.nodes[0].properties,
        titlePosition,
      }
      const lf = createPoolLF()
      lf.render(graph)

      const graphModel = (lf as any).graphModel
      const pool = lf.getNodeModelById('pool_1') as any
      const titleBox = pool.getTitleTextBox()
      const icon = createView(PoolView, pool, graphModel).getOperateIcon()
      const button = getShapeChildren(icon)[0]

      expect(button.props.x).toBeGreaterThanOrEqual(
        titleBox.x - titleBox.width / 2,
      )
      expect(button.props.y).toBeGreaterThanOrEqual(
        titleBox.y - titleBox.height / 2,
      )
      expect(button.props.x + button.props.width).toBeLessThanOrEqual(
        titleBox.x + titleBox.width / 2,
      )
      expect(button.props.y + button.props.height).toBeLessThanOrEqual(
        titleBox.y + titleBox.height / 2,
      )
    },
  )

  test('hides Pool and Lane collapse buttons when plugin collapse options disable them', () => {
    const lf = createPoolLF({ collapse: { pool: false, lane: false } })
    lf.render(createPoolWithTwoLanes('horizontal'))

    const graphModel = (lf as any).graphModel
    const pool = lf.getNodeModelById('pool_1') as any
    const lane = lf.getNodeModelById('lane_1') as any

    expect(createView(PoolView, pool, graphModel).getOperateIcon()).toBeNull()
    expect(createView(LaneView, lane, graphModel).getOperateIcon()).toBeNull()
  })

  test.each(['top', 'right', 'bottom', 'left'] as const)(
    'centers the %s Lane collapse button on the title edge thickness',
    (titlePosition) => {
      const graph = createPoolWithTwoLanes('horizontal') as any
      graph.nodes[0].properties = {
        ...graph.nodes[0].properties,
        laneConfig: { titlePosition },
      }
      const lf = createPoolLF()
      lf.render(graph)

      const graphModel = (lf as any).graphModel
      const lane = lf.getNodeModelById('lane_1') as any
      const titleBox = lane.getTitleTextBox()
      const icon = createView(LaneView, lane, graphModel).getOperateIcon()
      const button = getShapeChildren(icon)[0]

      if (titlePosition === 'top' || titlePosition === 'bottom') {
        expect(button.props.y + button.props.height / 2).toBe(titleBox.y)
      } else {
        expect(button.props.x + button.props.width / 2).toBe(titleBox.x)
      }
    },
  )

  test('recomputes a collapsed Lane size after its inherited title edge changes', () => {
    const lf = createPoolLF()
    lf.render(createPoolWithTwoLanes('horizontal'))

    const pool = lf.getNodeModelById('pool_1') as any
    const lane = lf.getNodeModelById('lane_1') as any
    const expandedWidth = lane.width

    lane.toggleCollapse(true)
    pool.setProperties({
      ...pool.properties,
      laneConfig: { ...pool.properties.laneConfig, titlePosition: 'top' },
    })

    expect(lane.isCollapsed).toBe(true)
    expect(lane.width).toBe(expandedWidth)
    expect(lane.height).toBe(lane.titleSize)
  })

  test.each([
    ['right', 'horizontal', 'x', 'maxX'],
    ['bottom', 'vertical', 'y', 'maxY'],
  ] as const)(
    'keeps the %s Lane title edge fixed while collapsing and expanding',
    (titlePosition, direction, axis, bound) => {
      const graph = createPoolWithTwoLanes(direction) as any
      graph.nodes[0].properties = {
        ...graph.nodes[0].properties,
        laneConfig: { titlePosition },
      }
      const lf = createPoolLF()
      lf.render(graph)

      const lane = lf.getNodeModelById('lane_1') as any
      const originalBounds = lane.getBounds()
      lane.toggleCollapse(true)
      expect(lane.getBounds()[bound]).toBe(originalBounds[bound])

      lane.toggleCollapse(false)
      expect(lane[axis]).toBe(
        axis === 'x'
          ? originalBounds.minX + lane.width / 2
          : originalBounds.minY + lane.height / 2,
      )
    },
  )

  test('centers Pool and Lane title text for every title edge', () => {
    const lf = createPoolLF()
    lf.render(createPoolWithTwoLanes('horizontal'))
    const pool = lf.getNodeModelById('pool_1') as any
    const lane = lf.getNodeModelById('lane_1') as any

    expect(pool.getTextStyle().textAlign).toBe('center')
    expect(lane.getTextStyle().textAlign).toBe('center')
  })

  test('vertically centers Pool and Lane HTML titles inside their title areas', async () => {
    const lf = createPoolLF()
    lf.render(createPoolWithTwoLanes('horizontal'))
    await Promise.resolve()

    const titleContainers = Array.from(
      lf.container.querySelectorAll('.lf-pool-title-html'),
    ) as HTMLDivElement[]
    expect(titleContainers.length).toBeGreaterThanOrEqual(2)
    titleContainers.forEach((container) => {
      expect(container.style.alignItems).toBe('center')
    })
  })

  test.each([
    ['horizontal', 'left', 'width', 'height'],
    ['vertical', 'top', 'height', 'width'],
  ] as const)(
    'uses the %s Pool axis when collapsing a Lane with a %s title',
    (direction, titlePosition, retainedAxis, collapsedAxis) => {
      const graph = createPoolWithTwoLanes(direction) as any
      graph.nodes[0].properties = {
        ...graph.nodes[0].properties,
        laneConfig: { titlePosition },
      }
      const lf = createPoolLF()
      lf.render(graph)

      const lane = lf.getNodeModelById('lane_1') as any
      const expandedWidth = lane.width
      const expandedHeight = lane.height
      lane.toggleCollapse(true)

      expect(lane[retainedAxis]).toBe(
        retainedAxis === 'width' ? expandedWidth : expandedHeight,
      )
      expect(lane[collapsedAxis]).toBe(lane.titleSize)
    },
  )

  test('collapses a Pool to a fixed DynamicGroup-style node from its top-left corner', () => {
    const lf = createPoolLF()
    lf.render(createPoolWithTwoLanes('horizontal'))

    const graphModel = (lf as any).graphModel
    const pool = lf.getNodeModelById('pool_1') as any
    const originalBounds = pool.getBounds()
    pool.toggleCollapse(true)

    expect(pool.width).toBe(120)
    expect(pool.height).toBe(80)
    expect(pool.getBounds().minX).toBe(originalBounds.minX)
    expect(pool.getBounds().minY).toBe(originalBounds.minY)

    const shape = createView(PoolView, pool, graphModel).getShape()
    const collapsedRect = getShapeChildren(shape)[0]
    expect(collapsedRect.props.width).toBe(120)
    expect(collapsedRect.props.height).toBe(80)
  })

  test('renders Pool and Lane title/content boxes with a divider', () => {
    const lf = createPoolLF()
    lf.render(createPoolWithTwoLanes('horizontal'))

    const graphModel = (lf as any).graphModel
    const pool = lf.getNodeModelById('pool_1') as any
    const lane = lf.getNodeModelById('lane_1') as any
    const poolShape = createView(PoolView, pool, graphModel).getShape()
    const laneShape = createView(LaneView, lane, graphModel).getShape()

    const poolChildren = getShapeChildren(poolShape)
    const laneChildren = getShapeChildren(laneShape)
    const poolDivider = poolChildren.find((child) => child?.type === 'line')
    const laneDivider = laneChildren.find((child) => child?.type === 'line')

    expect(poolChildren.filter((child) => child?.type === 'rect')).toHaveLength(
      2,
    )
    expect(poolChildren.filter((child) => child?.type === 'line')).toHaveLength(
      1,
    )
    expect(laneChildren.filter((child) => child?.type === 'rect')).toHaveLength(
      3,
    )
    expect(laneChildren.filter((child) => child?.type === 'line')).toHaveLength(
      1,
    )
    expect(poolDivider?.props?.['pointer-events']).toBe('none')
    expect(laneDivider?.props?.stroke).toBe(lane.getNodeStyle().stroke)
    expect(laneDivider?.props?.['stroke-width']).toBe(
      lane.getNodeStyle().strokeWidth,
    )
    expect(laneDivider?.props?.['pointer-events']).toBe('none')
    const laneOuterRectIndex = laneChildren.findIndex(
      (child) =>
        child?.type === 'rect' &&
        child?.props?.width === lane.width &&
        child?.props?.height === lane.height,
    )
    expect(laneChildren.indexOf(laneDivider)).toBeGreaterThan(
      laneOuterRectIndex,
    )
  })

  test('uses the lane model titleSize for text bounds and rendered title geometry', () => {
    const lf = createPoolLF()
    lf.render(createPoolWithTwoLanes('horizontal'))

    const graphModel = (lf as any).graphModel
    const lane = lf.getNodeModelById('lane_1') as any
    lane.titleSize = 24
    lane.updateTextPosition()
    const titleLayout = getTitleLayout(
      { x: lane.x, y: lane.y, width: lane.width, height: lane.height },
      lane.getResolvedTitlePosition(),
      lane.titleSize,
    )

    const laneShape = createView(LaneView, lane, graphModel).getShape()
    const laneChildren = getShapeChildren(laneShape)
    const titleRect = laneChildren.find(
      (child) =>
        child?.type === 'rect' &&
        child?.props?.width === titleLayout.titleBox.width &&
        child?.props?.height === titleLayout.titleBox.height,
    )

    expect(lane.getTextStyle()).toEqual(
      expect.objectContaining({
        textWidth:
          lane.getResolvedTitlePosition() === 'left' ||
          lane.getResolvedTitlePosition() === 'right'
            ? titleLayout.titleBox.height
            : titleLayout.titleBox.width,
        textHeight:
          lane.getResolvedTitlePosition() === 'left' ||
          lane.getResolvedTitlePosition() === 'right'
            ? titleLayout.titleBox.width
            : titleLayout.titleBox.height,
      }),
    )
    expect(lane.text).toEqual(
      expect.objectContaining({
        x: titleLayout.textAnchor.x,
        y: titleLayout.textAnchor.y,
      }),
    )
    expect(titleRect).toBeDefined()
  })

  test('renders lane drag feedback once in the top overlay', () => {
    const lf = createPoolLF()
    lf.render(createPoolWithTwoLanes('horizontal'))

    const pool = lf.getNodeModelById('pool_1') as any
    pool.laneDropIndicator = {
      laneId: 'lane_1',
      index: 1,
      x: 300,
      y: pool.y,
      width: 460,
      height: 180,
    }
    pool.isLaneDropTarget = true

    const shapes = getPoolLaneDragOverlayShapes((lf as any).graphModel)
    const indicator = shapes.filter(
      (shape) => shape.props?.className === 'lf-pool-lane-drop-indicator',
    )
    const dropTarget = shapes.find(
      (shape) => shape.type === 'rect' && !shape.props?.className,
    )

    expect(indicator).toHaveLength(1)
    expect(indicator[0].props).toEqual(
      expect.objectContaining({
        className: 'lf-pool-lane-drop-indicator',
        stroke: '#feb663',
        'stroke-width': 2,
        'stroke-dasharray': '4 4',
        width: expect.any(Number),
        height: expect.any(Number),
      }),
    )
    const injectedStyle = document.getElementById(POOL_STYLE_ID)
    expect(injectedStyle?.textContent).toContain('.lf-pool-lane-drop-indicator')
    expect(injectedStyle?.textContent).toContain('stroke: #feb663')
    expect(injectedStyle?.textContent).not.toContain('stroke: #2f80ed')
    expect(dropTarget?.props?.stroke).toBe('#feb663')
    expect(
      dropTarget?.props?.strokeDasharray ??
        dropTarget?.props?.['stroke-dasharray'],
    ).toBe('4 4')
  })

  test('updates the mounted top overlay when drag feedback changes', async () => {
    const lf = createPoolLF()
    lf.render(createPoolWithTwoLanes('horizontal'))

    const pool = lf.getNodeModelById('pool_1') as any
    pool.laneDropIndicator = {
      laneId: 'lane_1',
      index: 1,
      x: 300,
      y: pool.y,
      width: 460,
      height: 180,
    }
    pool.isLaneDropTarget = true
    await Promise.resolve()

    const indicator = lf.container.querySelector(
      '.lf-pool-lane-drag-overlay .lf-pool-lane-drop-indicator',
    ) as SVGRectElement

    expect(indicator).toBeTruthy()
    expect(indicator.style.stroke).toBe('#feb663')
    expect(indicator.style.strokeDasharray).toBe('4 4')
    expect(indicator.style.strokeWidth).toBe('2px')
  })

  test('uses the DynamicGroup addable outline when a Pool accepts a dragged Lane', () => {
    const lf = createPoolLF()
    lf.render(createPoolWithTwoLanes('horizontal'))

    const pool = lf.getNodeModelById('pool_1') as any
    pool.isLaneDropTarget = true
    const outline = getPoolLaneDragOverlayShapes((lf as any).graphModel).find(
      (shape) => shape.type === 'rect',
    )

    expect(outline?.props).toEqual(
      expect.objectContaining({
        stroke: '#feb663',
        width: pool.width + pool.getNodeStyle().strokeWidth + 8,
        height: pool.height + pool.getNodeStyle().strokeWidth + 8,
      }),
    )
  })

  test.each([
    ['left', 'horizontal'],
    ['right', 'horizontal'],
    ['top', 'vertical'],
    ['bottom', 'vertical'],
  ] as const)(
    'keeps %s pool title area outside of lane content',
    (titlePosition, direction) => {
      const graph = createPoolWithTwoLanes(direction) as any
      graph.nodes[0].properties = {
        ...graph.nodes[0].properties,
        titlePosition,
      }

      const lf = createPoolLF()
      lf.render(graph)

      const pool = lf.getNodeModelById('pool_1') as any
      const titleLayout = getTitleLayout(
        { x: pool.x, y: pool.y, width: pool.width, height: pool.height },
        titlePosition,
        pool.titleSize,
      )
      const contentMinX =
        titleLayout.contentBox.x - titleLayout.contentBox.width / 2
      const contentMaxX =
        titleLayout.contentBox.x + titleLayout.contentBox.width / 2
      const contentMinY =
        titleLayout.contentBox.y - titleLayout.contentBox.height / 2
      const contentMaxY =
        titleLayout.contentBox.y + titleLayout.contentBox.height / 2

      pool.getOrderedLanes().forEach((lane: any) => {
        const bounds = lane.getBounds()
        expect(bounds.minX).toBeGreaterThanOrEqual(contentMinX)
        expect(bounds.maxX).toBeLessThanOrEqual(contentMaxX)
        expect(bounds.minY).toBeGreaterThanOrEqual(contentMinY)
        expect(bounds.maxY).toBeLessThanOrEqual(contentMaxY)
      })
    },
  )

  test('uses the Pool content box for the top-layer insertion slot', () => {
    const lf = createPoolLF()
    lf.render(createPoolWithTwoLanes('horizontal'))

    const pool = lf.getNodeModelById('pool_1') as any
    const lane = lf.getNodeModelById('lane_1') as any
    pool.laneDropIndicator = {
      laneId: lane.id,
      index: 1,
      x: 300,
      y: pool.y,
      width: 460,
      height: lane.height,
    }

    const indicator = getPoolLaneDragOverlayShapes((lf as any).graphModel).find(
      (shape) => shape.props?.className === 'lf-pool-lane-drop-indicator',
    )

    expect(indicator?.props).toEqual(
      expect.objectContaining({
        width: expect.any(Number),
        height: expect.any(Number),
      }),
    )
  })
})
