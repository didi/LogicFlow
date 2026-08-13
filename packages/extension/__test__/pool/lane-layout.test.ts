/**
 * @jest-environment jsdom
 */
import {
  createPoolLF,
  createPoolGraphWithNodeInLane,
  createPoolWithTwoLanes,
} from './fixtures'
import { getTitleLayout } from '../../src/pool/utils'

function createPoolGraphWithInternalEdge() {
  const graph = createPoolGraphWithNodeInLane() as any
  const lane = graph.nodes.find((node: any) => node.id === 'lane_1')
  lane.children.push('rect_2')
  lane.properties.children.push('rect_2')
  graph.nodes.push({
    id: 'rect_2',
    type: 'rect',
    x: 620,
    y: 170,
    width: 80,
    height: 40,
    text: '普通节点2',
    properties: { parent: 'lane_1' },
  })
  graph.edges.push({
    id: 'edge_1',
    type: 'polyline',
    sourceNodeId: 'rect_1',
    targetNodeId: 'rect_2',
    text: { value: '内部连线', x: 575, y: 170 },
  })
  return graph
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('pool ordered lane layout', () => {
  test('reorders horizontal lanes by insert index and moves lane children once', () => {
    const lf = createPoolLF()
    lf.render(createPoolGraphWithNodeInLane())

    const pool = lf.getNodeModelById('pool_1') as any
    const lane1 = lf.getNodeModelById('lane_1') as any
    const rect = lf.getNodeModelById('rect_1') as any
    const beforeDy = rect.y - lane1.y

    expect(pool.reorderLane('lane_1', 2)).toBe(true)

    expect(Array.from(pool.children)).toEqual(['lane_2', 'lane_1'])
    expect(rect.y - lane1.y).toBe(beforeDy)
    expect(pool.getOrderedLanes().map((lane: any) => lane.id)).toEqual([
      'lane_2',
      'lane_1',
    ])
  })

  test('returns false when reorder does not change order', () => {
    const lf = createPoolLF()
    lf.render(createPoolWithTwoLanes('horizontal'))

    const pool = lf.getNodeModelById('pool_1') as any

    expect(pool.reorderLane('lane_1', 0)).toBe(false)
    expect(Array.from(pool.children)).toEqual(['lane_1', 'lane_2'])
  })

  test('dragging a lane only carries its own children, not the parent pool', () => {
    const lf = createPoolLF()
    lf.render(createPoolGraphWithNodeInLane())

    const lane = lf.getNodeModelById('lane_1') as any
    lane.isDragging = true

    expect(lane.getNodesInGroup(lane)).toEqual(['rect_1'])
  })

  test('dropping a dragged lane reorders lanes and removes overlap', () => {
    const lf = createPoolLF()
    lf.render(createPoolGraphWithNodeInLane())

    const plugin = lf.extension.PoolElements as any
    const pool = lf.getNodeModelById('pool_1') as any
    const lane1 = lf.getNodeModelById('lane_1') as any
    const lane2 = lf.getNodeModelById('lane_2') as any
    const rect = lf.getNodeModelById('rect_1') as any
    const beforeDx = rect.x - lane1.x
    const beforeDy = rect.y - lane1.y

    pool.moveLane(lane1, lane2.x, lane2.y + lane2.height / 2)
    plugin.onNodeDrop({ data: lane1.getData() })

    expect(Array.from(pool.children)).toEqual(['lane_2', 'lane_1'])
    expect(lane1.y - lane2.y).toBe((lane1.height + lane2.height) / 2)
    expect(rect.x - lane1.x).toBe(beforeDx)
    expect(rect.y - lane1.y).toBe(beforeDy)
  })

  test('previews a lower slot as soon as the pointer enters it', () => {
    const lf = createPoolLF()
    lf.render(createPoolGraphWithNodeInLane())

    const plugin = lf.extension.PoolElements as any
    const pool = lf.getNodeModelById('pool_1') as any
    const lane2 = lf.getNodeModelById('lane_2') as any

    plugin.updateLaneDragPreview('lane_1', { x: lane2.x, y: lane2.y })

    expect(plugin.laneDragState.insertIndex).toBe(2)
    expect(pool.laneDropIndicator).toEqual(
      expect.objectContaining({ laneId: 'lane_1', index: 2 }),
    )
    expect(lane2.y).toBe(pool.y - pool.height / 2 + lane2.height / 2)
  })

  test('keeps the same preview while the pointer remains in a fixed slot', () => {
    const lf = createPoolLF()
    lf.render(createPoolWithTwoLanes('horizontal'))

    const plugin = lf.extension.PoolElements as any
    const lane2 = lf.getNodeModelById('lane_2') as any
    const pointer = { x: lane2.x, y: lane2.y }

    plugin.updateLaneDragPreview('lane_1', pointer)
    plugin.updateLaneDragPreview('lane_1', pointer)

    expect(plugin.laneDragState.insertIndex).toBe(2)
  })

  test('keeps an upward reorder before the target while the pointer moves within its slot', () => {
    const lf = createPoolLF()
    lf.render(createPoolWithTwoLanes('horizontal'))

    const plugin = lf.extension.PoolElements as any
    const lane1 = lf.getNodeModelById('lane_1') as any
    const targetSlot = { x: lane1.x, y: lane1.y }

    plugin.updateLaneDragPreview('lane_2', targetSlot)
    plugin.updateLaneDragPreview('lane_2', {
      x: targetSlot.x,
      y: targetSlot.y + lane1.height / 4,
    })

    expect(plugin.laneDragState.insertIndex).toBe(0)
  })

  test('raises a dragged lane above the other lanes', () => {
    const lf = createPoolLF()
    lf.render(createPoolWithTwoLanes('horizontal'))

    const plugin = lf.extension.PoolElements as any
    const lane1 = lf.getNodeModelById('lane_1') as any
    const lane2 = lf.getNodeModelById('lane_2') as any

    plugin.updateLaneDragPreview('lane_1', { x: lane2.x, y: lane2.y })

    expect(lane1.zIndex).toBeGreaterThan(lane2.zIndex)
  })

  test('raises and restores the children of a dragged lane', () => {
    const lf = createPoolLF()
    lf.render(createPoolGraphWithInternalEdge())

    const plugin = lf.extension.PoolElements as any
    const lane1 = lf.getNodeModelById('lane_1') as any
    const lane2 = lf.getNodeModelById('lane_2') as any
    const rect = lf.getNodeModelById('rect_1') as any
    const edge = lf.getEdgeModelById('edge_1') as any
    const originalZIndex = rect.zIndex
    const originalEdgeZIndex = edge.zIndex

    plugin.updateLaneDragPreview('lane_1', { x: lane2.x, y: lane2.y })

    expect(rect.zIndex).toBeGreaterThan(lane1.zIndex)
    expect(rect.zIndex).toBeGreaterThan(originalZIndex)
    expect(edge.zIndex).toBeGreaterThan(lane1.zIndex)
    expect(rect.zIndex).toBeGreaterThan(edge.zIndex)

    plugin.onNodeDrop({ data: lane1.getData() })

    expect(rect.zIndex).toBe(originalZIndex)
    expect(edge.zIndex).toBe(originalEdgeZIndex)
  })

  test('raises a selected lane and its children while keeping children visible', () => {
    const lf = createPoolLF()
    lf.render(createPoolGraphWithInternalEdge())

    const plugin = lf.extension.PoolElements as any
    const lane1 = lf.getNodeModelById('lane_1') as any
    const lane2 = lf.getNodeModelById('lane_2') as any
    const rect = lf.getNodeModelById('rect_1') as any
    const edge = lf.getEdgeModelById('edge_1') as any

    plugin.onNodeSelect({
      data: lane1.getData(),
      isMultiple: false,
      isSelected: true,
    })

    expect(lane1.zIndex).toBeGreaterThan(lane2.zIndex)
    expect(edge.zIndex).toBeGreaterThan(lane1.zIndex)
    expect(rect.zIndex).toBeGreaterThan(edge.zIndex)
  })

  test('keeps a node visible when it is appended into a raised lane', () => {
    const lf = createPoolLF()
    const graph = createPoolGraphWithNodeInLane() as any
    graph.nodes.push({
      id: 'rect_late',
      type: 'rect',
      x: 530,
      y: 170,
      width: 80,
      height: 40,
      text: '后拖入节点',
      properties: {},
    })
    lf.render(graph)

    const plugin = lf.extension.PoolElements as any
    const lane1 = lf.getNodeModelById('lane_1') as any
    const lateNode = lf.getNodeModelById('rect_late') as any

    plugin.onNodeSelect({
      data: lane1.getData(),
      isMultiple: false,
      isSelected: true,
    })
    expect(lateNode.zIndex).toBeLessThan(lane1.zIndex)

    plugin.addNodeToGroup(lateNode.getData())

    expect(Array.from(lane1.children)).toContain('rect_late')
    expect(lateNode.zIndex).toBeGreaterThan(lane1.zIndex)
  })

  test('uses the pointer-entered slot for vertical pool previews', () => {
    const lf = createPoolLF()
    lf.render(createPoolWithTwoLanes('vertical'))

    const plugin = lf.extension.PoolElements as any
    const pool = lf.getNodeModelById('pool_1') as any
    const lane2 = lf.getNodeModelById('lane_2') as any

    plugin.updateLaneDragPreview('lane_1', { x: lane2.x, y: lane2.y })

    expect(plugin.laneDragState.insertIndex).toBe(2)
    expect(pool.laneDropIndicator).toEqual(
      expect.objectContaining({ laneId: 'lane_1', index: 2 }),
    )
    expect(lane2.x).toBe(pool.x - pool.width / 2 + lane2.width / 2)
  })

  test('clears the temporary slot preview after lane drop', () => {
    const lf = createPoolLF()
    lf.render(createPoolWithTwoLanes('horizontal'))

    const plugin = lf.extension.PoolElements as any
    const pool = lf.getNodeModelById('pool_1') as any
    const lane1 = lf.getNodeModelById('lane_1') as any
    const lane2 = lf.getNodeModelById('lane_2') as any

    plugin.updateLaneDragPreview('lane_1', { x: lane2.x, y: lane2.y })
    plugin.onNodeDrop({ data: lane1.getData() })

    expect(plugin.laneDragState).toBeUndefined()
    expect(pool.laneDropIndicator).toBeUndefined()
  })

  test('keeps all source lanes when a dragged lane is dropped outside a pool', () => {
    jest.useFakeTimers()
    const lf = createPoolLF()
    lf.render(createPoolGraphWithInternalEdge())

    const plugin = lf.extension.PoolElements as any
    const pool = lf.getNodeModelById('pool_1') as any
    const lane1 = lf.getNodeModelById('lane_1') as any
    const edge = lf.getEdgeModelById('edge_1') as any
    const originalHeight = pool.height
    const originalY = lane1.y
    const originalEdgeText = { ...edge.text }

    plugin.updateLaneDragPreview('lane_1', { x: lane1.x, y: lane1.y })
    pool.moveLane(lane1, lane1.x, pool.y - pool.height)
    edge.moveText(0, -pool.height)
    plugin.updateLaneDragPreview('lane_1', { x: 20, y: 20 })
    plugin.onNodeAddOrDrop({ data: lane1.getData() })
    plugin.onNodeDrop({ data: lane1.getData() })

    expect(Array.from(pool.children)).toEqual(['lane_1', 'lane_2'])
    expect(pool.height).toBe(originalHeight)
    expect(lane1.isLaneReturning).toBe(true)

    jest.advanceTimersByTime(20)
    expect(lane1.y).toBe(originalY)
    expect(edge.text).toEqual(originalEdgeText)

    jest.advanceTimersByTime(160)
    expect(lane1.isLaneReturning).toBe(false)
    jest.useRealTimers()
  })

  test('restores selected lane child positions when selected lanes are dropped outside a pool', () => {
    const lf = createPoolLF()
    lf.render(createPoolGraphWithNodeInLane())

    const plugin = lf.extension.PoolElements as any
    const lane1 = lf.getNodeModelById('lane_1') as any
    const rect = lf.getNodeModelById('rect_1') as any
    const beforeDx = rect.x - lane1.x
    const beforeDy = rect.y - lane1.y

    lf.graphModel.selectElementById('lane_1')
    lf.graphModel.selectElementById('lane_2', true)
    plugin.onSelectionDragStart()
    lf.graphModel.moveNode2Coordinate('rect_1', rect.x + 40, rect.y + 30)
    jest.spyOn(lf.graphModel, 'getPointByClient').mockReturnValue({
      canvasOverlayPosition: { x: 20, y: 20 },
    } as any)

    expect(
      plugin.finalizeSelectionLaneMove({ clientX: 0, clientY: 0 } as any),
    ).toBe(false)

    expect(rect.x - lane1.x).toBe(beforeDx)
    expect(rect.y - lane1.y).toBe(beforeDy)
  })

  test('computes vertical insert index from x coordinate', () => {
    const lf = createPoolLF()
    lf.render(createPoolWithTwoLanes('vertical'))

    const pool = lf.getNodeModelById('pool_1') as any
    const lane2 = lf.getNodeModelById('lane_2') as any

    expect(
      pool.getLaneInsertIndex({ x: lane2.x + lane2.width, y: lane2.y }),
    ).toBe(2)
  })

  test('uses resized horizontal lane width as the shared lane width', () => {
    const lf = createPoolLF()
    lf.render(createPoolWithTwoLanes('horizontal'))

    const pool = lf.getNodeModelById('pool_1') as any
    const lane1 = lf.getNodeModelById('lane_1') as any
    const lane2 = lf.getNodeModelById('lane_2') as any
    const nextWidth = lane2.width - 80

    lane1.width = nextWidth
    pool.layoutLanesByOrder({
      reason: 'resize',
      resizedLaneId: 'lane_1',
      resizedAxis: 'width',
    })

    expect(lane1.width).toBe(nextWidth)
    expect(lane2.width).toBe(nextWidth)
    expect(pool.width).toBe(nextWidth + pool.titleSize)
  })

  test('uses resized vertical lane height as the shared lane height', () => {
    const lf = createPoolLF()
    lf.render(createPoolWithTwoLanes('vertical'))

    const pool = lf.getNodeModelById('pool_1') as any
    const lane1 = lf.getNodeModelById('lane_1') as any
    const lane2 = lf.getNodeModelById('lane_2') as any
    const nextHeight = lane2.height - 80

    lane1.height = nextHeight
    pool.layoutLanesByOrder({
      reason: 'resize',
      resizedLaneId: 'lane_1',
      resizedAxis: 'height',
    })

    expect(lane1.height).toBe(nextHeight)
    expect(lane2.height).toBe(nextHeight)
    expect(pool.height).toBe(nextHeight + pool.titleSize)
  })

  test('places lane drop indicators from the content box insertion boundary', () => {
    const cases = [
      { direction: 'horizontal' as const, titlePosition: 'top' as const },
      { direction: 'horizontal' as const, titlePosition: 'bottom' as const },
      { direction: 'vertical' as const, titlePosition: 'left' as const },
      { direction: 'vertical' as const, titlePosition: 'right' as const },
    ]

    cases.forEach(({ direction, titlePosition }) => {
      const lf = createPoolLF()
      const graph = createPoolWithTwoLanes(direction)
      graph.nodes[0].properties = {
        ...graph.nodes[0].properties,
        titlePosition,
      }
      lf.render(graph)

      const plugin = lf.extension.PoolElements as any
      const pool = lf.getNodeModelById('pool_1') as any
      const lane1 = lf.getNodeModelById('lane_1') as any

      plugin.setLaneDropIndicator(pool, 'lane_2', 2)

      const titleLayout = getTitleLayout(
        { x: pool.x, y: pool.y, width: pool.width, height: pool.height },
        pool.getResolvedTitlePosition(),
        pool.titleSize,
      )

      expect(pool.laneDropIndicator).toEqual(
        expect.objectContaining({
          laneId: 'lane_2',
          index: 2,
          ...(pool.isHorizontal
            ? {
                x: titleLayout.contentBox.x - titleLayout.contentBox.width / 2,
                y:
                  titleLayout.contentBox.y -
                  titleLayout.contentBox.height / 2 +
                  lane1.height,
                width: titleLayout.contentBox.width,
                height: lane1.height,
              }
            : {
                x:
                  titleLayout.contentBox.x -
                  titleLayout.contentBox.width / 2 +
                  lane1.width,
                y: titleLayout.contentBox.y - titleLayout.contentBox.height / 2,
                width: lane1.width,
                height: titleLayout.contentBox.height,
              }),
        }),
      )
    })
  })

  test('previews lane sorting from the content box instead of the Pool outer bounds', () => {
    const cases = [
      { direction: 'horizontal' as const, titlePosition: 'top' as const },
      { direction: 'vertical' as const, titlePosition: 'left' as const },
    ]

    cases.forEach(({ direction, titlePosition }) => {
      const lf = createPoolLF()
      const graph = createPoolWithTwoLanes(direction)
      graph.nodes[0].properties = {
        ...graph.nodes[0].properties,
        titlePosition,
      }
      lf.render(graph)

      const plugin = lf.extension.PoolElements as any
      const pool = lf.getNodeModelById('pool_1') as any
      const lane2 = lf.getNodeModelById('lane_2') as any
      const titleLayout = getTitleLayout(
        { x: pool.x, y: pool.y, width: pool.width, height: pool.height },
        titlePosition,
        pool.titleSize,
      )

      plugin.previewLaneOrder(pool, 'lane_1', 2)

      if (pool.isHorizontal) {
        expect(lane2.y).toBe(
          titleLayout.contentBox.y -
            titleLayout.contentBox.height / 2 +
            lane2.height / 2,
        )
      } else {
        expect(lane2.x).toBe(
          titleLayout.contentBox.x -
            titleLayout.contentBox.width / 2 +
            lane2.width / 2,
        )
      }
    })
  })
})
