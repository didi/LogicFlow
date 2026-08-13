/**
 * @jest-environment jsdom
 */
import LogicFlow, { Keyboard } from '@logicflow/core'
import { PoolElements } from '../../src/pool'
import {
  createPoolLF,
  createPoolGraphWithNodeInLane,
  createTwoPoolGraph,
} from './fixtures'

afterEach(() => {
  jest.restoreAllMocks()
  document.body.innerHTML = ''
})

describe('pool lane copy paste', () => {
  function createKeyboardPoolLF(callbacks: Record<string, () => void>) {
    jest
      .spyOn(Keyboard.prototype, 'on')
      .mockImplementation((keys: string | string[], callback: () => void) => {
        const keyList = Array.isArray(keys) ? keys : [keys]
        keyList.forEach((key) => {
          callbacks[key] = callback
        })
      })

    const container = document.createElement('div')
    container.style.width = '1200px'
    container.style.height = '800px'
    document.body.appendChild(container)

    return new LogicFlow({
      container,
      width: 1200,
      height: 800,
      keyboard: {
        enabled: true,
      },
      plugins: [PoolElements],
    })
  }

  test('copies a whole pool with lanes and lane children', async () => {
    const lf = createPoolLF()
    lf.render(createPoolGraphWithNodeInLane())

    const sourcePool = lf.getNodeModelById('pool_1') as any
    const added = lf.addElements(
      { nodes: [sourcePool.getData()], edges: [] },
      80,
    )
    await Promise.resolve()

    const copiedPool = added.nodes.find(
      (node: any) => String(node.type) === 'pool',
    ) as any
    expect(copiedPool).toBeDefined()
    expect(copiedPool.id).not.toBe('pool_1')
    expect(copiedPool.children.size).toBe(sourcePool.children.size)
    expect(copiedPool.properties.children).toHaveLength(
      sourcePool.children.size,
    )
    const copiedLaneId = Array.from(copiedPool.children)[0] as string
    const copiedLane = lf.getNodeModelById(copiedLaneId) as any
    expect(copiedLane.properties.parent).toBe(copiedPool.id)
    expect(copiedLane.children.size).toBeGreaterThan(0)
  })

  test('pastes a lane into a new pool when no pool is selected', () => {
    const lf = createPoolLF()
    lf.render(createPoolGraphWithNodeInLane())

    const lane = lf.getNodeModelById('lane_1') as any
    const onNotAllowed = jest.fn()

    lf.on('lane:paste-not-allowed', onNotAllowed)

    const added = lf.addElements({ nodes: [lane.getData()], edges: [] }, 0)
    const createdPool = added.nodes.find(
      (node: any) => String(node.type) === 'pool',
    ) as any
    const copiedLane = lf.getNodeModelById(
      Array.from(createdPool.children)[0] as string,
    ) as any

    expect(createdPool).toBeDefined()
    expect(copiedLane).toBeDefined()
    expect(copiedLane.properties.parent).toBe(createdPool.id)
    expect(Array.from(createdPool.children)).toEqual([copiedLane.id])
    expect(lane.children.has(createdPool.id)).toBe(false)
    expect(createdPool.properties.parent).toBeUndefined()
    expect(onNotAllowed).not.toHaveBeenCalled()
  })

  test('keeps internal child edges when pasting a lane into a new pool', () => {
    const lf = createPoolLF()
    const graph = createPoolGraphWithNodeInLane()
    const lane = graph.nodes.find((node) => node.id === 'lane_1') as any
    lane.children = ['rect_1', 'rect_2']
    lane.properties.children = ['rect_1', 'rect_2']
    graph.nodes.push({
      id: 'rect_2',
      type: 'rect',
      x: 640,
      y: 170,
      width: 80,
      height: 40,
      text: '普通节点 2',
      properties: {
        parent: 'lane_1',
      },
    })
    graph.edges.push({
      id: 'edge_1',
      type: 'polyline',
      sourceNodeId: 'rect_1',
      targetNodeId: 'rect_2',
    })
    lf.render(graph)

    const sourceLane = lf.getNodeModelById('lane_1') as any
    const added = lf.addElements(
      { nodes: [sourceLane.getData()], edges: [] },
      0,
    )
    const createdPool = added.nodes.find(
      (node: any) => String(node.type) === 'pool',
    ) as any
    const copiedLane = lf.getNodeModelById(
      Array.from(createdPool.children)[0] as string,
    ) as any
    const copiedChildIds = Array.from(copiedLane.children)

    expect(copiedChildIds).toHaveLength(2)
    expect(
      lf.graphModel.edges.some(
        (edge: any) =>
          copiedChildIds.includes(edge.sourceNodeId) &&
          copiedChildIds.includes(edge.targetNodeId),
      ),
    ).toBe(true)
  })

  test('pastes a copied lane into a target pool', () => {
    const lf = createPoolLF()
    lf.render(createTwoPoolGraph())

    const lane = lf.getNodeModelById('lane_1') as any
    const targetPool = lf.getNodeModelById('pool_2') as any
    const laneData = lane.getData()
    lf.selectElementById(targetPool.id)

    const added = lf.addElements({ nodes: [laneData], edges: [] }, 0)
    const copiedLane = added.nodes.find(
      (node: any) => String(node.type) === 'lane',
    ) as any

    expect(copiedLane).toBeDefined()
    expect(copiedLane.properties.parent).toBe('pool_2')
    expect(targetPool.children.has(copiedLane.id)).toBe(true)
    expect(Array.from(targetPool.children).at(-1)).toBe(copiedLane.id)
  })

  test('keyboard paste keeps the selected target pool until PoolElements resolves paste target', () => {
    const callbacks: Record<string, () => void> = {}
    const lf = createKeyboardPoolLF(callbacks)
    lf.render(createTwoPoolGraph())

    const lane = lf.getNodeModelById('lane_1') as any
    const targetPool = lf.getNodeModelById('pool_2') as any
    lf.selectElementById(lane.id)
    callbacks['ctrl + c']()
    lf.selectElementById(targetPool.id)

    callbacks['ctrl + v']()

    const copiedLane = targetPool
      .getOrderedLanes()
      .find((item: any) => item.id !== 'lane_3')

    expect(copiedLane).toBeDefined()
    expect(copiedLane.properties.parent).toBe(targetPool.id)
    expect(
      lf.graphModel.nodes.filter((node) => String(node.type) === 'pool'),
    ).toHaveLength(2)
  })

  test('pastes a copied lane into the pool that owns the selected lane', () => {
    const lf = createPoolLF()
    lf.render(createTwoPoolGraph())

    const sourceLane = lf.getNodeModelById('lane_1') as any
    const targetLane = lf.getNodeModelById('lane_3') as any
    const targetPool = lf.getNodeModelById('pool_2') as any
    lf.selectElementById(targetLane.id)

    const added = lf.addElements(
      { nodes: [sourceLane.getData()], edges: [] },
      0,
    )
    const copiedLane = added.nodes.find(
      (node: any) => String(node.type) === 'lane',
    ) as any

    expect(copiedLane).toBeDefined()
    expect(copiedLane.properties.parent).toBe(targetPool.id)
    expect(targetPool.children.has(copiedLane.id)).toBe(true)
    expect(
      lf.graphModel.nodes.filter((node) => String(node.type) === 'pool'),
    ).toHaveLength(2)
  })

  test('pastes a copied lane into the pool that owns the selected child node', () => {
    const lf = createPoolLF()
    const graph = createTwoPoolGraph() as any
    const targetLane = graph.nodes.find((node: any) => node.id === 'lane_3')
    targetLane.children = ['target_rect']
    targetLane.properties.children = ['target_rect']
    graph.nodes.push({
      id: 'target_rect',
      type: 'rect',
      x: 930,
      y: 260,
      width: 80,
      height: 40,
      text: '目标节点',
      properties: {
        parent: 'lane_3',
      },
    })
    lf.render(graph)

    const sourceLane = lf.getNodeModelById('lane_1') as any
    const targetNode = lf.getNodeModelById('target_rect') as any
    const targetPool = lf.getNodeModelById('pool_2') as any
    lf.selectElementById(targetNode.id)

    const added = lf.addElements(
      { nodes: [sourceLane.getData()], edges: [] },
      0,
    )
    const copiedLane = added.nodes.find(
      (node: any) => String(node.type) === 'lane',
    ) as any

    expect(copiedLane).toBeDefined()
    expect(copiedLane.properties.parent).toBe(targetPool.id)
    expect(targetPool.children.has(copiedLane.id)).toBe(true)
    expect(
      lf.graphModel.nodes.filter((node) => String(node.type) === 'pool'),
    ).toHaveLength(2)
  })

  test('pastes a copied lane into a new pool when only a non-pool node is selected', () => {
    const lf = createPoolLF()
    const graph = createTwoPoolGraph() as any
    graph.nodes.push({
      id: 'outside_rect',
      type: 'rect',
      x: 100,
      y: 100,
      width: 80,
      height: 40,
      text: '池外节点',
    })
    lf.render(graph)

    const sourceLane = lf.getNodeModelById('lane_1') as any
    const outsideNode = lf.getNodeModelById('outside_rect') as any
    lf.selectElementById(outsideNode.id)

    const added = lf.addElements(
      { nodes: [sourceLane.getData()], edges: [] },
      0,
    )
    const createdPool = added.nodes.find(
      (node: any) => String(node.type) === 'pool',
    ) as any

    expect(createdPool).toBeDefined()
    expect(createdPool.id).not.toBe('pool_1')
    expect(createdPool.id).not.toBe('pool_2')
    expect(
      lf.graphModel.nodes.filter((node) => String(node.type) === 'pool'),
    ).toHaveLength(3)
  })

  test('pastes a copied lane into a new pool when selected nodes resolve to multiple pools', () => {
    const lf = createPoolLF()
    lf.render(createTwoPoolGraph())

    const sourceLane = lf.getNodeModelById('lane_1') as any
    const selectedLane = lf.getNodeModelById('lane_1') as any
    const selectedTargetLane = lf.getNodeModelById('lane_3') as any
    lf.selectElementById(selectedLane.id)
    lf.selectElementById(selectedTargetLane.id, true)

    const added = lf.addElements(
      { nodes: [sourceLane.getData()], edges: [] },
      0,
    )
    const createdPool = added.nodes.find(
      (node: any) => String(node.type) === 'pool',
    ) as any

    expect(createdPool).toBeDefined()
    expect(createdPool.id).not.toBe('pool_1')
    expect(createdPool.id).not.toBe('pool_2')
    expect(
      lf.graphModel.nodes.filter((node) => String(node.type) === 'pool'),
    ).toHaveLength(3)
  })

  test('filters pasted lane descendants when a new pool is also pasted', () => {
    const lf = createPoolLF()
    lf.render(createPoolGraphWithNodeInLane())

    const lane = lf.getNodeModelById('lane_1') as any
    const added = lf.addElements({ nodes: [lane.getData()], edges: [] }, 0)
    const selectableNodes = (
      lf.extension.PoolElements as any
    ).getRootContainerNodes(added.nodes)

    expect(selectableNodes.map((node: any) => String(node.type))).toEqual([
      'pool',
    ])
  })

  test('keyboard blank lane paste selects the generated pool but not its lane descendant', () => {
    const callbacks: Record<string, () => void> = {}
    const lf = createKeyboardPoolLF(callbacks)
    lf.render(createPoolGraphWithNodeInLane())

    const lane = lf.getNodeModelById('lane_1') as any
    lf.selectElementById(lane.id)
    callbacks['ctrl + c']()
    lf.clearSelectElements()

    callbacks['ctrl + v']()

    const selectedNodes = lf.getSelectElements().nodes
    const selectedPool = selectedNodes.find(
      (node) => String(node.type) === 'pool' && node.id !== 'pool_1',
    ) as any
    const copiedLane = lf.graphModel.nodes.find(
      (node: any) =>
        String(node.type) === 'lane' &&
        node.properties.parent === selectedPool.id,
    ) as any
    const copiedChild = lf.getNodeModelById(
      Array.from(copiedLane.children)[0] as string,
    ) as any

    expect(selectedNodes.map((node) => String(node.type))).toEqual(['pool'])
    expect(selectedPool).toBeDefined()
    expect(copiedLane).toBeDefined()
    expect(copiedLane.isSelected).toBe(false)
    expect(copiedChild.isSelected).toBe(false)
  })

  test('pastes selected lanes into the selected pool as a contiguous block', () => {
    const lf = createPoolLF()
    lf.render(createTwoPoolGraph())

    const firstLane = lf.getNodeModelById('lane_1') as any
    const secondLane = lf.getNodeModelById('lane_2') as any
    const targetPool = lf.getNodeModelById('pool_2') as any
    lf.selectElementById(targetPool.id)

    const added = lf.addElements(
      { nodes: [firstLane.getData(), secondLane.getData()], edges: [] },
      0,
    )
    const copiedLaneIds = added.nodes
      .filter((node: any) => String(node.type) === 'lane')
      .map((node: any) => node.id)

    expect(copiedLaneIds).toHaveLength(2)
    expect(Array.from(targetPool.children)).toEqual([
      'lane_3',
      ...copiedLaneIds,
    ])
  })

  test('keeps children inside lanes when pasting lanes from multiple pools into a new pool', () => {
    const lf = createPoolLF()
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

    const firstLane = lf.getNodeModelById('lane_1') as any
    const fourthLane = lf.getNodeModelById('lane_4') as any
    const added = lf.addElements(
      { nodes: [firstLane.getData(), fourthLane.getData()], edges: [] },
      40,
    )
    const createdPool = added.nodes.find(
      (node: any) => String(node.type) === 'pool',
    ) as any
    const copiedLanes = Array.from(createdPool.children).map((laneId) =>
      lf.getNodeModelById(laneId as string),
    ) as any[]

    expect(copiedLanes).toHaveLength(2)
    copiedLanes.forEach((lane) => {
      const copiedNode = Array.from(lane.children)
        .map((id) => lf.getNodeModelById(id))
        .find(Boolean) as any
      const laneBounds = lf.getNodeModelById(lane.id).getBounds()
      const nodeBounds = copiedNode.getBounds()
      expect(nodeBounds.minX).toBeGreaterThanOrEqual(laneBounds.minX)
      expect(nodeBounds.maxX).toBeLessThanOrEqual(laneBounds.maxX)
      expect(nodeBounds.minY).toBeGreaterThanOrEqual(laneBounds.minY)
      expect(nodeBounds.maxY).toBeLessThanOrEqual(laneBounds.maxY)
    })
  })

  test('resets copied cross-lane edge geometry after pasting selected lanes', () => {
    const lf = createPoolLF()
    const graph = createTwoPoolGraph() as any
    const secondLane = graph.nodes.find((node: any) => node.id === 'lane_2')
    secondLane.children = ['rect_2']
    secondLane.properties.children = ['rect_2']
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
    lf.render(graph)

    const firstLane = lf.getNodeModelById('lane_1') as any
    const laneTwo = lf.getNodeModelById('lane_2') as any
    const targetPool = lf.getNodeModelById('pool_2') as any
    lf.selectElementById(targetPool.id)

    const added = lf.addElements(
      { nodes: [firstLane.getData(), laneTwo.getData()], edges: [] },
      0,
    )
    const copiedLaneIds = added.nodes
      .filter((node: any) => String(node.type) === 'lane')
      .map((node: any) => node.id)
    const copiedChildIds = copiedLaneIds.flatMap((laneId: string) =>
      Array.from((lf.getNodeModelById(laneId) as any).children),
    )
    const copiedEdge = lf.graphModel.edges.find(
      (edge: any) =>
        edge.text?.value === '跨泳道连线' &&
        copiedChildIds.includes(edge.sourceNodeId) &&
        copiedChildIds.includes(edge.targetNodeId),
    ) as any

    expect(copiedEdge).toBeDefined()

    const copiedSource = lf.getNodeModelById(copiedEdge.sourceNodeId) as any
    const copiedTarget = lf.getNodeModelById(copiedEdge.targetNodeId) as any
    const sourceBounds = copiedSource.getBounds()
    const targetBounds = copiedTarget.getBounds()

    expect(copiedEdge.startPoint.x).toBeGreaterThanOrEqual(sourceBounds.minX)
    expect(copiedEdge.startPoint.x).toBeLessThanOrEqual(sourceBounds.maxX)
    expect(copiedEdge.startPoint.y).toBeGreaterThanOrEqual(sourceBounds.minY)
    expect(copiedEdge.startPoint.y).toBeLessThanOrEqual(sourceBounds.maxY)
    expect(copiedEdge.endPoint.x).toBeGreaterThanOrEqual(targetBounds.minX)
    expect(copiedEdge.endPoint.x).toBeLessThanOrEqual(targetBounds.maxX)
    expect(copiedEdge.endPoint.y).toBeGreaterThanOrEqual(targetBounds.minY)
    expect(copiedEdge.endPoint.y).toBeLessThanOrEqual(targetBounds.maxY)
    expect(copiedEdge.text).toEqual(
      expect.objectContaining(copiedEdge.textPosition),
    )
  })

  test('pastes a collapsed lane as an expanded lane', () => {
    const lf = createPoolLF()
    lf.render(createTwoPoolGraph())

    const lane = lf.getNodeModelById('lane_1') as any
    const targetPool = lf.getNodeModelById('pool_1') as any
    const expandedWidth = lane.width
    const expandedHeight = lane.height
    lane.toggleCollapse(true)
    lf.selectElementById(targetPool.id)

    const added = lf.addElements({ nodes: [lane.getData()], edges: [] }, 0)
    const copiedLane = added.nodes.find(
      (node: any) => String(node.type) === 'lane',
    ) as any

    expect(copiedLane.isCollapsed).toBe(false)
    expect(copiedLane.width).toBe(expandedWidth)
    expect(copiedLane.height).toBe(expandedHeight)
  })
})
