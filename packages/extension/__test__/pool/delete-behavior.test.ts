/**
 * @jest-environment jsdom
 */
import {
  createPoolGraphWithNodeInLane,
  createPoolLF,
  createPoolWithTwoLanes,
} from './fixtures'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('pool lane deletion policy', () => {
  test('relayouts the parent pool when a lane is deleted directly', () => {
    const lf = createPoolLF()
    lf.render(createPoolWithTwoLanes('horizontal'))

    const pool = lf.getNodeModelById('pool_1') as any
    const lane1 = lf.getNodeModelById('lane_1') as any

    lf.deleteNode('lane_2')

    expect(Array.from(pool.children)).toEqual(['lane_1'])
    expect(pool.height).toBe(lane1.height)
  })

  test('deletes lane children by default', () => {
    const lf = createPoolLF()
    lf.render(createPoolGraphWithNodeInLane())

    const pool = lf.getNodeModelById('pool_1') as any
    const lane = lf.getNodeModelById('lane_1') as any

    expect(lane.children.has('rect_1')).toBe(true)

    const deleted = pool.deleteChild('lane_1')

    expect(deleted).toBe(true)
    expect(lf.getNodeModelById('lane_1')).toBeUndefined()
    expect(lf.getNodeModelById('rect_1')).toBeUndefined()
  })

  test('releases lane children when cascadeDeleteChildren is false', () => {
    const lf = createPoolLF({ cascadeDeleteChildren: false })
    lf.render(createPoolGraphWithNodeInLane())

    const pool = lf.getNodeModelById('pool_1') as any
    const rect = lf.getNodeModelById('rect_1') as any

    const deleted = pool.deleteChild('lane_1')

    expect(deleted).toBe(true)
    expect(lf.getNodeModelById('lane_1')).toBeUndefined()
    expect(lf.getNodeModelById('rect_1')).toBeDefined()
    expect(rect.properties.parent).toBeUndefined()
    expect(
      (lf.extension.PoolElements as any).getLaneByNodeId('rect_1'),
    ).toBeUndefined()
  })

  test('keeps child edges when deleting a collapsed lane without cascading', () => {
    const lf = createPoolLF({ cascadeDeleteChildren: false })
    const graph = createPoolGraphWithNodeInLane()
    graph.nodes.push({
      id: 'rect_2',
      type: 'rect',
      x: 800,
      y: 170,
      width: 80,
      height: 40,
      text: '泳池外节点',
    })
    graph.edges.push({
      id: 'edge_1',
      type: 'polyline',
      sourceNodeId: 'rect_1',
      targetNodeId: 'rect_2',
    })
    lf.render(graph)

    const pool = lf.getNodeModelById('pool_1') as any
    const lane = lf.getNodeModelById('lane_1') as any
    lane.toggleCollapse(true)

    expect(pool.deleteChild('lane_1')).toBe(true)
    expect(lf.getNodeModelById('rect_1')).toBeDefined()
    expect(lf.getEdgeModelById('edge_1')).toBeDefined()
  })

  test('deleting a pool with cascadeDeleteChildren false removes lanes but releases lane children', () => {
    const lf = createPoolLF({ cascadeDeleteChildren: false })
    lf.render(createPoolGraphWithNodeInLane())

    const rect = lf.getNodeModelById('rect_1') as any
    const plugin = lf.extension.PoolElements as any

    expect(lf.deleteNode('pool_1')).toBe(true)
    expect(lf.getNodeModelById('pool_1')).toBeUndefined()
    expect(lf.getNodeModelById('lane_1')).toBeUndefined()
    expect(lf.getNodeModelById('lane_2')).toBeUndefined()
    expect(rect).toBeDefined()
    expect(rect.properties.parent).toBeUndefined()
    expect(plugin.getLaneByNodeId('lane_1')).toBeUndefined()
    expect(plugin.getLaneByNodeId('rect_1')).toBeUndefined()
  })

  test('honors plugin minLaneCount and pool override', () => {
    const lf = createPoolLF({ minLaneCount: 2 })
    lf.render(createPoolGraphWithNodeInLane())

    const pool = lf.getNodeModelById('pool_1') as any

    expect(pool.deleteChild('lane_1')).toBe(false)
    expect(lf.getNodeModelById('lane_1')).toBeDefined()

    pool.setProperties({
      ...pool.properties,
      minLaneCount: 1,
    })

    expect(pool.deleteChild('lane_1')).toBe(true)
    expect(lf.getNodeModelById('lane_1')).toBeUndefined()
  })

  test('blocks direct lane deletion when it violates minLaneCount', () => {
    const lf = createPoolLF({ minLaneCount: 2 })
    lf.render(createPoolGraphWithNodeInLane())

    expect(lf.deleteNode('lane_1')).toBe(false)
    expect(lf.getNodeModelById('lane_1')).toBeDefined()
  })
})
