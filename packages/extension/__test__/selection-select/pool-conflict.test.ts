/**
 * @jest-environment jsdom
 */
import LogicFlow from '@logicflow/core'
import { DynamicGroup } from '../../src/dynamic-group'
import { PoolElements } from '../../src/pool'
import { SelectionSelect } from '../../src/components/selection-select'

function createContainer() {
  const container = document.createElement('div')
  container.style.width = '1200px'
  container.style.height = '800px'
  document.body.appendChild(container)
  return container
}

function createSelectionPoolLF() {
  return new LogicFlow({
    container: createContainer(),
    width: 1200,
    height: 800,
    plugins: [PoolElements, SelectionSelect],
  })
}

function createSelectionDynamicGroupLF() {
  return new LogicFlow({
    container: createContainer(),
    width: 1200,
    height: 800,
    plugins: [DynamicGroup, SelectionSelect],
  })
}

function createPoolWithNodeInLane() {
  return {
    nodes: [
      {
        id: 'pool_1',
        type: 'pool',
        x: 500,
        y: 260,
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
        x: 530,
        y: 260,
        width: 460,
        height: 360,
        text: '泳道1',
        properties: {
          parent: 'pool_1',
          direction: 'horizontal',
          isHorizontal: true,
          children: ['rect_1'],
        },
        children: ['rect_1'],
      },
      {
        id: 'rect_1',
        type: 'rect',
        x: 530,
        y: 260,
        width: 80,
        height: 40,
        text: '普通节点',
        properties: {
          parent: 'lane_1',
        },
      },
    ],
    edges: [],
  }
}

function createDynamicGroupWithChild() {
  return {
    nodes: [
      {
        id: 'group_1',
        type: 'dynamic-group',
        x: 500,
        y: 260,
        text: '分组',
        properties: {
          width: 520,
          height: 360,
          children: ['rect_1'],
        },
        children: ['rect_1'],
      },
      {
        id: 'rect_1',
        type: 'rect',
        x: 530,
        y: 260,
        width: 80,
        height: 40,
        text: '普通节点',
      },
    ],
    edges: [],
  }
}

function createNestedDynamicGroupWithChild() {
  return {
    nodes: [
      {
        id: 'outer_group',
        type: 'dynamic-group',
        x: 500,
        y: 260,
        text: '外层分组',
        properties: {
          width: 640,
          height: 460,
          children: ['inner_group'],
        },
        children: ['inner_group'],
      },
      {
        id: 'inner_group',
        type: 'dynamic-group',
        x: 500,
        y: 260,
        text: '内层分组',
        properties: {
          width: 320,
          height: 220,
          children: ['rect_1'],
        },
        children: ['rect_1'],
      },
      {
        id: 'rect_1',
        type: 'rect',
        x: 530,
        y: 260,
        width: 80,
        height: 40,
        text: '普通节点',
      },
    ],
    edges: [],
  }
}

function finishSelection(
  lf: LogicFlow,
  start: LogicFlow.Position,
  end: LogicFlow.Position,
) {
  const selection = lf.extension.selectionSelect as any
  selection.startPoint = start
  selection.endPoint = end
  selection.drawOff({
    clientX: end.x,
    clientY: end.y,
  })
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('selection-select with PoolElements', () => {
  test('deduplicates pool, lane, and child nodes without requiring DynamicGroup APIs', () => {
    const lf = createSelectionPoolLF()
    lf.render(createPoolWithNodeInLane())

    expect(() => {
      finishSelection(lf, { x: 200, y: 40 }, { x: 900, y: 500 })
    }).not.toThrow()

    const pool = lf.getNodeModelById('pool_1')!
    const lane = lf.getNodeModelById('lane_1')!
    const rect = lf.getNodeModelById('rect_1')!

    expect(pool.isSelected).toBe(true)
    expect(lane.isSelected).toBe(false)
    expect(rect.isSelected).toBe(false)
  })

  test('deduplicates lane and child nodes when the pool is outside the selected area', () => {
    const lf = createSelectionPoolLF()
    lf.render(createPoolWithNodeInLane())

    finishSelection(lf, { x: 280, y: 60 }, { x: 820, y: 460 })

    const pool = lf.getNodeModelById('pool_1')!
    const lane = lf.getNodeModelById('lane_1')!
    const rect = lf.getNodeModelById('rect_1')!

    expect(pool.isSelected).toBe(false)
    expect(lane.isSelected).toBe(true)
    expect(rect.isSelected).toBe(false)
  })

  test('removes a Pool descendant when its ancestor is already selected', () => {
    const lf = createSelectionPoolLF()
    lf.render(createPoolWithNodeInLane())

    const plugin = lf.extension.PoolElements as any
    const pool = lf.getNodeModelById('pool_1')!
    const lane = lf.getNodeModelById('lane_1')!
    const rect = lf.getNodeModelById('rect_1')!

    pool.setSelected(true)
    rect.setSelected(true)
    plugin.onNodeSelect({
      data: rect.getData(),
      isMultiple: true,
      isSelected: true,
    })

    expect(pool.isSelected).toBe(true)
    expect(lane.isSelected).toBe(false)
    expect(rect.isSelected).toBe(false)
  })

  test('removes selected Pool descendants when their ancestor is selected', () => {
    const lf = createSelectionPoolLF()
    lf.render(createPoolWithNodeInLane())

    const plugin = lf.extension.PoolElements as any
    const pool = lf.getNodeModelById('pool_1')!
    const lane = lf.getNodeModelById('lane_1')!
    const rect = lf.getNodeModelById('rect_1')!

    lane.setSelected(true)
    rect.setSelected(true)
    pool.setSelected(true)
    plugin.onNodeSelect({
      data: pool.getData(),
      isMultiple: true,
      isSelected: true,
    })

    expect(pool.isSelected).toBe(true)
    expect(lane.isSelected).toBe(false)
    expect(rect.isSelected).toBe(false)
  })

  test('keeps DynamicGroup parent-child deduplication behavior', () => {
    const lf = createSelectionDynamicGroupLF()
    lf.render(createDynamicGroupWithChild())

    finishSelection(lf, { x: 200, y: 40 }, { x: 900, y: 500 })

    const group = lf.getNodeModelById('group_1')!
    const rect = lf.getNodeModelById('rect_1')!

    expect(group.isSelected).toBe(true)
    expect(rect.isSelected).toBe(false)
  })

  test('removes a nested DynamicGroup descendant when its ancestor is already selected', () => {
    const lf = createSelectionDynamicGroupLF()
    lf.render(createNestedDynamicGroupWithChild())

    const plugin = lf.extension.dynamicGroup as any
    const outerGroup = lf.getNodeModelById('outer_group')!
    const innerGroup = lf.getNodeModelById('inner_group')!
    const rect = lf.getNodeModelById('rect_1')!

    outerGroup.setSelected(true)
    rect.setSelected(true)
    plugin.onNodeSelect({
      data: rect.getData(),
      isMultiple: true,
      isSelected: true,
    })

    expect(outerGroup.isSelected).toBe(true)
    expect(innerGroup.isSelected).toBe(false)
    expect(rect.isSelected).toBe(false)
  })

  test('does not select a nested DynamicGroup descendant while its ancestor is selected', () => {
    const lf = createSelectionDynamicGroupLF()
    lf.render(createNestedDynamicGroupWithChild())

    lf.getNodeModelById('outer_group')!.setSelected(true)
    finishSelection(lf, { x: 480, y: 240 }, { x: 590, y: 290 })

    expect(lf.getNodeModelById('outer_group')!.isSelected).toBe(true)
    expect(lf.getNodeModelById('inner_group')!.isSelected).toBe(false)
    expect(lf.getNodeModelById('rect_1')!.isSelected).toBe(false)
  })
})
