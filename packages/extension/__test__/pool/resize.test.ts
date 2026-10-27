/**
 * @jest-environment jsdom
 */
import {
  createPoolLF,
  createPoolGraphWithNodeInLane,
  createPoolWithTwoLanes,
} from './fixtures'
import { cloneDeep } from 'lodash-es'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('pool lane resize', () => {
  test('keeps pool itself non-resizable', () => {
    const lf = createPoolLF()
    lf.render(createPoolWithTwoLanes('horizontal'))

    const pool = lf.getNodeModelById('pool_1') as any

    expect(pool.resizable).toBe(false)
  })

  test('rejects pool resize from resize rules', () => {
    const lf = createPoolLF()
    lf.render(createPoolWithTwoLanes('horizontal'))

    const pool = lf.getNodeModelById('pool_1') as any
    const rules = (lf.graphModel as any).nodeResizeRules

    expect(
      rules.every((rule: any) =>
        rule(pool, 0, 0, pool.width + 20, pool.height),
      ),
    ).toBe(false)
  })

  test('horizontal lane height resize changes only that lane height and pool height', () => {
    const lf = createPoolLF()
    lf.render(createPoolWithTwoLanes('horizontal'))

    const pool = lf.getNodeModelById('pool_1') as any
    const lane1 = lf.getNodeModelById('lane_1') as any
    const lane2 = lf.getNodeModelById('lane_2') as any
    const lane2Height = lane2.height

    lane1.height += 40
    pool.layoutLanesByOrder({
      reason: 'resize',
      resizedLaneId: 'lane_1',
      resizedAxis: 'height',
    })

    expect(lane2.height).toBe(lane2Height)
    expect(pool.height).toBe(lane1.height + lane2.height)
  })

  test('keeps the opposite pool boundary fixed for a bottom resize', () => {
    const lf = createPoolLF()
    lf.render(createPoolWithTwoLanes('horizontal'))

    const pool = lf.getNodeModelById('pool_1') as any
    const lane2 = lf.getNodeModelById('lane_2') as any
    const top = pool.y - pool.height / 2
    const bottom = pool.y + pool.height / 2

    lane2.height += 40
    pool.layoutLanesByOrder({
      reason: 'resize',
      resizedLaneId: lane2.id,
      resizedAxis: 'height',
      resizeIndex: 2,
    } as any)

    expect(pool.y - pool.height / 2).toBe(top)
    expect(pool.y + pool.height / 2).toBe(bottom + 40)
  })

  test('does not move children of the lane being resized', () => {
    const lf = createPoolLF()
    const graph = createPoolGraphWithNodeInLane() as any
    const lane1Config = graph.nodes.find((node: any) => node.id === 'lane_1')
    const lane2Config = graph.nodes.find((node: any) => node.id === 'lane_2')
    const childConfig = graph.nodes.find((node: any) => node.id === 'rect_1')
    lane1Config.children = []
    lane1Config.properties.children = []
    lane2Config.children = ['rect_1']
    lane2Config.properties.children = ['rect_1']
    childConfig.properties.parent = 'lane_2'
    childConfig.y = lane2Config.y
    lf.render(graph)

    const pool = lf.getNodeModelById('pool_1') as any
    const lane = lf.getNodeModelById('lane_2') as any
    const child = lf.getNodeModelById('rect_1') as any
    const childPosition = { x: child.x, y: child.y }

    lane.height += 40
    pool.layoutLanesByOrder({
      reason: 'resize',
      resizedLaneId: lane.id,
      resizedAxis: 'height',
    })

    expect({ x: child.x, y: child.y }).toEqual(childPosition)
  })

  test('horizontal lane width resize syncs all lane widths', () => {
    const lf = createPoolLF()
    lf.render(createPoolWithTwoLanes('horizontal'))

    const pool = lf.getNodeModelById('pool_1') as any
    const lane1 = lf.getNodeModelById('lane_1') as any
    const lane2 = lf.getNodeModelById('lane_2') as any

    lane1.width += 60
    pool.layoutLanesByOrder({
      reason: 'resize',
      resizedLaneId: 'lane_1',
      resizedAxis: 'width',
    })

    expect(lane2.width).toBe(lane1.width)
    expect(pool.width).toBe(lane1.width + pool.titleSize)
  })

  test('allows a horizontal lane to shrink after its width was expanded', () => {
    const lf = createPoolLF()
    lf.render(createPoolWithTwoLanes('horizontal'))

    const pool = lf.getNodeModelById('pool_1') as any
    const lane1 = lf.getNodeModelById('lane_1') as any
    const lane2 = lf.getNodeModelById('lane_2') as any
    const emitResize = (preData: any) =>
      lf.graphModel.eventCenter.emit('node:resize', {
        preData,
        data: lane1.getData(),
        model: lane1,
        deltaX: 0,
        deltaY: 0,
        index: 2,
      })

    let preData = cloneDeep(lane1.getData())
    lane1.width += 80
    emitResize(preData)

    preData = cloneDeep(lane1.getData())
    lane1.width -= 120
    const shrunkWidth = lane1.width
    emitResize(preData)

    expect(lane1.width).toBe(shrunkWidth)
    expect(lane2.width).toBe(lane1.width)
    expect(pool.width).toBe(lane1.width + pool.titleSize)
  })

  test('allows a vertical lane to shrink after its height was expanded', () => {
    const lf = createPoolLF()
    lf.render(createPoolWithTwoLanes('vertical'))

    const pool = lf.getNodeModelById('pool_1') as any
    const lane1 = lf.getNodeModelById('lane_1') as any
    const lane2 = lf.getNodeModelById('lane_2') as any
    const emitResize = (preData: any) =>
      lf.graphModel.eventCenter.emit('node:resize', {
        preData,
        data: lane1.getData(),
        model: lane1,
        deltaX: 0,
        deltaY: 0,
        index: 2,
      })

    let preData = cloneDeep(lane1.getData())
    lane1.height += 80
    emitResize(preData)

    preData = cloneDeep(lane1.getData())
    lane1.height -= 120
    const shrunkHeight = lane1.height
    emitResize(preData)

    expect(lane1.height).toBe(shrunkHeight)
    expect(lane2.height).toBe(lane1.height)
    expect(pool.height).toBe(lane1.height + pool.titleSize)
  })

  test('does not shrink a lane below its child bounds', () => {
    const lf = createPoolLF()
    lf.render(createPoolGraphWithNodeInLane())

    const plugin = lf.extension.PoolElements as any
    const lane = lf.getNodeModelById('lane_1') as any

    expect(plugin.checkGroupBoundsWithChildren(lane, 0, 0, 10, 10)).toBe(false)
  })
})
