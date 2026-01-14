import LogicFlow from '@logicflow/core'
import { PoolElements } from '../src/pool'

function setupLF() {
  const container = document.createElement('div')
  Object.assign(container.style, { width: '800px', height: '600px' })
  const lf = new LogicFlow({
    container,
    width: 800,
    height: 600,
  } as any)
  // 注册泳池/泳道
  ;(PoolElements as any).install(lf)
  return lf
}

function getLanesSortedByY(lf: LogicFlow, poolId: string) {
  const poolModel: any = lf.getNodeModelById(poolId)
  const lanes: any[] = poolModel.getLaneChildren()
  return lanes.slice().sort((a, b) => a.y - b.y)
}

function getLanesSortedByX(lf: LogicFlow, poolId: string) {
  const poolModel: any = lf.getNodeModelById(poolId)
  const lanes: any[] = poolModel.getLaneChildren()
  return lanes.slice().sort((a, b) => a.x - b.x)
}

function getDomLaneOrder(lf: LogicFlow, poolId: string) {
  const poolModel: any = lf.getNodeModelById(poolId)
  const children = Array.from(poolModel.children)
  const elements = lf.graphModel.sortElements.filter(
    (el: any) => el.type === 'lane' && children.includes(el.id),
  )
  return elements.map((el: any) => el.id)
}

describe('Pool lane add ordering', () => {
  test('horizontal: add above inserts before selected lane', async () => {
    const lf = setupLF()
    const pool = lf.addNode({
      type: 'pool',
      x: 400,
      y: 300,
      properties: {
        direction: 'horizontal',
        width: 600,
        height: 300,
      },
    }) as any
    // 等待默认泳道创建
    await new Promise((r) => setTimeout(r, 0))

    // 补充两条泳道共3条
    pool.addChildBelow()
    pool.addChildBelow()
    pool.resizeChildren()

    const initial = getLanesSortedByY(lf, pool.id)
    expect(initial.length).toBe(3)
    const middle = initial[1]
    lf.selectElementById(middle.id)

    const newLane: any = pool.addChildAbove({ id: middle.id })
    pool.resizeChildren('above', newLane.id)

    const after = getLanesSortedByY(lf, pool.id)
    const afterIds = after.map((l) => l.id)
    const expected = [initial[0].id, newLane.id, middle.id, initial[2].id]
    expect(afterIds).toEqual(expected)

    const domOrder = getDomLaneOrder(lf, pool.id)
    expect(domOrder).toEqual(afterIds)
  })

  test('horizontal: add below inserts after selected lane', async () => {
    const lf = setupLF()
    const pool = lf.addNode({
      type: 'pool',
      x: 400,
      y: 300,
      properties: {
        direction: 'horizontal',
        width: 600,
        height: 300,
      },
    }) as any
    await new Promise((r) => setTimeout(r, 0))
    pool.addChildBelow()
    pool.addChildBelow()
    pool.resizeChildren()

    const initial = getLanesSortedByY(lf, pool.id)
    const middle = initial[1]
    lf.selectElementById(middle.id)

    const newLane: any = pool.addChildBelow({ id: middle.id })
    pool.resizeChildren('below', newLane.id)

    const after = getLanesSortedByY(lf, pool.id)
    const afterIds = after.map((l) => l.id)
    const expected = [initial[0].id, middle.id, newLane.id, initial[2].id]
    expect(afterIds).toEqual(expected)
    const domOrder = getDomLaneOrder(lf, pool.id)
    expect(domOrder).toEqual(afterIds)
  })

  test('vertical: add left inserts before selected lane', async () => {
    const lf = setupLF()
    const pool = lf.addNode({
      type: 'pool',
      x: 400,
      y: 300,
      properties: {
        direction: 'vertical',
        width: 600,
        height: 300,
      },
    }) as any
    await new Promise((r) => setTimeout(r, 0))
    pool.addChildRight()
    pool.addChildRight()
    pool.resizeChildren()

    const initial = getLanesSortedByX(lf, pool.id)
    const middle = initial[1]
    lf.selectElementById(middle.id)

    const newLane: any = pool.addChildLeft({ id: middle.id })
    pool.resizeChildren('left', newLane.id)

    const after = getLanesSortedByX(lf, pool.id)
    const afterIds = after.map((l) => l.id)
    const expected = [initial[0].id, newLane.id, middle.id, initial[2].id]
    expect(afterIds).toEqual(expected)
    const domOrder = getDomLaneOrder(lf, pool.id)
    expect(domOrder).toEqual(afterIds)
  })

  test('vertical: add right inserts after selected lane', async () => {
    const lf = setupLF()
    const pool = lf.addNode({
      type: 'pool',
      x: 400,
      y: 300,
      properties: {
        direction: 'vertical',
        width: 600,
        height: 300,
      },
    }) as any
    await new Promise((r) => setTimeout(r, 0))
    pool.addChildRight()
    pool.addChildRight()
    pool.resizeChildren()

    const initial = getLanesSortedByX(lf, pool.id)
    const middle = initial[1]
    lf.selectElementById(middle.id)

    const newLane: any = pool.addChildRight({ id: middle.id })
    pool.resizeChildren('right', newLane.id)

    const after = getLanesSortedByX(lf, pool.id)
    const afterIds = after.map((l) => l.id)
    const expected = [initial[0].id, middle.id, newLane.id, initial[2].id]
    expect(afterIds).toEqual(expected)
    const domOrder = getDomLaneOrder(lf, pool.id)
    expect(domOrder).toEqual(afterIds)
  })
})
