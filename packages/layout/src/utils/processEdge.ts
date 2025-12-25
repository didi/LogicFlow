import LogicFlow, { BaseEdgeModel } from '@logicflow/core'
import NodeConfig = LogicFlow.NodeConfig
import EdgeConfig = LogicFlow.EdgeConfig
import Direction = LogicFlow.Direction
import Point = LogicFlow.Point

type BaseNodeData = {
  x: number
  y: number
  width: number
  height: number
}

type IBezierControls = {
  sNext: Point
  ePre: Point
}

// 定义边界数据结构，左上坐标 + 右下坐标定位一个矩形
type BoxBoundsPoint = {
  minX: number // Left Top X
  minY: number // Left Top Y
  maxX: number // Right Bottom X
  maxY: number // Right Bottom Y
}

type NodeBBox = {
  x: number
  y: number
  width: number
  height: number
  centerX: number
  centerY: number
} & BoxBoundsPoint

interface BoxBounds extends BoxBoundsPoint {
  x: number
  y: number
  width: number
  height: number
  centerX: number
  centerY: number
}

enum SegmentDirection {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical',
}

export function processEdges(
  lf: LogicFlow,
  rankdir: string | undefined,
  isDefaultAnchor: boolean | undefined,
  edges: BaseEdgeModel[],
  newNodes: NodeConfig[],
) {
  const newEdges: EdgeConfig[] = []
  // 处理边的路径和锚点
  edges.forEach((edgeModel) => {
    const lfEdge: EdgeConfig = edgeModel.getData()
    if (!lfEdge) {
      throw new Error(`布局错误：找不到ID为 ${edgeModel.id} 的边`)
    }

    if (!isDefaultAnchor) {
      // 自定义锚点，不调整边的关联锚点，只清除路径相关数据，让LogicFlow自动计算
      delete lfEdge.pointsList
      delete lfEdge.startPoint
      delete lfEdge.endPoint
      if (typeof lfEdge.text === 'object' && lfEdge.text && lfEdge.text.value) {
        lfEdge.text = lfEdge.text.value
      }
    } else {
      // 默认锚点，重新计算路径以及边的起点和终点（节点默认锚点为上下左右）
      delete lfEdge.pointsList
      delete lfEdge.startPoint
      delete lfEdge.endPoint
      delete lfEdge.sourceAnchorId
      delete lfEdge.targetAnchorId

      lfEdge.pointsList = calcPointsList(lf, rankdir, edgeModel, newNodes)

      if (lfEdge.pointsList) {
        // 设置边的起点和终点
        const first = lfEdge.pointsList[0]
        const last = lfEdge.pointsList[lfEdge.pointsList.length - 1]
        lfEdge.startPoint = { x: first.x, y: first.y }
        lfEdge.endPoint = { x: last.x, y: last.y }
      }
      if (typeof lfEdge.text === 'object' && lfEdge.text && lfEdge.text.value) {
        // 保留文本内容
        lfEdge.text = lfEdge.text.value
      }
    }

    newEdges.push(lfEdge)
  })
  return newEdges
}

/**
 * 优化折线路径点，移除冗余点
 * @param points - 原始路径点数组
 * @returns 优化后的路径点数组
 */
function pointFilter(points: Point[]): Point[] {
  const allPoints = [...points] // 创建副本避免修改原始数据
  let i = 1

  // 删除直线上的中间点（保持路径简洁）
  while (i < allPoints.length - 1) {
    const pre = allPoints[i - 1]
    const current = allPoints[i]
    const next = allPoints[i + 1]

    // 如果三点共线，移除中间点
    if (
      (pre.x === current.x && current.x === next.x) || // 垂直线上的点
      (pre.y === current.y && current.y === next.y)
    ) {
      // 水平线上的点
      allPoints.splice(i, 1)
    } else {
      i++
    }
  }

  return allPoints
}

/**
 * 计算边的折线路径点
 * @param model - 边模型
 * @param nodes - 节点数据数组
 * @returns 计算后的路径点数组，如果无法计算则返回undefined
 */
function calcPointsList(
  lf: LogicFlow,
  rankdir: string | undefined,
  model: BaseEdgeModel,
  nodes: NodeConfig[],
): Point[] | undefined {
  const pointsList: Point[] = []

  // 获取源节点和目标节点的模型与布局数据
  const sourceNodeModel = lf.getNodeModelById(model.sourceNodeId)
  const targetNodeModel = lf.getNodeModelById(model.targetNodeId)
  const newSourceNodeData = nodes.find(
    (node: NodeConfig) => node.id === model.sourceNodeId,
  )
  const newTargetNodeData = nodes.find(
    (node: NodeConfig) => node.id === model.targetNodeId,
  )

  // 数据验证
  if (
    !sourceNodeModel ||
    !targetNodeModel ||
    !newSourceNodeData ||
    !newTargetNodeData
  ) {
    return undefined
  }

  // 折线偏移量（用于创建合适的转折点）
  const offset = Number(model.offset) || 50

  // 处理从左到右(LR)布局的边路径，折线
  if (rankdir === 'LR' && model.modelType === 'polyline-edge') {
    // 正向连线：源节点在目标节点左侧
    if (newSourceNodeData.x <= newTargetNodeData.x) {
      // 从源节点右侧中心出发
      pointsList.push({
        x: newSourceNodeData.x + sourceNodeModel.width / 2,
        y: newSourceNodeData.y,
      })
      // 向右延伸一段距离
      pointsList.push({
        x: newSourceNodeData.x + sourceNodeModel.width / 2 + offset,
        y: newSourceNodeData.y,
      })
      // 垂直移动到目标节点的高度
      pointsList.push({
        x: newSourceNodeData.x + sourceNodeModel.width / 2 + offset,
        y: newTargetNodeData.y,
      })
      // 连接到目标节点左侧中心
      pointsList.push({
        x: newTargetNodeData.x - targetNodeModel.width / 2,
        y: newTargetNodeData.y,
      })

      return pointFilter(pointsList)
    }

    // 反向连线：源节点在目标节点右侧
    if (newSourceNodeData.x > newTargetNodeData.x) {
      // 根据节点相对Y轴位置选择不同路径
      if (newSourceNodeData.y >= newTargetNodeData.y) {
        // 源节点在目标节点的右下方，从源节点上方出发
        pointsList.push({
          x: newSourceNodeData.x,
          y: newSourceNodeData.y + sourceNodeModel.height / 2,
        })
        pointsList.push({
          x: newSourceNodeData.x,
          y: newSourceNodeData.y + sourceNodeModel.height / 2 + offset,
        })
        pointsList.push({
          x: newTargetNodeData.x,
          y: newSourceNodeData.y + sourceNodeModel.height / 2 + offset,
        })
        pointsList.push({
          x: newTargetNodeData.x,
          y: newTargetNodeData.y + targetNodeModel.height / 2,
        })
      } else {
        // 源节点在目标节点的右上方，从源节点下方出发
        pointsList.push({
          x: newSourceNodeData.x,
          y: newSourceNodeData.y - sourceNodeModel.height / 2,
        })
        pointsList.push({
          x: newSourceNodeData.x,
          y: newSourceNodeData.y - sourceNodeModel.height / 2 - offset,
        })
        pointsList.push({
          x: newTargetNodeData.x,
          y: newSourceNodeData.y - sourceNodeModel.height / 2 - offset,
        })
        pointsList.push({
          x: newTargetNodeData.x,
          y: newTargetNodeData.y - targetNodeModel.height / 2,
        })
      }

      return pointFilter(pointsList)
    }
  }

  // 处理从上到下(TB)布局的边路径, 折线
  if (rankdir === 'TB' && model.modelType === 'polyline-edge') {
    // 正向连线：源节点在目标节点上方
    if (newSourceNodeData.y <= newTargetNodeData.y) {
      // 从源节点底部中心出发
      pointsList.push({
        x: newSourceNodeData.x,
        y: newSourceNodeData.y + sourceNodeModel.height / 2,
      })
      // 向下延伸一段距离
      pointsList.push({
        x: newSourceNodeData.x,
        y: newSourceNodeData.y + sourceNodeModel.height / 2 + offset,
      })
      // 水平移动到目标节点的位置
      pointsList.push({
        x: newTargetNodeData.x,
        y: newSourceNodeData.y + sourceNodeModel.height / 2 + offset,
      })
      // 连接到目标节点顶部中心
      pointsList.push({
        x: newTargetNodeData.x,
        y: newTargetNodeData.y - targetNodeModel.height / 2,
      })

      return pointFilter(pointsList)
    }

    // 反向连线：源节点在目标节点下方
    if (newSourceNodeData.y > newTargetNodeData.y) {
      if (newSourceNodeData.x >= newTargetNodeData.x) {
        // 源节点在目标节点右下方，从源节点右侧出发
        pointsList.push({
          x: newSourceNodeData.x + sourceNodeModel.width / 2,
          y: newSourceNodeData.y,
        })
        pointsList.push({
          x: newSourceNodeData.x + sourceNodeModel.width / 2 + offset,
          y: newSourceNodeData.y,
        })
        pointsList.push({
          x: newSourceNodeData.x + sourceNodeModel.width / 2 + offset,
          y: newTargetNodeData.y,
        })
        pointsList.push({
          x: newTargetNodeData.x + targetNodeModel.width / 2,
          y: newTargetNodeData.y,
        })
      } else {
        // 源节点在目标节点左下方，从源节点左侧出发
        pointsList.push({
          x: newSourceNodeData.x - sourceNodeModel.width / 2,
          y: newSourceNodeData.y,
        })
        pointsList.push({
          x: newSourceNodeData.x - sourceNodeModel.width / 2 - offset,
          y: newSourceNodeData.y,
        })
        pointsList.push({
          x: newSourceNodeData.x - sourceNodeModel.width / 2 - offset,
          y: newTargetNodeData.y,
        })
        pointsList.push({
          x: newTargetNodeData.x - targetNodeModel.width / 2,
          y: newTargetNodeData.y,
        })
      }

      return pointFilter(pointsList)
    }
  }

  // 处理从左到右(LR)布局的边路径, 贝塞尔曲线
  if (rankdir === 'LR' && model.modelType === 'bezier-edge') {
    const startPoint = {
      x: newSourceNodeData.x + sourceNodeModel.width / 2,
      y: newSourceNodeData.y,
    }
    const endPoint = {
      x: newTargetNodeData.x - targetNodeModel.width / 2,
      y: newTargetNodeData.y,
    }
    let sNext: Point = { x: 0, y: 0 }
    let ePre: Point = { x: 0, y: 0 }
    // 正向连线：源节点在目标节点左侧
    if (newSourceNodeData.x < newTargetNodeData.x) {
      const result = getBezierControlPoints({
        start: startPoint,
        end: endPoint,
        sourceNode: {
          x: newSourceNodeData.x,
          y: newSourceNodeData.y,
          width: sourceNodeModel.width,
          height: sourceNodeModel.height,
        },
        targetNode: {
          x: newTargetNodeData.x,
          y: newTargetNodeData.y,
          width: targetNodeModel.width,
          height: targetNodeModel.height,
        },
        offset,
      })
      sNext = result.sNext
      ePre = result.ePre
    }
    // 反向连线：源节点在目标节点右侧
    if (newSourceNodeData.x > newTargetNodeData.x) {
      if (newSourceNodeData.y >= newTargetNodeData.y) {
        // 源节点在目标节点的右下方
        sNext = {
          x:
            newSourceNodeData.x +
            sourceNodeModel.width / 2 +
            offset +
            targetNodeModel.width / 2,
          y:
            newSourceNodeData.y +
            sourceNodeModel.height +
            targetNodeModel.height,
        }
        ePre = {
          x:
            newTargetNodeData.x -
            targetNodeModel.width / 2 -
            offset -
            sourceNodeModel.width / 2,
          y:
            newTargetNodeData.y +
            sourceNodeModel.height +
            targetNodeModel.height,
        }
      } else {
        // 源节点在目标节点的右上方
        sNext = {
          x:
            newSourceNodeData.x +
            sourceNodeModel.width / 2 +
            offset +
            targetNodeModel.width / 2,
          y:
            newSourceNodeData.y -
            sourceNodeModel.height -
            targetNodeModel.height,
        }
        ePre = {
          x:
            newTargetNodeData.x -
            targetNodeModel.width / 2 -
            offset -
            sourceNodeModel.width / 2,
          y:
            newTargetNodeData.y -
            sourceNodeModel.height -
            targetNodeModel.height,
        }
      }
    }
    pointsList.push(startPoint, sNext, ePre, endPoint)
    return pointsList
  }

  // 处理从上到下(TB)布局的边路径, 贝塞尔曲线
  if (rankdir === 'TB' && model.modelType === 'bezier-edge') {
    const startPoint = {
      x: newSourceNodeData.x,
      y: newSourceNodeData.y + sourceNodeModel.height / 2,
    }
    const endPoint = {
      x: newTargetNodeData.x,
      y: newTargetNodeData.y - targetNodeModel.height / 2,
    }
    let sNext: Point = { x: 0, y: 0 }
    let ePre: Point = { x: 0, y: 0 }
    if (newSourceNodeData.y <= newTargetNodeData.y) {
      // 正向连线：源节点在目标节点上方
      const result = getBezierControlPoints({
        start: startPoint,
        end: endPoint,
        sourceNode: {
          x: newSourceNodeData.x,
          y: newSourceNodeData.y,
          width: sourceNodeModel.width,
          height: sourceNodeModel.height,
        },
        targetNode: {
          x: newTargetNodeData.x,
          y: newTargetNodeData.y,
          width: targetNodeModel.width,
          height: targetNodeModel.height,
        },
        offset,
      })
      sNext = result.sNext
      ePre = result.ePre
    }
    if (newSourceNodeData.y > newTargetNodeData.y) {
      // 反向连线：源节点在目标节点下方
      if (newSourceNodeData.x >= newTargetNodeData.x) {
        // 源节点在目标节点右下方
        sNext = {
          x:
            newSourceNodeData.x +
            sourceNodeModel.width / 2 +
            offset +
            targetNodeModel.width / 2,
          y:
            newSourceNodeData.y +
            sourceNodeModel.height +
            targetNodeModel.height,
        }
        ePre = {
          x:
            newTargetNodeData.x +
            targetNodeModel.width / 2 +
            offset +
            sourceNodeModel.width / 2,
          y:
            newTargetNodeData.y -
            sourceNodeModel.height -
            targetNodeModel.height,
        }
      } else {
        // 源节点在目标节点左下方
        sNext = {
          x:
            newSourceNodeData.x -
            sourceNodeModel.width / 2 -
            offset -
            targetNodeModel.width / 2,
          y:
            newSourceNodeData.y +
            sourceNodeModel.height +
            targetNodeModel.height,
        }
        ePre = {
          x:
            newTargetNodeData.x -
            targetNodeModel.width / 2 -
            offset -
            sourceNodeModel.width / 2,
          y:
            newTargetNodeData.y -
            sourceNodeModel.height -
            targetNodeModel.height,
        }
      }
    }
    pointsList.push(startPoint, sNext, ePre, endPoint)
    return pointsList
  }

  // 无法确定路径时返回undefined，让LogicFlow自行处理
  return undefined
}

// bezier曲线
const getBezierControlPoints = ({
  start,
  end,
  sourceNode,
  targetNode,
  offset,
}: {
  start: Point
  end: Point
  sourceNode: BaseNodeData
  targetNode: BaseNodeData
  offset: number
}): IBezierControls => {
  const sBBox = getNodeBBox(sourceNode)
  const tBBox = getNodeBBox(targetNode)
  const sExpendBBox = getExpandedBBox(sBBox, offset)
  const tExpendBBox = getExpandedBBox(tBBox, offset)
  const sNext = getExpandedBBoxPoint(sExpendBBox, sBBox, start)
  const ePre = getExpandedBBoxPoint(tExpendBBox, tBBox, end)
  return {
    sNext,
    ePre,
  }
}

/* 获取节点bbox */
const getNodeBBox = (node: BaseNodeData): NodeBBox => {
  const { x, y, width, height } = node
  return {
    minX: x - width / 2,
    minY: y - height / 2,
    maxX: x + width / 2,
    maxY: y + height / 2,
    x,
    y,
    width,
    height,
    centerX: x,
    centerY: y,
  }
}

/* 扩展的bbox,保证起始点的下一个点一定在node的垂直方向，不会与线重合, offset是点与线的垂直距离 */
const getExpandedBBox = (bbox: BoxBounds, offset: number): BoxBounds => {
  if (bbox.width === 0 && bbox.height === 0) {
    return bbox
  }
  return {
    x: bbox.x,
    y: bbox.y,
    centerX: bbox.centerX,
    centerY: bbox.centerY,
    minX: bbox.minX - offset,
    minY: bbox.minY - offset,
    maxX: bbox.maxX + offset,
    maxY: bbox.maxY + offset,
    height: bbox.height + 2 * offset,
    width: bbox.width + 2 * offset,
  }
}

/* 判断点与中心点边的方向：是否水平，true水平，false垂直 */
const pointDirection = (point: Point, bbox: BoxBounds): Direction => {
  const dx = Math.abs(point.x - bbox.centerX)
  const dy = Math.abs(point.y - bbox.centerY)
  return dx / bbox.width > dy / bbox.height
    ? SegmentDirection.HORIZONTAL
    : SegmentDirection.VERTICAL
}

/* 获取扩展图形上的点，即起始终点相邻的点，上一个或者下一个节点 */
const getExpandedBBoxPoint = (
  expendBBox: BoxBounds,
  bbox: BoxBounds,
  point: Point,
): Point => {
  const direction = pointDirection(point, bbox)
  if (direction === SegmentDirection.HORIZONTAL) {
    return {
      x: point.x > expendBBox.centerX ? expendBBox.maxX : expendBBox.minX,
      y: point.y,
    }
  }
  return {
    x: point.x,
    y: point.y > expendBBox.centerY ? expendBBox.maxY : expendBBox.minY,
  }
}
