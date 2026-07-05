/**
 * @jest-environment jsdom
 */
import LogicFlow from '@logicflow/core'
import { DynamicGroup, DynamicGroupNodeModel } from '../../src/dynamic-group'
import {
  createDynamicGroupLF,
  findEdgeBetween,
  getVirtualEdges,
  graphWithSingleExternalEdge,
} from './fixtures'

function getDynamicGroup(lf: LogicFlow) {
  return lf.graphModel.dynamicGroup as DynamicGroup
}

function graphWithGroupAndChild() {
  return {
    nodes: [
      {
        id: 'group_1',
        type: 'dynamic-group',
        x: 420,
        y: 220,
        properties: {
          width: 360,
          height: 220,
          collapsedWidth: 80,
          collapsedHeight: 60,
          collapsible: true,
          isCollapsed: false,
          children: ['inner'],
        },
      },
      {
        id: 'inner',
        type: 'rect',
        x: 420,
        y: 220,
        properties: { width: 80, height: 50 },
      },
    ],
    edges: [],
  }
}

function graphWithNestedGroups() {
  return {
    nodes: [
      {
        id: 'parent_group',
        type: 'dynamic-group',
        x: 480,
        y: 280,
        properties: {
          width: 480,
          height: 360,
          collapsedWidth: 80,
          collapsedHeight: 60,
          collapsible: true,
          isCollapsed: false,
          children: ['child_group'],
        },
      },
      {
        id: 'child_group',
        type: 'dynamic-group',
        x: 480,
        y: 280,
        properties: {
          width: 220,
          height: 160,
          collapsedWidth: 80,
          collapsedHeight: 60,
          collapsible: true,
          isCollapsed: false,
          children: ['leaf_rect'],
        },
      },
      {
        id: 'leaf_rect',
        type: 'rect',
        x: 480,
        y: 280,
        properties: { width: 80, height: 50 },
      },
    ],
    edges: [],
  }
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('dynamic-group delete behavior (cascadeDeleteChildren)', () => {
  test('D1: default cascadeDeleteChildren deletes children when group is deleted', () => {
    const lf = createDynamicGroupLF()
    lf.render(graphWithGroupAndChild())

    lf.deleteNode('group_1')

    expect(lf.getNodeModelById('group_1')).toBeUndefined()
    expect(lf.getNodeModelById('inner')).toBeUndefined()
  })

  test('D2: cascadeDeleteChildren false keeps children on canvas', () => {
    const lf = createDynamicGroupLF({ cascadeDeleteChildren: false })
    lf.render(graphWithGroupAndChild())

    lf.deleteNode('group_1')

    expect(lf.getNodeModelById('group_1')).toBeUndefined()
    expect(lf.getNodeModelById('inner')).toBeDefined()
    expect(getDynamicGroup(lf).getGroupByNodeId('inner')).toBeUndefined()
  })

  test('D3: cascadeDeleteChildren false preserves edges connected to released children', () => {
    const lf = createDynamicGroupLF({ cascadeDeleteChildren: false })
    lf.render(graphWithSingleExternalEdge())

    lf.deleteNode('group_1')

    expect(lf.getNodeModelById('inner')).toBeDefined()
    expect(findEdgeBetween(lf, 'outer', 'inner')).toBeDefined()
    expect(lf.getEdgeModelById('e_outer_inner')?.visible).toBe(true)
  })

  test('D4: nested groups — parent false keeps child group and its members', () => {
    const lf = createDynamicGroupLF({ cascadeDeleteChildren: false })
    lf.render(graphWithNestedGroups())

    const childGroup = lf.getNodeModelById(
      'child_group',
    ) as DynamicGroupNodeModel

    lf.deleteNode('parent_group')

    expect(lf.getNodeModelById('parent_group')).toBeUndefined()
    expect(lf.getNodeModelById('child_group')).toBeDefined()
    expect(lf.getNodeModelById('leaf_rect')).toBeDefined()
    expect(childGroup.children.has('leaf_rect')).toBe(true)
    expect(getDynamicGroup(lf).getGroupByNodeId('leaf_rect')?.id).toBe(
      'child_group',
    )
    expect(getDynamicGroup(lf).getGroupByNodeId('child_group')).toBeUndefined()
  })

  test('D5: collapsed group with cascadeDeleteChildren false releases visible members and edges', () => {
    const lf = createDynamicGroupLF({ cascadeDeleteChildren: false })
    lf.render(graphWithSingleExternalEdge())

    const group = lf.getNodeModelById('group_1') as DynamicGroupNodeModel
    group.toggleCollapse(true)

    expect(lf.getNodeModelById('inner')?.visible).toBe(false)
    expect(getVirtualEdges(lf).length).toBe(1)

    lf.deleteNode('group_1')

    expect(lf.getNodeModelById('group_1')).toBeUndefined()
    expect(lf.getNodeModelById('inner')?.visible).toBe(true)
    expect(getVirtualEdges(lf).length).toBe(0)
    expect(findEdgeBetween(lf, 'outer', 'inner')).toBeDefined()
    expect(lf.getEdgeModelById('e_outer_inner')?.visible).toBe(true)
  })

  test('D6: removeChild then delete empty group — child remains selectable (#2194)', () => {
    const lf = createDynamicGroupLF()
    lf.render(graphWithGroupAndChild())

    const group = lf.getNodeModelById('group_1') as DynamicGroupNodeModel
    Array.from(group.children).forEach((childId) => {
      group.removeChild(childId)
    })

    lf.deleteNode('group_1')

    expect(lf.getNodeModelById('inner')).toBeDefined()
    expect(getDynamicGroup(lf).getGroupByNodeId('inner')).toBeUndefined()

    expect(() => {
      lf.selectElementById('inner')
    }).not.toThrow()
    expect(lf.getNodeModelById('inner')?.isSelected).toBe(true)
  })

  test('D7: releaseGroupMembers is called exactly once when cascadeDeleteChildren=false', () => {
    const lf = createDynamicGroupLF({ cascadeDeleteChildren: false })
    lf.render(graphWithGroupAndChild())

    const dg = getDynamicGroup(lf)
    const spy = jest.spyOn(dg, 'releaseGroupMembers')

    lf.deleteNode('group_1')

    expect(spy).toHaveBeenCalledTimes(1)
  })
})
