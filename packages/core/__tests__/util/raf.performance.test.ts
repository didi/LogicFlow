import { rafThrottle, timeThrottle } from '../../src/util/raf'

// 先定义简化的类型接口用于测试
interface Point {
  x: number
  y: number
}

// 简化版的折点压缩算法（测试用）
function testSimplifyPolyline(
  points: Point[],
  collinearEpsilon = 0.01,
): Point[] {
  if (points.length <= 2) return points.slice()

  const result = points.slice()
  let i = 1

  while (i < result.length - 1) {
    const p1 = result[i - 1]
    const p2 = result[i]
    const p3 = result[i + 1]

    const v1x = p2.x - p1.x
    const v1y = p2.y - p1.y
    const v2x = p3.x - p2.x
    const v2y = p3.y - p2.y

    const crossProduct = Math.abs(v1x * v2y - v1y * v2x)
    const magnitude = Math.sqrt(
      (v1x * v1x + v1y * v1y) * (v2x * v2x + v2y * v2y),
    )

    if (magnitude > 0 && crossProduct / magnitude < collinearEpsilon) {
      result.splice(i, 1)
    } else {
      i++
    }
  }

  return result
}

/**
 * 性能测试工具：模拟高频拖拽场景
 */
describe('路径更新性能测试', () => {
  let callCount = 0
  let lastResult: any = null

  const mockPathUpdate = (delta: { x: number; y: number }) => {
    callCount++
    lastResult = { x: delta.x, y: delta.y, timestamp: Date.now() }
    // 模拟一些计算开销
    for (let i = 0; i < 1000; i++) {
      Math.sqrt(i)
    }
  }

  beforeEach(() => {
    callCount = 0
    lastResult = null
  })

  describe('RAF节流测试', () => {
    it('应该将高频调用合并为每帧最多一次', (done) => {
      const throttledUpdate = rafThrottle(mockPathUpdate)

      // 模拟高频mousemove事件（100次）
      for (let i = 0; i < 100; i++) {
        throttledUpdate({ x: i, y: i * 2 })
      }

      // 等待一帧后检查
      requestAnimationFrame(() => {
        expect(callCount).toBe(1) // 应该只执行一次
        expect(lastResult).toEqual({
          x: 99,
          y: 198,
          timestamp: expect.any(Number),
        }) // 最后一次参数
        done()
      })
    })

    it('应该保证最终状态正确', (done) => {
      const throttledUpdate = rafThrottle(mockPathUpdate)

      throttledUpdate({ x: 10, y: 10 })
      throttledUpdate({ x: 20, y: 20 })
      throttledUpdate({ x: 30, y: 30 }) // 最后这个应该被执行

      requestAnimationFrame(() => {
        expect(lastResult.x).toBe(30)
        expect(lastResult.y).toBe(30)
        done()
      })
    })
  })

  describe('时间节流测试', () => {
    it('应该在指定时间间隔内最多执行一次', (done) => {
      const throttledUpdate = timeThrottle(mockPathUpdate, 50)

      // 快速连续调用
      throttledUpdate({ x: 1, y: 1 })
      throttledUpdate({ x: 2, y: 2 })
      throttledUpdate({ x: 3, y: 3 })

      // 立即检查：应该执行了第一次
      expect(callCount).toBe(1)
      expect(lastResult.x).toBe(1)

      // 等待时间间隔后检查
      setTimeout(() => {
        expect(callCount).toBe(2) // 应该执行了延迟的最后一次
        expect(lastResult.x).toBe(3) // 最后一次参数
        done()
      }, 100)
    })
  })

  describe('路径简化性能', () => {
    it('应该有效减少点数', () => {
      // 创建一个有很多冗余点的路径
      const redundantPoints: Array<{ x: number; y: number }> = []
      for (let i = 0; i <= 100; i += 10) {
        redundantPoints.push({ x: i, y: 0 }) // 水平线上的点
      }
      redundantPoints.push({ x: 100, y: 100 }) // 转折点

      const simplified = testSimplifyPolyline(redundantPoints, 0.01)

      expect(simplified.length).toBeLessThan(redundantPoints.length)
      expect(simplified.length).toBe(3) // 起点、转折点、终点
    })

    it('大量点的简化应该在合理时间内完成', () => {
      // 创建1000个点的路径，包含大量冗余的共线点
      const complexPoints: Array<{ x: number; y: number }> = []

      // 添加一段水平线（可以大幅简化）
      for (let i = 0; i < 300; i++) {
        complexPoints.push({ x: i, y: 0 })
      }

      // 添加一段垂直线（可以大幅简化）
      for (let i = 0; i < 300; i++) {
        complexPoints.push({ x: 300, y: i })
      }

      // 添加一段对角线（可以大幅简化）
      for (let i = 0; i < 300; i++) {
        complexPoints.push({ x: 300 + i, y: 300 + i })
      }

      // 添加一些真正的转折点
      complexPoints.push({ x: 600, y: 600 })
      complexPoints.push({ x: 700, y: 500 })

      // 再添加一段水平线
      for (let i = 0; i < 98; i++) {
        complexPoints.push({ x: 700 + i, y: 500 })
      }

      const startTime = performance.now()
      const simplified = testSimplifyPolyline(complexPoints, 0.01)
      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(100) // 应该在100ms内完成
      expect(simplified.length).toBeLessThan(complexPoints.length * 0.1) // 大幅减少
      expect(simplified.length).toBeGreaterThan(4) // 至少保留关键转折点
    })
  })

  describe('真实场景模拟', () => {
    it('模拟拖拽500条边的性能', () => {
      interface EdgeData {
        pointsList: Array<{ x: number; y: number }>
      }

      const edges: EdgeData[] = []
      const updateFunctions: Array<() => void> = []

      // 创建500条边的更新函数
      for (let i = 0; i < 500; i++) {
        const edge: EdgeData = {
          pointsList: [
            { x: 0, y: i * 10 },
            { x: 50, y: i * 10 },
            { x: 50, y: i * 10 + 50 },
            { x: 100, y: i * 10 + 50 },
          ],
        }
        edges.push(edge)

        // 模拟每条边的路径更新
        const updateEdgePath = rafThrottle(() => {
          // 模拟路径计算
          for (let j = 0; j < 100; j++) {
            Math.random()
          }
        })
        updateFunctions.push(updateEdgePath)
      }

      const startTime = performance.now()

      // 模拟拖拽触发所有边的更新（10次mousemove）
      for (let move = 0; move < 10; move++) {
        updateFunctions.forEach((fn) => fn())
      }

      // 等待所有RAF完成
      return new Promise<void>((resolve) => {
        const checkComplete = () => {
          requestAnimationFrame(() => {
            const endTime = performance.now()
            const totalTime = endTime - startTime

            // 在现代设备上，500条边的节流更新应该在合理时间内完成
            expect(totalTime).toBeLessThan(1000) // 1秒内
            resolve()
          })
        }
        checkComplete()
      })
    })
  })
})
