/**
 * @jest-environment jsdom
 */
import {
  createPoolLF,
  createPoolWithTwoLanes,
  getPoolAndLanes,
} from './fixtures'

afterEach(() => {
  document.body.innerHTML = ''
})

const getLaneIdsByAxis = (pool: any) =>
  pool
    .getLanes()
    .slice()
    .sort((a: any, b: any) => (pool.isHorizontal ? a.y - b.y : a.x - b.x))
    .map((lane: any) => lane.id)

describe('pool integration', () => {
  test('adds horizontal lanes above and below in visual order and updates pool size', () => {
    const lf = createPoolLF()

    lf.render(createPoolWithTwoLanes('horizontal'))

    const { pool } = getPoolAndLanes(lf)
    const lane2 = lf.getNodeModelById('lane_2') as any
    const initialWidth = pool.width
    const initialHeight = pool.height
    const insertedAbove = pool.addChildAbove(lane2.getData())
    const insertedBelow = pool.addChildBelow(lane2.getData())

    expect(getLaneIdsByAxis(pool)).toEqual([
      'lane_1',
      insertedAbove.id,
      'lane_2',
      insertedBelow.id,
    ])
    expect(pool.width).toBe(initialWidth)
    expect(pool.height).toBe(initialHeight + lane2.height * 2)
  })

  test('adds vertical lanes left and right in visual order and updates pool size', () => {
    const lf = createPoolLF()

    lf.render(createPoolWithTwoLanes('vertical'))

    const { pool } = getPoolAndLanes(lf)
    const lane2 = lf.getNodeModelById('lane_2') as any
    const initialWidth = pool.width
    const initialHeight = pool.height
    const insertedLeft = pool.addChildLeft(lane2.getData())
    const insertedRight = pool.addChildRight(lane2.getData())

    expect(getLaneIdsByAxis(pool)).toEqual([
      'lane_1',
      insertedLeft.id,
      'lane_2',
      insertedRight.id,
    ])
    expect(pool.width).toBe(initialWidth + lane2.width * 2)
    expect(pool.height).toBe(initialHeight)
  })

  test('deleting horizontal lanes shrinks the pool but keeps at least one lane', () => {
    const lf = createPoolLF()

    lf.render(createPoolWithTwoLanes('horizontal'))

    const { pool } = getPoolAndLanes(lf)
    const initialWidth = pool.width

    pool.deleteChild('lane_2')

    expect(getLaneIdsByAxis(pool)).toEqual(['lane_1'])
    expect(pool.width).toBe(initialWidth)
    expect(pool.height).toBe((lf.getNodeModelById('lane_1') as any).height)

    pool.deleteChild('lane_1')

    expect(getLaneIdsByAxis(pool)).toEqual(['lane_1'])
    expect(lf.getNodeModelById('lane_1')).toBeDefined()
  })

  test('deleting vertical lanes shrinks the pool but keeps at least one lane', () => {
    const lf = createPoolLF()

    lf.render(createPoolWithTwoLanes('vertical'))

    const { pool } = getPoolAndLanes(lf)
    const initialHeight = pool.height

    pool.deleteChild('lane_2')

    expect(getLaneIdsByAxis(pool)).toEqual(['lane_1'])
    expect(pool.width).toBe((lf.getNodeModelById('lane_1') as any).width)
    expect(pool.height).toBe(initialHeight)

    pool.deleteChild('lane_1')

    expect(getLaneIdsByAxis(pool)).toEqual(['lane_1'])
    expect(lf.getNodeModelById('lane_1')).toBeDefined()
  })

  test('exports pool and lane relationship fields from graph data', () => {
    const lf = createPoolLF()

    lf.render(createPoolWithTwoLanes('vertical'))

    const { pool } = getPoolAndLanes(lf)
    const lane2 = lf.getNodeModelById('lane_2') as any
    const addedLane = pool.addChildRight(lane2.getData()) as any
    const graphData = lf.getGraphData()
    const poolData = graphData.nodes.find((node) => node.id === pool.id) as any
    const laneModels = pool.getLanes() as any[]
    const laneDataList = graphData.nodes.filter((node) =>
      laneModels.some((lane) => lane.id === node.id),
    ) as any[]
    const exportedLaneIds = laneDataList.map((laneData) => laneData.id).sort()
    const laneModelIds = laneModels.map((lane) => lane.id).sort()

    expect(poolData.children).toEqual(Array.from(pool.children))
    expect(poolData.children).toContain(addedLane.id)
    expect(exportedLaneIds).toEqual(laneModelIds)

    laneDataList.forEach((laneData) => {
      const laneModel = laneModels.find((lane) => lane.id === laneData.id)

      expect(laneData.properties.parent).toBe(pool.id)
      expect(laneData.properties.direction).toBe(laneModel.properties.direction)
      expect(laneData.properties.width).toBe(laneModel.width)
      expect(laneData.properties.height).toBe(laneModel.height)
    })
  })
})
