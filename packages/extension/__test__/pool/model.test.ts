/**
 * @jest-environment jsdom
 */
import { poolConfig } from '../../src/pool/constant'
import {
  createHorizontalPoolGraph,
  createPoolWithTwoLanes,
  createPoolLF,
  createVerticalPoolGraph,
  getPoolAndLanes,
} from './fixtures'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('pool model', () => {
  test('creates a real default lane for a horizontal pool', () => {
    const lf = createPoolLF()

    lf.render(createHorizontalPoolGraph())

    const { pool, lanes } = getPoolAndLanes(lf)
    const [lane] = lanes

    expect(document.body.contains(lf.container)).toBe(true)
    expect(pool).toBeDefined()
    expect(lanes).toHaveLength(1)
    expect(lane.properties.parent).toBe(pool.id)
    expect(pool.children.has(lane.id)).toBe(true)
    expect(lane.width).toBe(pool.width - poolConfig.titleSize)
    expect(lane.height).toBe(pool.height)
  })

  test('creates a real default lane for a vertical pool', () => {
    const lf = createPoolLF()

    lf.render(createVerticalPoolGraph())

    const { pool, lanes } = getPoolAndLanes(lf)
    const [lane] = lanes

    expect(pool).toBeDefined()
    expect(lanes).toHaveLength(1)
    expect(lane.properties.parent).toBe(pool.id)
    expect(pool.children.has(lane.id)).toBe(true)
    expect(lane.width).toBe(pool.width)
    expect(lane.height).toBe(pool.height - poolConfig.titleSize)
  })

  test('exports lane contract fields', () => {
    const lf = createPoolLF()

    lf.render(createHorizontalPoolGraph())

    const { lanes } = getPoolAndLanes(lf)
    const [lane] = lanes
    const data = lane.getData()

    expect(data.properties.width).toBe(lane.width)
    expect(data.properties.height).toBe(lane.height)
    expect(data.properties.processRef).toBe('')
    expect(data.properties.direction).toBeDefined()
    expect(data.properties.direction).toBe(lane.properties.direction)
  })

  test('rejects lane nesting and allows normal nodes', () => {
    const lf = createPoolLF()

    lf.render(createPoolWithTwoLanes())
    lf.addNode({
      id: 'rect_1',
      type: 'rect',
      x: 120,
      y: 120,
      text: '普通节点',
    })

    const lane = lf.getNodeModelById('lane_1') as any
    const nestedLane = lf.getNodeModelById('lane_2') as any
    const rect = lf.getNodeModelById('rect_1') as any

    expect(lane.isAllowAppendIn(nestedLane.getData())).toBe(false)
    expect(lane.isAllowAppendIn(rect.getData())).toBe(true)
  })
})
