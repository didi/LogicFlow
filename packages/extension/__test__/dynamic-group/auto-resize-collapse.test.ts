/**
 * @jest-environment jsdom
 */
import { DynamicGroup, DynamicGroupNodeModel } from '../../src/dynamic-group'
import { createDynamicGroupLF } from './fixtures'

afterEach(() => {
  document.body.innerHTML = ''
})

function getDynamicGroup(lf: ReturnType<typeof createDynamicGroupLF>) {
  return lf.graphModel.dynamicGroup as DynamicGroup
}

function simulateAutoResizeAfterDrag(
  lf: ReturnType<typeof createDynamicGroupLF>,
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

function isBoundsInside(
  outer: { minX: number; minY: number; maxX: number; maxY: number },
  inner: { minX: number; minY: number; maxX: number; maxY: number },
) {
  return (
    outer.minX <= inner.minX &&
    outer.minY <= inner.minY &&
    outer.maxX >= inner.maxX &&
    outer.maxY >= inner.maxY
  )
}

describe('dynamic-group autoResize + collapse/expand', () => {
  test('collapse keeps top-left and expand restores auto-resized bounds', () => {
    const lf = createDynamicGroupLF()
    lf.render({
      nodes: [
        {
          id: 'group',
          type: 'dynamic-group',
          x: 300,
          y: 200,
          properties: {
            width: 320,
            height: 200,
            collapsedWidth: 80,
            collapsedHeight: 60,
            collapsible: true,
            isCollapsed: false,
            isRestrict: true,
            autoResize: true,
            children: ['child'],
          },
        },
        {
          id: 'child',
          type: 'rect',
          x: 300,
          y: 200,
          properties: { width: 80, height: 50 },
        },
      ],
    })

    const group = lf.getNodeModelById('group') as DynamicGroupNodeModel
    const child = lf.getNodeModelById('child')!

    simulateAutoResizeAfterDrag(lf, 'child', 450, 290)

    const expandedBounds = group.getBounds()
    expect(group.width).toBeGreaterThan(320)
    expect(group.height).toBeGreaterThan(200)
    expect(group.expandWidth).toBe(group.width)
    expect(group.expandHeight).toBe(group.height)
    expect(isBoundsInside(expandedBounds, child.getBounds())).toBe(true)

    const minXBeforeCollapse = expandedBounds.minX
    const minYBeforeCollapse = expandedBounds.minY

    group.toggleCollapse(true)
    const collapsedBounds = group.getBounds()
    expect(collapsedBounds.minX).toBeCloseTo(minXBeforeCollapse)
    expect(collapsedBounds.minY).toBeCloseTo(minYBeforeCollapse)

    group.toggleCollapse(false)
    expect(group.width).toBeCloseTo(expandedBounds.maxX - expandedBounds.minX)
    expect(group.height).toBeCloseTo(expandedBounds.maxY - expandedBounds.minY)
    expect(group.expandWidth).toBeCloseTo(group.width)
    expect(group.expandHeight).toBeCloseTo(group.height)
    expect(isBoundsInside(group.getBounds(), child.getBounds())).toBe(true)
  })

  test('autoResize expanding top-left keeps collapse anchor stable', () => {
    const lf = createDynamicGroupLF()
    lf.render({
      nodes: [
        {
          id: 'group',
          type: 'dynamic-group',
          x: 300,
          y: 200,
          properties: {
            width: 320,
            height: 200,
            collapsedWidth: 80,
            collapsedHeight: 60,
            collapsible: true,
            isCollapsed: false,
            isRestrict: true,
            autoResize: true,
            children: ['child'],
          },
        },
        {
          id: 'child',
          type: 'rect',
          x: 300,
          y: 200,
          properties: { width: 80, height: 50 },
        },
      ],
    })

    const group = lf.getNodeModelById('group') as DynamicGroupNodeModel

    simulateAutoResizeAfterDrag(lf, 'child', 180, 120)

    const expandedBounds = group.getBounds()
    const minXBeforeCollapse = expandedBounds.minX
    const minYBeforeCollapse = expandedBounds.minY

    group.toggleCollapse(true)
    const collapsedBounds = group.getBounds()
    expect(collapsedBounds.minX).toBeCloseTo(minXBeforeCollapse)
    expect(collapsedBounds.minY).toBeCloseTo(minYBeforeCollapse)

    group.toggleCollapse(false)
    expect(group.getBounds().minX).toBeCloseTo(minXBeforeCollapse)
    expect(group.getBounds().minY).toBeCloseTo(minYBeforeCollapse)
  })
})
