/**
 * @jest-environment jsdom
 */
import { poolConfig } from '../../src/pool/constant'
import { mapLaneChildRelativePositions } from '../../src/pool/LaneModel'
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

  test('captures and restores lane child positions relative to the lane', () => {
    const lf = createPoolLF()
    lf.render(createPoolWithTwoLanes())
    const lane = lf.getNodeModelById('lane_1') as any
    const rect = lf.addNode({
      id: 'rect_1',
      type: 'rect',
      x: lane.x + 80,
      y: lane.y + 30,
      text: '普通节点',
    }) as any
    lane.addChild(rect.id)

    const snapshot = lane.captureChildrenRelativePositions()
    lane.moveTo(lane.x + 200, lane.y + 100, true)
    rect.moveTo(rect.x + 30, rect.y - 20, true)

    lane.restoreChildrenRelativePositions(snapshot)

    expect(rect.x - lane.x).toBe(80)
    expect(rect.y - lane.y).toBe(30)
  })

  test('maps lane child relative positions from source nodes to copied nodes', () => {
    const mapped = mapLaneChildRelativePositions(
      {
        source_child_1: { dx: 80, dy: 30 },
        source_child_2: { dx: -40, dy: 10 },
        missing_child: { dx: 999, dy: 999 },
      },
      {
        source_child_1: 'copied_child_1',
        source_child_2: 'copied_child_2',
      },
    )

    expect(mapped).toEqual({
      copied_child_1: { dx: 80, dy: 30 },
      copied_child_2: { dx: -40, dy: 10 },
    })
  })

  test('shows the resize-style dashed outline without resize controls when selected', async () => {
    const lf = createPoolLF()
    lf.render(createHorizontalPoolGraph())

    const pool = lf.getNodeModelById('pool_1') as any

    expect(pool.resizable).toBe(false)
    expect(lf.container.querySelector('.lf-pool-selection-outline')).toBeNull()

    lf.selectElementById(pool.id)
    await Promise.resolve()

    const outline = lf.container.querySelector('.lf-pool-selection-outline')
    expect(outline).not.toBeNull()
    expect(outline?.getAttribute('width')).toBe(String(pool.width + 10))
    expect(outline?.getAttribute('height')).toBe(String(pool.height + 10))
    expect(outline?.getAttribute('stroke-dasharray')).toBe('4,4')
    expect(lf.container.querySelector('.lf-resize-control-group')).toBeNull()
  })

  test('keeps the dashed selection outline after the pool is collapsed', async () => {
    const lf = createPoolLF()
    lf.render(createHorizontalPoolGraph())

    const pool = lf.getNodeModelById('pool_1') as any
    pool.toggleCollapse(true)
    lf.selectElementById(pool.id)
    await Promise.resolve()

    expect(
      lf.container.querySelector('.lf-pool-selection-outline'),
    ).not.toBeNull()
  })
})
