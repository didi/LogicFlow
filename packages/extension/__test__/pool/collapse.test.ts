/**
 * @jest-environment jsdom
 */
import {
  createPoolLF,
  createPoolGraphWithNodeInLane,
  createPoolWithTwoLanes,
} from './fixtures'
import { laneConfig } from '../../src/pool/constant'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('pool lane collapse', () => {
  test('collapses a horizontal Pool lane to a full-width title block and hides children', () => {
    const lf = createPoolLF()
    lf.render(createPoolGraphWithNodeInLane())

    const lane = lf.getNodeModelById('lane_1') as any
    const rect = lf.getNodeModelById('rect_1') as any
    const expandedWidth = lane.width

    lane.toggleCollapse(true)

    expect(lane.isCollapsed).toBe(true)
    expect(lane.width).toBe(expandedWidth)
    expect(lane.height).toBe(laneConfig.titleSize)
    expect(lane.expandWidth).toBe(expandedWidth)
    expect(rect.visible).toBe(false)

    lane.toggleCollapse(false)

    expect(lane.isCollapsed).toBe(false)
    expect(lane.width).toBe(expandedWidth)
    expect(rect.visible).toBe(true)
  })

  test('collapses lane edges and restores them after expanding', () => {
    const lf = createPoolLF()
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
      text: '业务连线标题',
    })
    lf.render(graph)

    const lane = lf.getNodeModelById('lane_1') as any
    const edge = lf.getEdgeModelById('edge_1') as any

    expect(() => lane.toggleCollapse(true)).not.toThrow()
    expect(edge.visible).toBe(false)

    const virtualEdge = lf.graphModel.edges.find(
      (candidate: any) => candidate.virtual && candidate.isCollapsedEdge,
    ) as any
    expect(virtualEdge).toBeDefined()
    expect(virtualEdge.sourceNodeId).toBe('lane_1')
    expect(virtualEdge.targetNodeId).toBe('rect_2')
    expect(virtualEdge.text.value).toBe('')

    lane.toggleCollapse(false)

    expect(edge.visible).toBe(true)
    expect(
      lf.graphModel.edges.some(
        (candidate: any) => candidate.virtual && candidate.isCollapsedEdge,
      ),
    ).toBe(false)
  })

  test('deleting a collapsed virtual edge also deletes its real edge', () => {
    const lf = createPoolLF()
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

    const lane = lf.getNodeModelById('lane_1') as any
    lane.toggleCollapse(true)
    const virtualEdge = lf.graphModel.edges.find(
      (candidate: any) => candidate.virtual && candidate.isCollapsedEdge,
    ) as any

    lf.deleteEdge(virtualEdge.id)
    lane.toggleCollapse(false)

    expect(lf.getEdgeModelById('edge_1')).toBeUndefined()
  })

  test('connects two collapsed lanes with a virtual edge', () => {
    const lf = createPoolLF()
    const graph = createPoolGraphWithNodeInLane()
    const lane2 = graph.nodes.find((node) => node.id === 'lane_2')!
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
    lf.render(graph)

    const firstLane = lf.getNodeModelById('lane_1') as any
    const secondLane = lf.getNodeModelById('lane_2') as any
    firstLane.toggleCollapse(true)
    secondLane.toggleCollapse(true)

    const virtualEdges = lf.graphModel.edges.filter(
      (candidate: any) => candidate.virtual && candidate.isCollapsedEdge,
    ) as any[]
    expect(virtualEdges).toHaveLength(1)
    expect(virtualEdges[0].sourceNodeId).toBe('lane_1')
    expect(virtualEdges[0].targetNodeId).toBe('lane_2')

    const firstLaneBounds = firstLane.getBounds()
    const secondLaneBounds = secondLane.getBounds()
    expect(virtualEdges[0].startPoint.y).toBeGreaterThanOrEqual(
      firstLaneBounds.minY,
    )
    expect(virtualEdges[0].startPoint.y).toBeLessThanOrEqual(
      firstLaneBounds.maxY,
    )
    expect(virtualEdges[0].endPoint.y).toBeGreaterThanOrEqual(
      secondLaneBounds.minY,
    )
    expect(virtualEdges[0].endPoint.y).toBeLessThanOrEqual(
      secondLaneBounds.maxY,
    )

    firstLane.toggleCollapse(false)

    const partlyExpandedVirtualEdge = lf.graphModel.edges.find(
      (candidate: any) => candidate.virtual && candidate.isCollapsedEdge,
    ) as any
    expect(partlyExpandedVirtualEdge.sourceNodeId).toBe('rect_1')
    expect(partlyExpandedVirtualEdge.targetNodeId).toBe('lane_2')

    secondLane.toggleCollapse(false)

    expect(lf.getEdgeModelById('edge_1')?.visible).toBe(true)
    expect(
      lf.graphModel.edges.some(
        (candidate: any) => candidate.virtual && candidate.isCollapsedEdge,
      ),
    ).toBe(false)
  })

  test('collapses a vertical Pool lane to a full-height title block', () => {
    const lf = createPoolLF()
    lf.render(createPoolWithTwoLanes('vertical'))

    const lane = lf.getNodeModelById('lane_1') as any
    const expandedHeight = lane.height

    lane.toggleCollapse(true)

    expect(lane.isCollapsed).toBe(true)
    expect(lane.width).toBe(laneConfig.titleSize)
    expect(lane.height).toBe(expandedHeight)
    expect(lane.expandHeight).toBe(expandedHeight)
  })

  test('adds an expanded lane from a collapsed lane', () => {
    const lf = createPoolLF()
    lf.render(createPoolWithTwoLanes('horizontal'))

    const pool = lf.getNodeModelById('pool_1') as any
    const lane = lf.getNodeModelById('lane_1') as any
    const expandedWidth = lane.width
    const expandedHeight = lane.height
    lane.toggleCollapse(true)

    const addedLane = pool.addChildBelow(lane.getData()) as any

    expect(addedLane.isCollapsed).toBe(false)
    expect(addedLane.width).toBe(expandedWidth)
    expect(addedLane.height).toBe(expandedHeight)
  })

  test('respects plugin collapse.lane false and node collapsible false', () => {
    const lf = createPoolLF({ collapse: { pool: true, lane: false } })
    lf.render(createPoolGraphWithNodeInLane())

    const lane = lf.getNodeModelById('lane_1') as any

    lane.toggleCollapse(true)

    expect(lane.isCollapsed).toBe(false)

    const lf2 = createPoolLF()
    lf2.render(createPoolGraphWithNodeInLane())
    const lane2 = lf2.getNodeModelById('lane_1') as any
    lane2.setProperties({ ...lane2.properties, collapsible: false })

    lane2.toggleCollapse(true)

    expect(lane2.isCollapsed).toBe(false)
  })

  test('respects plugin collapse.pool false', () => {
    const lf = createPoolLF({ collapse: { pool: false, lane: true } })
    lf.render(createPoolGraphWithNodeInLane())

    const pool = lf.getNodeModelById('pool_1') as any

    pool.toggleCollapse(true)

    expect(pool.isCollapsed).toBe(false)
  })

  test('collapses a pool into a fixed node and restores lane states', () => {
    const lf = createPoolLF()
    lf.render(createPoolWithTwoLanes('horizontal'))

    const pool = lf.getNodeModelById('pool_1') as any
    const firstLane = lf.getNodeModelById('lane_1') as any
    const secondLane = lf.getNodeModelById('lane_2') as any

    firstLane.toggleCollapse(true)
    expect(firstLane.isCollapsed).toBe(true)
    expect(secondLane.isCollapsed).toBe(false)
    pool.toggleCollapse(true)

    expect(pool.isCollapsed).toBe(true)
    expect(pool.width).toBe(120)
    expect(pool.height).toBe(80)

    pool.toggleCollapse(false)

    expect(pool.isCollapsed).toBe(false)
    expect(firstLane.isCollapsed).toBe(true)
    expect(secondLane.isCollapsed).toBe(false)
  })
})
