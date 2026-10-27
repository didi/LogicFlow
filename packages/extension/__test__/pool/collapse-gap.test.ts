/**
 * @jest-environment jsdom
 */
import {
  createPoolGraphWithNodeInLane,
  createPoolLF,
  createPoolWithTwoLanes,
} from './fixtures'
import { laneConfig } from '../../src/pool/constant'

function createCrossLaneEdgeGraph() {
  const graph = createPoolGraphWithNodeInLane() as any
  const lane2 = graph.nodes.find((node: any) => node.id === 'lane_2')
  lane2.children = ['rect_2']
  lane2.properties = {
    ...lane2.properties,
    children: ['rect_2'],
  }
  graph.nodes.push({
    id: 'rect_2',
    type: 'rect',
    x: 530,
    y: 350,
    width: 80,
    height: 40,
    text: '第二泳道节点',
    properties: { parent: 'lane_2' },
  })
  graph.edges.push({
    id: 'edge_1',
    type: 'polyline',
    sourceNodeId: 'rect_1',
    targetNodeId: 'rect_2',
  })
  return graph
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('pool collapsed lane gap layout', () => {
  test('adds the collapsed lane gap into bounds, pool size, and lane slots', () => {
    const lf = createPoolLF()
    lf.render(createPoolWithTwoLanes('horizontal'))

    const plugin = lf.extension.PoolElements as any
    const pool = lf.getNodeModelById('pool_1') as any
    const firstLane = lf.getNodeModelById('lane_1') as any
    const secondLane = lf.getNodeModelById('lane_2') as any

    firstLane.toggleCollapse(true)

    expect(secondLane.getBounds().minY - firstLane.getBounds().maxY).toBe(
      laneConfig.collapsedLaneGap,
    )
    expect(pool.height).toBe(
      firstLane.height + secondLane.height + laneConfig.collapsedLaneGap,
    )

    const slotBounds = plugin.getLaneSlotBounds(pool)
    expect(slotBounds[1].minY - slotBounds[0].maxY).toBe(
      laneConfig.collapsedLaneGap,
    )
  })

  test('counts the shared collapsed boundary once and keeps virtual edge endpoints separated by the gap', () => {
    const lf = createPoolLF()
    lf.render(createCrossLaneEdgeGraph())

    const pool = lf.getNodeModelById('pool_1') as any
    const firstLane = lf.getNodeModelById('lane_1') as any
    const secondLane = lf.getNodeModelById('lane_2') as any

    firstLane.toggleCollapse(true)
    secondLane.toggleCollapse(true)

    const virtualEdge = lf.graphModel.edges.find(
      (candidate: any) => candidate.virtual && candidate.isCollapsedEdge,
    ) as any

    expect(secondLane.getBounds().minY - firstLane.getBounds().maxY).toBe(
      laneConfig.collapsedLaneGap,
    )
    expect(pool.height).toBe(
      firstLane.height + secondLane.height + laneConfig.collapsedLaneGap,
    )
    const firstLaneBounds = firstLane.getBounds()
    const secondLaneBounds = secondLane.getBounds()
    expect(virtualEdge.startPoint.x).toBeGreaterThanOrEqual(
      firstLaneBounds.minX,
    )
    expect(virtualEdge.startPoint.x).toBeLessThanOrEqual(firstLaneBounds.maxX)
    expect(virtualEdge.endPoint.x).toBeGreaterThanOrEqual(secondLaneBounds.minX)
    expect(virtualEdge.endPoint.x).toBeLessThanOrEqual(secondLaneBounds.maxX)
  })
})
