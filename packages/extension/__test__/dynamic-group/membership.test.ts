/**
 * @jest-environment jsdom
 */
import LogicFlow from '@logicflow/core'
import {
  DynamicGroup,
  DynamicGroupNodeModel,
  dynamicGroup,
} from '../../src/dynamic-group'
import { createDynamicGroupLF } from './fixtures'

class LockedGroupNodeModel extends DynamicGroupNodeModel {
  initNodeData(data: LogicFlow.NodeConfig) {
    super.initNodeData(data)
    this.isRestrict = true
    this.properties = {
      ...this.properties,
      isRestrict: true,
    }
  }

  isAllowAppendIn() {
    return false
  }
}

function createLockedGroupLF() {
  const lf = createDynamicGroupLF()
  lf.register({
    type: 'locked-dynamic-group',
    view: dynamicGroup.view,
    model: LockedGroupNodeModel,
  })
  return lf
}

function graphLockedGroupWithChild() {
  return {
    nodes: [
      {
        id: 'locked_g',
        type: 'locked-dynamic-group',
        x: 400,
        y: 240,
        properties: {
          width: 320,
          height: 200,
          collapsedWidth: 80,
          collapsedHeight: 60,
          collapsible: true,
          isCollapsed: false,
          isRestrict: true,
          children: ['locked_child'],
        },
      },
      {
        id: 'locked_child',
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

function simulateNodeDrop(lf: LogicFlow, nodeId: string) {
  const data = lf.getNodeModelById(nodeId)!.getData()
  lf.graphModel.eventCenter.emit('node:drop', {
    data,
    e: {} as MouseEvent,
  })
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('dynamic-group membership (#2412)', () => {
  test('M5: isRestrict + isAllowAppendIn false — in-group drop keeps children and map', () => {
    const lf = createLockedGroupLF()
    lf.render(graphLockedGroupWithChild())

    const group = lf.getNodeModelById('locked_g') as DynamicGroupNodeModel
    const child = lf.getNodeModelById('locked_child')!
    const dg = getDynamicGroup(lf)

    expect(group.children.has('locked_child')).toBe(true)
    expect(dg.getGroupByNodeId('locked_child')?.id).toBe('locked_g')

    child.moveTo(430, 250)
    simulateNodeDrop(lf, 'locked_child')

    expect(group.children.has('locked_child')).toBe(true)
    expect(dg.getGroupByNodeId('locked_child')?.id).toBe('locked_g')
  })

  test('M5: after in-group drop, isRestrict still blocks dragging outside group', () => {
    const lf = createLockedGroupLF()
    lf.render(graphLockedGroupWithChild())

    const child = lf.getNodeModelById('locked_child')!

    child.moveTo(430, 250)
    simulateNodeDrop(lf, 'locked_child')

    const [moveX, moveY] = child.getMoveDistance(500, 0)

    expect(moveX).toBe(0)
    expect(moveY).toBe(0)
  })

  test('N1: nested addNode with children — outer children set stays consistent (#1673)', () => {
    const lf = createDynamicGroupLF()
    lf.render({
      nodes: [
        {
          id: 'default_group',
          type: 'dynamic-group',
          x: 400,
          y: 300,
          properties: {
            width: 420,
            height: 320,
            collapsedWidth: 80,
            collapsedHeight: 60,
            collapsible: true,
            isCollapsed: false,
            children: [],
          },
        },
      ],
      edges: [],
    })

    const parent = lf.getNodeModelById('default_group') as DynamicGroupNodeModel
    const x = parent.x
    const y = parent.y

    lf.addNode({
      id: 'api_rect',
      type: 'rect',
      x,
      y,
      text: 'api子',
    })
    lf.addNode({
      id: 'api_group',
      type: 'dynamic-group',
      x,
      y,
      text: 'api组',
      resizable: true,
      properties: {
        width: 200,
        height: 150,
        collapsedWidth: 80,
        collapsedHeight: 60,
        collapsible: true,
        isCollapsed: false,
        children: ['api_rect'],
      },
    })
    parent.addChild('api_group')

    const innerGroup = lf.getNodeModelById('api_group') as DynamicGroupNodeModel
    const rect = lf.getNodeModelById('api_rect')!

    expect(parent.children.has('api_group')).toBe(true)
    expect(parent.children.has('api_rect')).toBe(false)
    expect(innerGroup.children.has('api_rect')).toBe(true)
    expect(getDynamicGroup(lf).getGroupByNodeId('api_rect')?.id).toBe(
      'api_group',
    )

    const rectYBefore = rect.y
    parent.getMoveDistance(0, 20)

    expect(rect.y).toBe(rectYBefore + 20)
  })
})
