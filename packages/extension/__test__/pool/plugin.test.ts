/**
 * @jest-environment jsdom
 */
import {
  createPoolGraphWithNodeInLane,
  createPoolLF,
  createPoolWithTwoLanes,
} from './fixtures'

afterEach(() => {
  document.body.innerHTML = ''
})

const getPoolPlugin = (lf: any) => lf.extension.PoolElements as any

describe('pool plugin', () => {
  test('initializes lane membership from graph data on render', () => {
    const lf = createPoolLF()

    lf.render(createPoolGraphWithNodeInLane())

    const plugin = getPoolPlugin(lf)

    expect(plugin.getLaneByNodeId('rect_1')?.id).toBe('lane_1')
  })

  test('getLaneByBounds returns the matching lane', () => {
    const lf = createPoolLF()

    lf.render(createPoolWithTwoLanes())
    lf.addNode({
      id: 'rect_1',
      type: 'rect',
      x: 530,
      y: 170,
      width: 80,
      height: 40,
      text: '普通节点',
    })

    const plugin = getPoolPlugin(lf)
    const rect = lf.getNodeModelById('rect_1') as any

    expect(plugin.getLaneByBounds(rect.getBounds(), rect.getData())?.id).toBe(
      'lane_1',
    )
  })

  test('getLaneByBounds prefers the higher zIndex lane', () => {
    const lf = createPoolLF()

    lf.render({
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
            children: ['lane_1', 'lane_2'],
          },
          children: ['lane_1', 'lane_2'],
        },
        {
          id: 'lane_1',
          type: 'lane',
          x: 530,
          y: 260,
          width: 480,
          height: 240,
          zIndex: 1,
          text: '泳道1',
          properties: {
            parent: 'pool_1',
            direction: 'horizontal',
            isHorizontal: true,
          },
        },
        {
          id: 'lane_2',
          type: 'lane',
          x: 530,
          y: 260,
          width: 480,
          height: 240,
          zIndex: 5,
          text: '泳道2',
          properties: {
            parent: 'pool_1',
            direction: 'horizontal',
            isHorizontal: true,
          },
        },
      ],
      edges: [],
    })

    const plugin = getPoolPlugin(lf)

    expect(
      plugin.getLaneByBounds(
        {
          minX: 500,
          minY: 240,
          maxX: 560,
          maxY: 280,
        },
        { id: 'rect_probe', type: 'rect' },
      )?.id,
    ).toBe('lane_2')
  })

  test('reassigns a node to a new lane and updates parent metadata', () => {
    const lf = createPoolLF()

    lf.render(createPoolWithTwoLanes())
    lf.addNode({
      id: 'rect_1',
      type: 'rect',
      x: 530,
      y: 170,
      width: 80,
      height: 40,
      text: '普通节点',
    })

    const plugin = getPoolPlugin(lf)
    const lane1 = lf.getNodeModelById('lane_1') as any
    const lane2 = lf.getNodeModelById('lane_2') as any
    const rect = lf.getNodeModelById('rect_1') as any

    lf.graphModel.moveNode2Coordinate('rect_1', 530, 350)
    plugin.addNodeToGroup(rect.getData())

    expect(lane1.children.has('rect_1')).toBe(false)
    expect(lane2.children.has('rect_1')).toBe(true)
    expect(rect.properties.parent).toBe('lane_2')
    expect(plugin.getLaneByNodeId('rect_1')?.id).toBe('lane_2')
  })

  test('emits lane:not-allowed when the target lane rejects a node', () => {
    const lf = createPoolLF()

    lf.render(createPoolWithTwoLanes())
    lf.addNode({
      id: 'rect_1',
      type: 'rect',
      x: 120,
      y: 120,
      width: 80,
      height: 40,
      text: '普通节点',
    })

    const plugin = getPoolPlugin(lf)
    const lane2 = lf.getNodeModelById('lane_2') as any
    const rect = lf.getNodeModelById('rect_1') as any
    const onNotAllowed = jest.fn()

    lf.on('lane:not-allowed', onNotAllowed)
    jest.spyOn(lane2, 'isAllowAppendIn').mockReturnValue(false)

    lf.graphModel.moveNode2Coordinate('rect_1', 530, 350)
    plugin.addNodeToGroup(rect.getData())

    expect(onNotAllowed).toHaveBeenCalledTimes(1)
    expect(onNotAllowed.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        lane: expect.objectContaining({ id: 'lane_2' }),
        node: expect.objectContaining({ id: 'rect_1' }),
      }),
    )
  })
})
