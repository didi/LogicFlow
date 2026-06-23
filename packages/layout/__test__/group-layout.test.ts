/**
 * @jest-environment jsdom
 */
import LogicFlow from '@logicflow/core'
import { DynamicGroup, PoolElements } from '@logicflow/extension'
import { Dagre } from '../src'

function createContainer() {
  const container = document.createElement('div')
  container.style.width = '1200px'
  container.style.height = '800px'
  document.body.appendChild(container)
  return container
}

function createLF(plugins: unknown[] = [DynamicGroup, Dagre]) {
  return new LogicFlow({
    container: createContainer(),
    width: 1200,
    height: 800,
    plugins,
  })
}

function expectNodeCenterInsideGroup(
  lf: LogicFlow,
  nodeId: string,
  groupId: string,
) {
  const node = lf.getNodeDataById(nodeId)!
  const group = lf.getNodeDataById(groupId)!
  const groupWidth = group.width ?? (group.properties?.width as number)
  const groupHeight = group.height ?? (group.properties?.height as number)

  expect(node.x).toBeGreaterThanOrEqual(group.x - groupWidth / 2)
  expect(node.x).toBeLessThanOrEqual(group.x + groupWidth / 2)
  expect(node.y).toBeGreaterThanOrEqual(group.y - groupHeight / 2)
  expect(node.y).toBeLessThanOrEqual(group.y + groupHeight / 2)
}

describe('layout group resize options', () => {
  afterEach(() => {
    jest.restoreAllMocks()
    document.body.innerHTML = ''
  })

  test('keeps group size and warns overflow when resizeGroup=false', () => {
    const lf = createLF()
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

    lf.render({
      nodes: [
        {
          id: 'g1',
          type: 'dynamic-group',
          x: 380,
          y: 260,
          properties: {
            width: 140,
            height: 90,
            children: ['a', 'b'],
          },
        },
        { id: 'a', type: 'rect', x: 360, y: 260, text: 'A' },
        { id: 'b', type: 'rect', x: 400, y: 260, text: 'B' },
      ],
      edges: [
        { id: 'e_ab', type: 'polyline', sourceNodeId: 'a', targetNodeId: 'b' },
      ],
    })
    ;(lf.extension.dagre as Dagre).layout({
      groupId: 'g1',
      rankdir: 'LR',
      nodesep: 220,
      resizeGroup: false,
    })

    const g1 = lf.getNodeDataById('g1')!
    const width = g1.properties?.width
    const height = g1.properties?.height

    expect(width).toBe(140)
    expect(height).toBe(90)
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('节点超出group边界'),
    )
  })

  test('keeps scoped group layout centered inside the group coordinate space', () => {
    const lf = createLF()

    lf.render({
      nodes: [
        {
          id: 'g1',
          type: 'dynamic-group',
          x: 500,
          y: 300,
          properties: {
            width: 520,
            height: 300,
            children: ['a', 'b', 'c'],
          },
        },
        { id: 'a', type: 'rect', x: 440, y: 260, text: 'A' },
        { id: 'b', type: 'rect', x: 500, y: 300, text: 'B' },
        { id: 'c', type: 'rect', x: 560, y: 340, text: 'C' },
        { id: 'outside', type: 'rect', x: 900, y: 300, text: '外部' },
      ],
      edges: [
        { id: 'e_ab', type: 'polyline', sourceNodeId: 'a', targetNodeId: 'b' },
        { id: 'e_bc', type: 'polyline', sourceNodeId: 'b', targetNodeId: 'c' },
      ],
    })
    ;(lf.extension.dagre as Dagre).layout({
      groupId: 'g1',
      rankdir: 'LR',
      nodesep: 40,
      ranksep: 40,
      resizeGroup: false,
    })

    expectNodeCenterInsideGroup(lf, 'a', 'g1')
    expectNodeCenterInsideGroup(lf, 'b', 'g1')
    expectNodeCenterInsideGroup(lf, 'c', 'g1')
    expect(lf.getNodeDataById('outside')?.x).toBe(900)
  })

  test('keeps descendants inside groups during full graph layout', () => {
    const lf = createLF()
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

    lf.render({
      nodes: [
        {
          id: 'outer',
          type: 'dynamic-group',
          x: 520,
          y: 320,
          properties: {
            width: 680,
            height: 460,
            children: ['inner'],
          },
        },
        {
          id: 'inner',
          type: 'dynamic-group',
          x: 520,
          y: 320,
          properties: {
            width: 420,
            height: 260,
            children: ['a', 'b'],
          },
        },
        { id: 'a', type: 'rect', x: 460, y: 300, text: 'A' },
        { id: 'b', type: 'rect', x: 580, y: 340, text: 'B' },
        { id: 'source', type: 'circle', x: 120, y: 320, text: '入口' },
        { id: 'target', type: 'rect', x: 900, y: 320, text: '出口' },
      ],
      edges: [
        {
          id: 'e_source_a',
          type: 'polyline',
          sourceNodeId: 'source',
          targetNodeId: 'a',
        },
        { id: 'e_ab', type: 'polyline', sourceNodeId: 'a', targetNodeId: 'b' },
        {
          id: 'e_b_target',
          type: 'polyline',
          sourceNodeId: 'b',
          targetNodeId: 'target',
        },
      ],
    })
    ;(lf.extension.dagre as Dagre).layout({
      rankdir: 'LR',
      nodesep: 40,
      ranksep: 40,
      resizeGroup: false,
    })

    expectNodeCenterInsideGroup(lf, 'a', 'inner')
    expectNodeCenterInsideGroup(lf, 'b', 'inner')
    expectNodeCenterInsideGroup(lf, 'inner', 'outer')
    const innerOverflowWarnings = warnSpy.mock.calls.filter(([message]) =>
      String(message).includes('节点超出group边界: inner'),
    )
    expect(innerOverflowWarnings.length).toBeLessThanOrEqual(1)
  })

  test('emits each warning category once per group in a full graph layout', () => {
    const lf = createLF()
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

    lf.render({
      nodes: [
        {
          id: 'outer',
          type: 'dynamic-group',
          x: 500,
          y: 300,
          properties: {
            width: 160,
            height: 120,
            children: ['inner'],
          },
        },
        {
          id: 'inner',
          type: 'dynamic-group',
          x: 500,
          y: 300,
          properties: {
            width: 120,
            height: 90,
            children: ['a', 'b'],
          },
        },
        { id: 'a', type: 'rect', x: 460, y: 300, text: 'A' },
        { id: 'b', type: 'rect', x: 540, y: 300, text: 'B' },
        { id: 'source', type: 'circle', x: 100, y: 300, text: '入口' },
      ],
      edges: [
        {
          id: 'e_source_a',
          type: 'polyline',
          sourceNodeId: 'source',
          targetNodeId: 'a',
        },
        { id: 'e_ab', type: 'polyline', sourceNodeId: 'a', targetNodeId: 'b' },
      ],
    })
    ;(lf.extension.dagre as Dagre).layout({
      rankdir: 'LR',
      nodesep: 260,
      resizeGroup: false,
    })

    const innerOverflowWarnings = warnSpy.mock.calls.filter(([message]) =>
      String(message).includes('节点超出group边界: inner'),
    )
    expect(innerOverflowWarnings).toHaveLength(1)
  })

  test('resizes group in grow-only mode and warns when overriding resizable=false', () => {
    const lf = createLF()
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

    lf.render({
      nodes: [
        {
          id: 'g1',
          type: 'dynamic-group',
          x: 380,
          y: 260,
          resizable: false,
          properties: {
            width: 120,
            height: 90,
            children: ['a', 'b'],
          },
        },
        { id: 'a', type: 'rect', x: 360, y: 260, text: 'A' },
        { id: 'b', type: 'rect', x: 400, y: 260, text: 'B' },
      ],
      edges: [
        { id: 'e_ab', type: 'polyline', sourceNodeId: 'a', targetNodeId: 'b' },
      ],
    })
    ;(lf.extension.dagre as Dagre).layout({
      groupId: 'g1',
      rankdir: 'LR',
      nodesep: 220,
      resizeGroup: 'grow-only',
      groupPadding: 20,
    })

    const g1 = lf.getNodeDataById('g1')!
    expect((g1.properties?.width as number) > 120).toBe(true)
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('覆盖了 group.resizable=false'),
    )
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('调整了group尺寸'),
    )
  })

  test('supports fit mode to shrink group size', () => {
    const lf = createLF()
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

    lf.render({
      nodes: [
        {
          id: 'g1',
          type: 'dynamic-group',
          x: 380,
          y: 260,
          properties: {
            width: 560,
            height: 320,
            children: ['a', 'b'],
          },
        },
        { id: 'a', type: 'rect', x: 360, y: 260, text: 'A' },
        { id: 'b', type: 'rect', x: 400, y: 260, text: 'B' },
      ],
      edges: [
        { id: 'e_ab', type: 'polyline', sourceNodeId: 'a', targetNodeId: 'b' },
      ],
    })
    ;(lf.extension.dagre as Dagre).layout({
      groupId: 'g1',
      rankdir: 'TB',
      nodesep: 20,
      ranksep: 20,
      resizeGroup: 'fit',
      groupPadding: 12,
    })

    const g1 = lf.getNodeDataById('g1')!
    expect((g1.properties?.width as number) < 560).toBe(true)
    expect((g1.properties?.height as number) < 320).toBe(true)
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('调整了group尺寸'),
    )
  })

  test('handles nested groups and adjusts outer group after inner resize', () => {
    const lf = createLF()

    lf.render({
      nodes: [
        {
          id: 'outer',
          type: 'dynamic-group',
          x: 500,
          y: 300,
          properties: {
            width: 120,
            height: 90,
            children: ['inner'],
          },
        },
        {
          id: 'inner',
          type: 'dynamic-group',
          x: 500,
          y: 300,
          properties: {
            width: 120,
            height: 80,
            children: ['a', 'b'],
          },
        },
        { id: 'a', type: 'rect', x: 470, y: 300, text: 'A' },
        { id: 'b', type: 'rect', x: 530, y: 300, text: 'B' },
      ],
      edges: [
        { id: 'e_ab', type: 'polyline', sourceNodeId: 'a', targetNodeId: 'b' },
      ],
    })
    ;(lf.extension.dagre as Dagre).layout({
      groupId: 'inner',
      rankdir: 'LR',
      nodesep: 220,
      resizeGroup: 'grow-only',
      groupPadding: 16,
    })

    const inner = lf.getNodeDataById('inner')!
    const outer = lf.getNodeDataById('outer')!
    expect((inner.properties?.width as number) > 120).toBe(true)
    expect((outer.properties?.width as number) > 120).toBe(true)
  })

  test('does not resize lane or pool by default and still warns overflow', () => {
    const lf = createLF([PoolElements, Dagre])
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

    lf.render({
      nodes: [
        {
          id: 'pool_1',
          type: 'pool',
          x: 540,
          y: 300,
          text: '泳池',
          properties: {
            direction: 'horizontal',
            width: 520,
            height: 360,
            children: ['lane_1'],
          },
          children: ['lane_1'],
        },
        {
          id: 'lane_1',
          type: 'lane',
          x: 570,
          y: 300,
          width: 460,
          height: 260,
          text: '泳道1',
          properties: {
            parent: 'pool_1',
            direction: 'horizontal',
            isHorizontal: true,
            children: ['n1', 'n2'],
          },
          children: ['n1', 'n2'],
        },
        { id: 'n1', type: 'rect', x: 520, y: 280, text: 'n1' },
        { id: 'n2', type: 'rect', x: 620, y: 320, text: 'n2' },
      ],
      edges: [
        { id: 'e12', type: 'polyline', sourceNodeId: 'n1', targetNodeId: 'n2' },
      ],
    })

    const laneBefore = lf.getNodeDataById('lane_1')!
    const poolBefore = lf.getNodeDataById('pool_1')!

    ;(lf.extension.dagre as Dagre).layout({
      groupId: 'lane_1',
      rankdir: 'LR',
      nodesep: 260,
      resizeGroup: false,
    })

    const laneAfter = lf.getNodeDataById('lane_1')!
    const poolAfter = lf.getNodeDataById('pool_1')!
    expect(laneAfter.width ?? laneAfter.properties?.width).toBe(
      laneBefore.width ?? laneBefore.properties?.width,
    )
    expect(poolAfter.properties?.width).toBe(poolBefore.properties?.width)
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('节点超出group边界'),
    )
  })
})
