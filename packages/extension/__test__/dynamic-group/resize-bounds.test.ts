/**
 * @jest-environment jsdom
 */
import LogicFlow from '@logicflow/core'
import { DynamicGroup, DynamicGroupNodeModel } from '../../src/dynamic-group'
import {
  getChildrenBounds,
  isGroupBoundsContainsChildren,
} from '../../src/dynamic-group/utils'
import { createDynamicGroupLF } from './fixtures'

function getDynamicGroup(lf: LogicFlow) {
  return lf.graphModel.dynamicGroup as DynamicGroup
}

function simulateAutoResizeAfterDrag(
  lf: LogicFlow,
  childId: string,
  targetX: number,
  targetY: number,
) {
  const child = lf.getNodeModelById(childId)!
  const staleData = child.getData()
  const deltaX = targetX - staleData.x
  const deltaY = targetY - staleData.y

  child.moveTo(targetX, targetY)
  getDynamicGroup(lf).onNodeMove({
    deltaX,
    deltaY,
    data: staleData,
  })
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('dynamic-group resize bounds', () => {
  test('getChildrenBounds returns union of direct child bounds', () => {
    const lf = createDynamicGroupLF()
    lf.render({
      nodes: [
        {
          id: 'group_rb',
          type: 'dynamic-group',
          x: 420,
          y: 280,
          properties: {
            width: 380,
            height: 260,
            collapsedWidth: 80,
            collapsedHeight: 60,
            collapsible: true,
            isCollapsed: false,
            children: ['child_a', 'child_b'],
          },
        },
        {
          id: 'child_a',
          type: 'rect',
          x: 340,
          y: 240,
          properties: { width: 100, height: 60 },
        },
        {
          id: 'child_b',
          type: 'rect',
          x: 500,
          y: 320,
          properties: { width: 100, height: 60 },
        },
      ],
    })

    const group = lf.getNodeModelById('group_rb') as DynamicGroupNodeModel
    expect(Array.from(group.children)).toEqual(['child_a', 'child_b'])
    expect(lf.getNodeModelById('child_a')).toBeDefined()
    expect(lf.getNodeModelById('child_b')).toBeDefined()

    const bounds = getChildrenBounds(group, (id) => lf.getNodeModelById(id))

    expect(bounds).toEqual({
      minX: 290,
      minY: 210,
      maxX: 550,
      maxY: 350,
    })
  })

  test('getChildrenBounds returns null when group has no children', () => {
    const lf = createDynamicGroupLF()
    lf.render({
      nodes: [
        {
          id: 'empty_group',
          type: 'dynamic-group',
          x: 200,
          y: 200,
          properties: {
            width: 200,
            height: 120,
            collapsedWidth: 80,
            collapsedHeight: 60,
            collapsible: true,
            isCollapsed: false,
          },
        },
      ],
    })

    const group = lf.getNodeModelById('empty_group') as DynamicGroupNodeModel
    expect(getChildrenBounds(group, (id) => lf.getNodeModelById(id))).toBeNull()
  })

  test('R1: isRestrict=false blocks shrinking below children footprint', () => {
    const lf = createDynamicGroupLF()
    lf.render({
      nodes: [
        {
          id: 'group_rb',
          type: 'dynamic-group',
          x: 420,
          y: 280,
          properties: {
            width: 380,
            height: 260,
            collapsedWidth: 80,
            collapsedHeight: 60,
            collapsible: true,
            isCollapsed: false,
            isRestrict: false,
            children: ['child_a', 'child_b'],
          },
        },
        {
          id: 'child_a',
          type: 'rect',
          x: 340,
          y: 240,
          properties: { width: 100, height: 60 },
        },
        {
          id: 'child_b',
          type: 'rect',
          x: 500,
          y: 320,
          properties: { width: 100, height: 60 },
        },
      ],
    })

    const group = lf.getNodeModelById('group_rb') as DynamicGroupNodeModel
    const allowed = getDynamicGroup(lf).checkGroupBoundsWithChildren(
      group,
      40,
      40,
      200,
      120,
    )

    expect(allowed).toBe(false)
  })

  test('R2: empty group allows any shrink resize', () => {
    const lf = createDynamicGroupLF()
    lf.render({
      nodes: [
        {
          id: 'empty_group',
          type: 'dynamic-group',
          x: 200,
          y: 200,
          properties: {
            width: 200,
            height: 120,
            collapsedWidth: 80,
            collapsedHeight: 60,
            collapsible: true,
            isCollapsed: false,
          },
        },
      ],
    })

    const group = lf.getNodeModelById('empty_group') as DynamicGroupNodeModel
    const allowed = getDynamicGroup(lf).checkGroupBoundsWithChildren(
      group,
      40,
      40,
      80,
      40,
    )

    expect(allowed).toBe(true)
  })

  test('R3: nested dynamic-group child uses its own getBounds()', () => {
    const lf = createDynamicGroupLF()
    lf.render({
      nodes: [
        {
          id: 'outer_group',
          type: 'dynamic-group',
          x: 420,
          y: 280,
          properties: {
            width: 420,
            height: 300,
            collapsedWidth: 80,
            collapsedHeight: 60,
            collapsible: true,
            isCollapsed: false,
            children: ['inner_group'],
          },
        },
        {
          id: 'inner_group',
          type: 'dynamic-group',
          x: 420,
          y: 280,
          properties: {
            width: 220,
            height: 160,
            collapsedWidth: 80,
            collapsedHeight: 60,
            collapsible: true,
            isCollapsed: false,
            children: ['inner_rect'],
          },
        },
        {
          id: 'inner_rect',
          type: 'rect',
          x: 420,
          y: 280,
          properties: { width: 80, height: 50 },
        },
      ],
    })

    const outer = lf.getNodeModelById('outer_group') as DynamicGroupNodeModel
    const inner = lf.getNodeModelById('inner_group') as DynamicGroupNodeModel
    const childrenBounds = getChildrenBounds(outer, (id) =>
      lf.getNodeModelById(id),
    )

    expect(childrenBounds).toEqual(inner.getBounds())
  })

  test('R4: autoResize still expands parent when child moves near edge', () => {
    const lf = createDynamicGroupLF()
    lf.render({
      nodes: [
        {
          id: 'group_rb',
          type: 'dynamic-group',
          x: 420,
          y: 280,
          properties: {
            width: 380,
            height: 260,
            collapsedWidth: 80,
            collapsedHeight: 60,
            collapsible: true,
            isCollapsed: false,
            isRestrict: true,
            autoResize: true,
            children: ['child_b'],
          },
        },
        {
          id: 'child_b',
          type: 'rect',
          x: 500,
          y: 320,
          properties: { width: 100, height: 60 },
        },
      ],
    })

    const group = lf.getNodeModelById('group_rb') as DynamicGroupNodeModel
    const widthBefore = group.width
    const heightBefore = group.height

    simulateAutoResizeAfterDrag(lf, 'child_b', 580, 390)

    expect(group.width).toBeGreaterThan(widthBefore)
    expect(group.height).toBeGreaterThan(heightBefore)
  })

  test('R5: isRestrict=false still blocks shrink via graph resize rules', () => {
    const lf = createDynamicGroupLF()
    lf.render({
      nodes: [
        {
          id: 'group_rb',
          type: 'dynamic-group',
          x: 420,
          y: 280,
          properties: {
            width: 380,
            height: 260,
            collapsedWidth: 80,
            collapsedHeight: 60,
            collapsible: true,
            isCollapsed: false,
            isRestrict: false,
            transformWithContainer: true,
            children: ['child_a', 'child_b'],
          },
        },
        {
          id: 'child_a',
          type: 'rect',
          x: 340,
          y: 240,
          properties: { width: 100, height: 60 },
        },
        {
          id: 'child_b',
          type: 'rect',
          x: 500,
          y: 320,
          properties: { width: 100, height: 60 },
        },
      ],
    })

    const group = lf.getNodeModelById('group_rb') as DynamicGroupNodeModel
    const allowed = group.isAllowResizeNode(40, 40, 200, 120)

    expect(allowed).toBe(false)
  })

  test('isGroupBoundsContainsChildren checks full containment', () => {
    expect(
      isGroupBoundsContainsChildren(
        { minX: 0, minY: 0, maxX: 200, maxY: 200 },
        { minX: 20, minY: 20, maxX: 180, maxY: 180 },
      ),
    ).toBe(true)
    expect(
      isGroupBoundsContainsChildren(
        { minX: 50, minY: 50, maxX: 150, maxY: 150 },
        { minX: 20, minY: 20, maxX: 180, maxY: 180 },
      ),
    ).toBe(false)
  })
})
