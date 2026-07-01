/**
 * @jest-environment jsdom
 */
import LogicFlow from '@logicflow/core'
import {
  DynamicGroup,
  DynamicGroupNodeModel,
  DEFAULT_SENSOR_OUTLINE,
} from '../../src/dynamic-group'
import { createDynamicGroupLF } from './fixtures'

function graphWithSingleGroup() {
  return {
    nodes: [
      {
        id: 'group_a',
        type: 'dynamic-group',
        x: 400,
        y: 240,
        properties: {
          width: 320,
          height: 200,
          collapsedWidth: 80,
          collapsedHeight: 60,
          collapsible: true,
          isCollapsed: false,
          children: ['rect_a'],
        },
      },
      {
        id: 'rect_a',
        type: 'rect',
        x: 400,
        y: 240,
        properties: { width: 80, height: 50 },
      },
    ],
    edges: [],
  }
}

function getDynamicGroup(lf: LogicFlow) {
  return lf.graphModel.dynamicGroup as DynamicGroup
}

function simulateNodeDrag(lf: LogicFlow, nodeId: string) {
  const data = lf.getNodeModelById(nodeId)!.getData()
  lf.graphModel.eventCenter.emit('node:drag', {
    data,
    e: {} as MouseEvent,
    deltaX: 0,
    deltaY: 0,
  })
}

function simulateNodeDrop(lf: LogicFlow, nodeId: string) {
  const data = lf.getNodeModelById(nodeId)!.getData()
  lf.graphModel.eventCenter.emit('node:drop', {
    data,
    e: {} as MouseEvent,
  })
}

function simulateNodeMouseUp(lf: LogicFlow, nodeId: string) {
  const data = lf.getNodeModelById(nodeId)!.getData()
  lf.graphModel.eventCenter.emit('node:mouseup', {
    data,
    e: {} as MouseEvent,
  })
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('dynamic-group sensor outline', () => {
  test('shows highlight while dragging over a droppable group', () => {
    const lf = createDynamicGroupLF()
    lf.render(graphWithSingleGroup())

    const group = lf.getNodeModelById('group_a') as DynamicGroupNodeModel
    simulateNodeDrag(lf, 'rect_a')

    expect(group.groupAddable).toBe(true)
    expect(getDynamicGroup(lf).activeGroup?.id).toBe('group_a')
  })

  test('clears highlight after node:drop when moving within the same group', () => {
    const lf = createDynamicGroupLF()
    lf.render(graphWithSingleGroup())

    const group = lf.getNodeModelById('group_a') as DynamicGroupNodeModel
    const dg = getDynamicGroup(lf)

    simulateNodeDrag(lf, 'rect_a')
    expect(group.groupAddable).toBe(true)

    simulateNodeDrop(lf, 'rect_a')

    expect(group.groupAddable).toBe(false)
    expect(dg.activeGroup).toBeUndefined()
  })

  test('clears highlight on node:mouseup without drop', () => {
    const lf = createDynamicGroupLF()
    lf.render(graphWithSingleGroup())

    const group = lf.getNodeModelById('group_a') as DynamicGroupNodeModel

    simulateNodeDrag(lf, 'rect_a')
    expect(group.groupAddable).toBe(true)

    simulateNodeMouseUp(lf, 'rect_a')

    expect(group.groupAddable).toBe(false)
  })

  test('clears highlight when drag moves out of group bounds', () => {
    const lf = createDynamicGroupLF()
    lf.render(graphWithSingleGroup())

    const group = lf.getNodeModelById('group_a') as DynamicGroupNodeModel
    const rect = lf.getNodeModelById('rect_a')!

    simulateNodeDrag(lf, 'rect_a')
    expect(group.groupAddable).toBe(true)

    rect.moveTo(40, 40)
    simulateNodeDrag(lf, 'rect_a')

    expect(group.groupAddable).toBe(false)
  })

  test('sensorOutline plugin option customizes getAddableOutlineStyle()', () => {
    const lf = createDynamicGroupLF({
      sensorOutline: { stroke: '#2961EF', strokeWidth: 3 },
    })
    lf.render(graphWithSingleGroup())

    const group = lf.getNodeModelById('group_a') as DynamicGroupNodeModel

    expect(group.getAddableOutlineStyle()).toEqual({
      stroke: '#2961EF',
      strokeWidth: 3,
      strokeDasharray: '4 4',
      fill: 'transparent',
    })
  })

  test('uses default sensor outline when plugin option is omitted', () => {
    const lf = createDynamicGroupLF()
    lf.render(graphWithSingleGroup())

    const group = lf.getNodeModelById('group_a') as DynamicGroupNodeModel

    expect(group.getAddableOutlineStyle()).toEqual({
      ...DEFAULT_SENSOR_OUTLINE,
      strokeDasharray: '4 4',
      fill: 'transparent',
    })
  })
})
