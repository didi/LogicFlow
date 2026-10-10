/**
 * @jest-environment jsdom
 */
import { createPoolLF, createTwoPoolGraph } from './fixtures'

function createTwoPoolGraphWithCrossLaneEdge() {
  const graph = createTwoPoolGraph() as any
  const lane = graph.nodes.find((node: any) => node.id === 'lane_2')
  lane.children = ['rect_2']
  lane.properties.children = ['rect_2']
  graph.nodes.push({
    id: 'rect_2',
    type: 'rect',
    x: 530,
    y: 350,
    width: 80,
    height: 40,
    text: '泳道二节点',
    properties: { parent: 'lane_2' },
  })
  graph.edges.push({
    id: 'edge_1',
    type: 'polyline',
    sourceNodeId: 'rect_1',
    targetNodeId: 'rect_2',
    text: '跨泳道连线',
  })
  return graph
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('pool lane cross-pool movement', () => {
  test('uses the full selected Lane block as the in-pool insertion placeholder', () => {
    const lf = createPoolLF()
    lf.render(createTwoPoolGraph())

    const plugin = lf.extension.PoolElements as any
    const pool = lf.getNodeModelById('pool_1') as any
    const lane1 = lf.getNodeModelById('lane_1') as any
    const lane2 = lf.getNodeModelById('lane_2') as any

    plugin.setSelectionLaneDropIndicator(pool, [lane1, lane2], 0)

    expect(pool.laneDropIndicator).toEqual(
      expect.objectContaining({
        x: pool.x - pool.width / 2 + pool.titleSize,
        y: pool.y - pool.height / 2,
        width: pool.width - pool.titleSize,
        height: lane1.height + lane2.height,
      }),
    )
  })

  test('moves a selected lane into the pool under the selection drop position', () => {
    const lf = createPoolLF()
    lf.render(createTwoPoolGraph())

    const plugin = lf.extension.PoolElements as any
    const targetPool = lf.getNodeModelById('pool_2') as any
    const lane = lf.getNodeModelById('lane_1') as any
    lf.selectElementById(lane.id)
    plugin.onSelectionDragStart()

    lane.moveTo(targetPool.x, targetPool.y, true)
    expect(plugin.finalizeSelectionLaneMove()).toBe(true)

    expect(lane.properties.parent).toBe(targetPool.id)
    expect(targetPool.children.has(lane.id)).toBe(true)
    expect(Array.from(targetPool.children)).toEqual(['lane_3', lane.id])
  })

  test('moves selected lanes into a target pool as a contiguous block', () => {
    const lf = createPoolLF()
    lf.render(createTwoPoolGraph())

    const plugin = lf.extension.PoolElements as any
    const sourcePool = lf.getNodeModelById('pool_1') as any
    const targetPool = lf.getNodeModelById('pool_2') as any
    const firstLane = lf.getNodeModelById('lane_1') as any
    const thirdLane = sourcePool.addChildBelow(firstLane.getData()) as any
    lf.selectElementById(firstLane.id)
    lf.selectElementById(thirdLane.id, true)
    plugin.onSelectionDragStart()

    firstLane.moveTo(targetPool.x, targetPool.y, true)
    thirdLane.moveTo(targetPool.x, targetPool.y, true)
    expect(plugin.finalizeSelectionLaneMove()).toBe(true)

    expect(Array.from(targetPool.children)).toEqual([
      'lane_3',
      firstLane.id,
      thirdLane.id,
    ])
    expect(Array.from(sourcePool.children)).toEqual(['lane_2'])
  })

  test('moves selected lanes from multiple source pools without pushing children out of lanes', () => {
    const lf = createPoolLF({ minLaneCount: 0 })
    const graph = createTwoPoolGraph() as any
    graph.nodes.push(
      {
        id: 'pool_3',
        type: 'pool',
        x: 1300,
        y: 260,
        text: '第二来源泳池',
        properties: {
          direction: 'horizontal',
          width: 520,
          height: 180,
          children: ['lane_4'],
        },
        children: ['lane_4'],
      },
      {
        id: 'lane_4',
        type: 'lane',
        x: 1330,
        y: 260,
        width: 480,
        height: 180,
        text: '第二来源泳道',
        properties: {
          parent: 'pool_3',
          direction: 'horizontal',
          isHorizontal: true,
          children: ['rect_3'],
        },
        children: ['rect_3'],
      },
      {
        id: 'rect_3',
        type: 'rect',
        x: 1330,
        y: 260,
        width: 80,
        height: 40,
        text: '第二来源节点',
        properties: { parent: 'lane_4' },
      },
    )
    lf.render(graph)

    const plugin = lf.extension.PoolElements as any
    const targetPool = lf.getNodeModelById('pool_2') as any
    const firstLane = lf.getNodeModelById('lane_1') as any
    const fourthLane = lf.getNodeModelById('lane_4') as any
    const rectOne = lf.getNodeModelById('rect_1') as any
    const rectThree = lf.getNodeModelById('rect_3') as any
    lf.selectElementById(firstLane.id)
    lf.selectElementById(fourthLane.id, true)
    plugin.onSelectionDragStart()

    firstLane.moveTo(targetPool.x, targetPool.y, true)
    fourthLane.moveTo(targetPool.x, targetPool.y, true)

    expect(plugin.finalizeSelectionLaneMove()).toBe(true)
    ;[
      [firstLane, rectOne],
      [fourthLane, rectThree],
    ].forEach(([lane, rect]) => {
      const laneBounds = lane.getBounds()
      const rectBounds = rect.getBounds()
      expect(rectBounds.minX).toBeGreaterThanOrEqual(laneBounds.minX)
      expect(rectBounds.maxX).toBeLessThanOrEqual(laneBounds.maxX)
      expect(rectBounds.minY).toBeGreaterThanOrEqual(laneBounds.minY)
      expect(rectBounds.maxY).toBeLessThanOrEqual(laneBounds.maxY)
    })
  })

  test('returns a lane to its source pool when mixed with a selected pool', () => {
    const lf = createPoolLF({ minLaneCount: 0 })
    lf.render(createTwoPoolGraph())

    const plugin = lf.extension.PoolElements as any
    const sourcePool = lf.getNodeModelById('pool_1') as any
    const selectedPool = lf.getNodeModelById('pool_2') as any
    const lane = lf.getNodeModelById('lane_1') as any
    const child = lf.getNodeModelById('rect_1') as any
    const originalLanePosition = { x: lane.x, y: lane.y }
    const originalChildOffset = {
      dx: child.x - lane.x,
      dy: child.y - lane.y,
    }

    lf.selectElementById(selectedPool.id)
    lf.selectElementById(lane.id, true)
    plugin.onSelectionDragStart()

    lane.moveTo(1100, 600, true)
    expect(plugin.finalizeSelectionLaneMove()).toBe(false)

    expect(lane.properties.parent).toBe(sourcePool.id)
    expect(lane.x).toBe(originalLanePosition.x)
    expect(lane.y).toBe(originalLanePosition.y)
    expect(child.x - lane.x).toBe(originalChildOffset.dx)
    expect(child.y - lane.y).toBe(originalChildOffset.dy)
  })

  test('reorders selected lanes as a block against their original slots', () => {
    const lf = createPoolLF()
    lf.render(createTwoPoolGraph())

    const plugin = lf.extension.PoolElements as any
    const sourcePool = lf.getNodeModelById('pool_1') as any
    const firstLane = lf.getNodeModelById('lane_1') as any
    const secondLane = lf.getNodeModelById('lane_2') as any
    const thirdLane = sourcePool.addChildBelow(secondLane.getData()) as any
    lf.selectElementById(secondLane.id)
    lf.selectElementById(thirdLane.id, true)
    plugin.onSelectionDragStart()

    secondLane.moveTo(secondLane.x, firstLane.y, true)
    thirdLane.moveTo(thirdLane.x, firstLane.y, true)

    expect(plugin.finalizeSelectionLaneMove()).toBe(true)
    expect(Array.from(sourcePool.children)).toEqual([
      secondLane.id,
      thirdLane.id,
      firstLane.id,
    ])
  })

  test('moves a lane and its children into another pool', () => {
    const lf = createPoolLF()
    lf.render(createTwoPoolGraph())

    const plugin = lf.extension.PoolElements as any
    const sourcePool = lf.getNodeModelById('pool_1') as any
    const targetPool = lf.getNodeModelById('pool_2') as any
    const lane = lf.getNodeModelById('lane_1') as any
    const rect = lf.getNodeModelById('rect_1') as any
    const beforeDx = rect.x - lane.x
    const beforeDy = rect.y - lane.y

    expect(plugin.moveLaneToPool('lane_1', 'pool_2', 1)).toBe(true)

    expect(sourcePool.children.has('lane_1')).toBe(false)
    expect(Array.from(targetPool.children)).toEqual(['lane_3', 'lane_1'])
    expect(lane.properties.parent).toBe('pool_2')
    expect(rect.properties.parent).toBe('lane_1')
    expect(rect.x - lane.x).toBe(beforeDx)
    expect(rect.y - lane.y).toBe(beforeDy)
    expect(plugin.getLaneByNodeId('lane_1')?.id).toBe('pool_2')
    expect(plugin.getLaneByNodeId('rect_1')?.id).toBe('lane_1')
  })

  test('rejects lane migration that would violate source minLaneCount', () => {
    const lf = createPoolLF({ minLaneCount: 2 })
    lf.render(createTwoPoolGraph())

    const plugin = lf.extension.PoolElements as any
    const sourcePool = lf.getNodeModelById('pool_1') as any

    expect(plugin.moveLaneToPool('lane_1', 'pool_2', 1)).toBe(false)
    expect(Array.from(sourcePool.children)).toEqual(['lane_1', 'lane_2'])
  })

  test('removes an emptied source pool when minLaneCount allows zero lanes', () => {
    const lf = createPoolLF({ minLaneCount: 0 })
    lf.render(createTwoPoolGraph())

    const plugin = lf.extension.PoolElements as any
    const sourcePool = lf.getNodeModelById('pool_1') as any

    expect(sourcePool.deleteChild('lane_2')).toBe(true)
    expect(plugin.moveLaneToPool('lane_1', 'pool_2', 1)).toBe(true)

    expect(lf.getNodeModelById('pool_1')).toBeUndefined()
    expect(lf.getNodeModelById('lane_1')?.properties.parent).toBe('pool_2')
  })

  test('finds target pool by bounds and emits not-allowed for invalid lane moves', () => {
    const lf = createPoolLF({ minLaneCount: 2 })
    lf.render(createTwoPoolGraph())

    const plugin = lf.extension.PoolElements as any
    const lane = lf.getNodeModelById('lane_1') as any
    const onNotAllowed = jest.fn()
    lf.on('lane:not-allowed', onNotAllowed)

    expect(plugin.getPoolByBounds(lane.getBounds(), lane.getData())?.id).toBe(
      'pool_1',
    )
    expect(plugin.moveLaneToPool('lane_1', 'pool_2', 1)).toBe(false)
    expect(onNotAllowed).toHaveBeenCalledWith(
      expect.objectContaining({
        reason: 'source-min-lane-count',
      }),
    )
  })

  test('shows lane drop feedback for forbidden and allowed targets', () => {
    const lf = createPoolLF()
    lf.render(createTwoPoolGraph())

    const plugin = lf.extension.PoolElements as any
    const targetPool = lf.getNodeModelById('pool_2') as any

    plugin.updateLaneDragPreview('lane_1', { x: 20, y: 20 })

    expect(
      lf.container.classList.contains('lf-pool-lane-drag-not-allowed'),
    ).toBe(true)

    plugin.updateLaneDragPreview('lane_1', {
      x: targetPool.x,
      y: targetPool.y,
    })

    expect(lf.container.classList.contains('lf-pool-lane-drag-allowed')).toBe(
      true,
    )
    expect(targetPool.isLaneDropTarget).toBe(true)
    expect(targetPool.laneDropIndicator).toBeDefined()
  })

  test('keeps a cross-lane edge title on its final path after moving a lane between pools', () => {
    const lf = createPoolLF()
    lf.render(createTwoPoolGraphWithCrossLaneEdge())

    const plugin = lf.extension.PoolElements as any
    const edge = lf.getEdgeModelById('edge_1') as any

    expect(plugin.moveLaneToPool('lane_1', 'pool_2', 1)).toBe(true)
    expect(edge.text).toEqual(expect.objectContaining(edge.textPosition))

    expect(plugin.moveLaneToPool('lane_1', 'pool_1', 0)).toBe(true)
    expect(edge.text).toEqual(expect.objectContaining(edge.textPosition))
  })

  test('preserves a custom cross-lane edge title offset after moving a lane between pools', () => {
    const lf = createPoolLF()
    lf.render(createTwoPoolGraphWithCrossLaneEdge())

    const plugin = lf.extension.PoolElements as any
    const edge = lf.getEdgeModelById('edge_1') as any
    edge.moveText(30, -20)
    const beforeOffset = {
      x: edge.text.x - edge.textPosition.x,
      y: edge.text.y - edge.textPosition.y,
    }

    expect(plugin.moveLaneToPool('lane_1', 'pool_2', 1)).toBe(true)

    expect(edge.text.x - edge.textPosition.x).toBe(beforeOffset.x)
    expect(edge.text.y - edge.textPosition.y).toBe(beforeOffset.y)
  })
})
