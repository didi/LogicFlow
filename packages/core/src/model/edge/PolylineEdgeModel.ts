import { get, assign, cloneDeep } from 'lodash-es'
import { observable, action } from 'mobx'
import { BaseEdgeModel } from '.'
import { BaseNodeModel, RectNodeModel, CircleNodeModel, Model } from '..'
import LogicFlow from '../../LogicFlow'
import { ModelType, SegmentDirection } from '../../constant'
import {
  isInNode,
  distance,
  getClosestRadiusCenter,
  inStraightLineOfRect,
  getCrossPointWithCircle,
  getCrossPointWithEllipse,
  getCrossPointWithPolygon,
  getPolylinePoints,
  getLongestEdge,
  getCrossPointInRect,
  isSegmentsInNode,
  isSegmentsCrossNode,
  segmentDirection,
  points2PointsList,
  pointFilter,
  simplifyPolyline,
  getSegmentDirection,
} from '../../util'

import Point = LogicFlow.Point
import Position = LogicFlow.Position
import AppendConfig = LogicFlow.AppendConfig
import AnchorConfig = Model.AnchorConfig

// 路径优化配置接口
interface PolylineRouteOptions {
  perf?: { useRaf?: boolean; throttleMs?: number }
  simplify?: {
    enabled?: boolean
    collinearEpsilon?: number
    minSegmentLen?: number
  }
  route?: { mode?: 'auto' | 'incremental' | 'locked' }
  snap?: { orthogonal?: boolean; tolerance?: number }
}

export class PolylineEdgeModel extends BaseEdgeModel {
  modelType = ModelType.POLYLINE_EDGE
  draggingPointList: Point[] = []
  @observable offset?: number
  @observable dbClickPosition?: Point

  // 新增优化相关字段
  @observable routeMode: 'auto' | 'incremental' | 'locked' = 'auto'
  userFixedPoints: Set<number> = new Set()
  private _cachedTextPos?: Point

  // 配置选项（从 properties 或 theme 中读取）
  private get routeOptions(): PolylineRouteOptions {
    const defaultOptions: PolylineRouteOptions = {
      perf: { useRaf: true, throttleMs: 16 },
      simplify: { enabled: true, collinearEpsilon: 0.01, minSegmentLen: 2 },
      route: { mode: 'auto' },
      snap: { orthogonal: true, tolerance: 5 },
    }

    // 注意：这里暂时忽略theme中的配置，避免类型错误
    const propOptions = (this.properties as any)?.routeOptions || {}

    return {
      perf: { ...defaultOptions.perf, ...propOptions.perf },
      simplify: { ...defaultOptions.simplify, ...propOptions.simplify },
      route: { ...defaultOptions.route, ...propOptions.route },
      snap: { ...defaultOptions.snap, ...propOptions.snap },
    }
  }

  initEdgeData(data: LogicFlow.EdgeConfig): void {
    this.offset = get(data, 'properties.offset', 30)
    if (data.pointsList) {
      this.pointsList = data.pointsList
    }
    super.initEdgeData(data)
  }

  getEdgeStyle() {
    const { polyline } = this.graphModel.theme
    const style = super.getEdgeStyle()
    const { style: customStyle = {} } = this.properties
    return {
      ...style,
      ...cloneDeep(polyline),
      ...cloneDeep(customStyle),
    }
  }

  getTextPosition() {
    // 在文本为空的情况下，文本位置为双击位置
    const textValue = this.text?.value
    if (this.dbClickPosition && !textValue) {
      const { x, y } = this.dbClickPosition
      return { x, y }
    }

    // 拖拽中使用缓存位置，避免抖动
    if (this.isDragging && this._cachedTextPos) {
      return this._cachedTextPos
    }

    // 文本不为空或者没有双击位置时，取最长边的中点作为文本位置
    const currentPositionList = points2PointsList(this.points)
    const [p1, p2] = getLongestEdge(currentPositionList)
    const position = {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2,
    }

    // 缓存计算结果
    this._cachedTextPos = position
    return position
  }

  // 获取下一个锚点
  getAfterAnchor(
    direction: SegmentDirection,
    position: Position,
    anchorList: AnchorConfig[],
  ) {
    let anchor: AnchorConfig
    let minDistance: number
    anchorList.forEach((item) => {
      let distanceX: number
      if (direction === SegmentDirection.HORIZONTAL) {
        distanceX = Math.abs(position.y - item.y)
      } else if (direction === SegmentDirection.VERTICAL) {
        distanceX = Math.abs(position.x - item.x)
      }
      if (!minDistance || minDistance > distanceX!) {
        minDistance = distanceX!
        anchor = item
      }
    })
    return anchor!
  }

  /* 获取拖拽过程中产生的交点 */
  getCrossPoint(direction: SegmentDirection, start: Position, end: Position) {
    let position: Point
    if (direction === SegmentDirection.HORIZONTAL) {
      position = {
        x: end.x,
        y: start.y,
      }
    } else if (direction === SegmentDirection.VERTICAL) {
      position = {
        x: start.x,
        y: end.y,
      }
    }
    return position!
  }

  // 删除在图形内的过个交点
  removeCrossPoints(startIndex: number, endIndex: number, pointList: Point[]) {
    const list = pointList.map((i) => i)
    if (startIndex === 1) {
      const start = list[startIndex]
      const end = list[endIndex]
      const pre = list[startIndex - 1]
      const isInStartNode = isSegmentsInNode(pre, start, this.sourceNode)
      if (isInStartNode) {
        const isSegmentsCrossStartNode = isSegmentsCrossNode(
          start,
          end,
          this.sourceNode,
        )
        if (isSegmentsCrossStartNode) {
          const point = getCrossPointInRect(start, end, this.sourceNode)
          if (point) {
            list[startIndex] = point
            list.splice(startIndex - 1, 1)
            startIndex--
            endIndex--
          }
        }
      } else {
        const anchorList = this.sourceNode.anchors
        anchorList.forEach((item) => {
          if (
            (item.x === pre.x && item.x === start.x) ||
            (item.y === pre.y && item.y === start.y)
          ) {
            const distance1 = distance(item.x, item.y, start.x, start.y)
            const distance2 = distance(pre.x, pre.y, start.x, start.y)
            if (distance1 < distance2) {
              list[startIndex - 1] = item
            }
          }
        })
      }
    }
    if (endIndex === pointList.length - 2) {
      const start = list[startIndex]
      const end = list[endIndex]
      const next = list[endIndex + 1]
      const isInEndNode = isSegmentsInNode(end, next, this.targetNode)
      if (isInEndNode) {
        const isSegmentsCrossStartNode = isSegmentsCrossNode(
          start,
          end,
          this.targetNode,
        )
        if (isSegmentsCrossStartNode) {
          const point = getCrossPointInRect(start, end, this.targetNode)
          if (point) {
            list[endIndex] = point
            list.splice(endIndex + 1, 1)
          }
        }
      } else {
        const anchorList = this.targetNode.anchors
        anchorList.forEach((item) => {
          if (
            (item.x === next.x && item.x === end.x) ||
            (item.y === next.y && item.y === end.y)
          ) {
            const distance1 = distance(item.x, item.y, end.x, end.y)
            const distance2 = distance(next.x, next.y, end.x, end.y)
            if (distance1 < distance2) {
              list[endIndex + 1] = item
            }
          }
        })
      }
    }
    return list
  }

  // 获取在拖拽过程中可能产生的点
  getDraggingPoints(
    direction: SegmentDirection,
    positionType: string,
    position: Position,
    anchorList: AnchorConfig[],
    draggingPointList: Point[],
  ) {
    const pointList = draggingPointList.map((i) => i)
    const anchor = this.getAfterAnchor(direction, position, anchorList)
    const crossPoint = this.getCrossPoint(direction, position, anchor)
    if (positionType === 'start') {
      pointList.unshift(crossPoint)
      pointList.unshift(anchor)
    } else {
      pointList.push(crossPoint)
      pointList.push(anchor)
    }
    return pointList
  }

  // 更新相交点[起点，终点]，更加贴近图形, 未修改observable不作为action
  updateCrossPoints(pointList: Point[]) {
    const list = pointList.map((i) => i)
    const start = pointList[0]
    const next = pointList[1]
    const pre = pointList[list.length - 2]
    const end = pointList[list.length - 1]
    const { sourceNode, targetNode } = this
    const sourceModelType = sourceNode.modelType
    const targetModelType = targetNode.modelType
    const startPointDirection = segmentDirection(start, next)!
    let startCrossPoint = list[0]
    switch (sourceModelType) {
      case ModelType.RECT_NODE:
        if ((sourceNode as RectNodeModel).radius !== 0) {
          const inInnerNode = inStraightLineOfRect(start, sourceNode)
          if (!inInnerNode) {
            startCrossPoint = getClosestRadiusCenter(
              start,
              startPointDirection,
              sourceNode,
            )
          }
        }
        break
      case ModelType.CIRCLE_NODE:
        startCrossPoint = getCrossPointWithCircle(
          start,
          startPointDirection,
          sourceNode as CircleNodeModel,
        )
        break
      case ModelType.ELLIPSE_NODE:
        startCrossPoint = getCrossPointWithEllipse(
          start,
          startPointDirection,
          sourceNode,
        )
        break
      case ModelType.DIAMOND_NODE:
        startCrossPoint = getCrossPointWithPolygon(
          start,
          startPointDirection,
          sourceNode,
        )
        break
      case ModelType.POLYGON_NODE:
        startCrossPoint = getCrossPointWithPolygon(
          start,
          startPointDirection,
          sourceNode,
        )
        break
      default:
        break
    }
    // 如果线段和形状没有交点时startCrossPoint会为undefined导致后续计算报错
    if (startCrossPoint) {
      list[0] = startCrossPoint
    }
    const endPointDirection = segmentDirection(pre, end)!
    let endCrossPoint = list[list.length - 1]
    switch (targetModelType) {
      case ModelType.RECT_NODE:
        if ((targetNode as RectNodeModel).radius !== 0) {
          const inInnerNode = inStraightLineOfRect(end, targetNode)
          if (!inInnerNode) {
            endCrossPoint = getClosestRadiusCenter(
              end,
              endPointDirection,
              targetNode,
            )
          }
        }
        break
      case ModelType.CIRCLE_NODE:
        endCrossPoint = getCrossPointWithCircle(
          end,
          endPointDirection,
          targetNode as CircleNodeModel,
        )
        break
      case ModelType.ELLIPSE_NODE:
        endCrossPoint = getCrossPointWithEllipse(
          end,
          endPointDirection,
          targetNode,
        )
        break
      case ModelType.DIAMOND_NODE:
        endCrossPoint = getCrossPointWithPolygon(
          end,
          endPointDirection,
          targetNode,
        )
        break
      case ModelType.POLYGON_NODE:
        endCrossPoint = getCrossPointWithPolygon(
          end,
          endPointDirection,
          targetNode,
        )
        break
      default:
        break
    }
    // 如果线段和形状没有交点时startCrossPoint会为undefined导致后续计算报错
    if (endCrossPoint) {
      list[list.length - 1] = endCrossPoint
    }
    return list
  }

  updatePath(pointList: Point[]) {
    this.pointsList = pointList
    this.points = this.getPath(this.pointsList)
  }

  getData() {
    const data = super.getData()
    const pointsList = this.pointsList.map(({ x, y }) => ({
      x,
      y,
    }))
    return Object.assign({}, data, {
      pointsList,
    })
  }

  getPath(points: Point[]): string {
    return points.map((point) => `${point.x},${point.y}`).join(' ')
  }

  @action
  initPoints() {
    if (this.pointsList.length > 0) {
      this.points = this.getPath(this.pointsList)
    } else {
      this.updatePoints()
    }
  }

  @action
  updatePoints() {
    const pointsList = getPolylinePoints(
      {
        x: this.startPoint.x,
        y: this.startPoint.y,
      },
      {
        x: this.endPoint.x,
        y: this.endPoint.y,
      },
      this.sourceNode,
      this.targetNode,
      this.offset || 0,
    )
    this.pointsList = pointsList
    this.points = pointsList.map((point) => `${point.x},${point.y}`).join(' ')
  }

  @action
  updateStartPoint(anchor: Point) {
    this.startPoint = Object.assign({}, anchor)
    this.updatePoints()
  }

  @action
  moveStartPoint(deltaX: number, deltaY: number): void {
    this.startPoint.x += deltaX
    this.startPoint.y += deltaY

    // 根据路由模式决定更新策略
    const options = this.routeOptions
    const mode = options.route?.mode || this.routeMode

    if (mode === 'incremental' || mode === 'locked') {
      // 增量更新：仅调整首段，保持其他折点不变
      this.moveStartPointIncremental()
    } else {
      // 传统全量更新
      this.updatePoints()
    }
  }

  /**
   * 增量更新起点：仅调整首段与第二个点的连接，保持后续折点不变
   */
  private moveStartPointIncremental(): void {
    if (this.pointsList.length >= 2) {
      const list = this.pointsList.map((p) => ({ ...p }))
      const secondPoint = list[1]

      // 更新第一个点为新的起点
      list[0] = { x: this.startPoint.x, y: this.startPoint.y }

      // 判断原首段方向并保持正交
      const originalDir = getSegmentDirection(this.pointsList[0], secondPoint)
      if (originalDir === 'horizontal') {
        // 保持水平：调整第二个点的y坐标
        list[1] = { x: secondPoint.x, y: list[0].y }
      } else if (originalDir === 'vertical') {
        // 保持垂直：调整第二个点的x坐标
        list[1] = { x: list[0].x, y: secondPoint.y }
      } else {
        // 对角线：选择更接近正交的方向
        const dx = Math.abs(secondPoint.x - list[0].x)
        const dy = Math.abs(secondPoint.y - list[0].y)
        if (dx < dy) {
          list[1] = { x: list[0].x, y: secondPoint.y } // 垂直
        } else {
          list[1] = { x: secondPoint.x, y: list[0].y } // 水平
        }
      }

      // 拖拽中仅更新可视路径，不改pointsList
      this.updatePointsAfterDrag(list)
    } else {
      // 回退：只有两点时直接全量更新
      this.updatePoints()
    }
  }

  @action
  updateEndPoint(anchor: Point) {
    this.endPoint = Object.assign({}, anchor)
    this.updatePoints()
  }

  @action
  moveEndPoint(deltaX: number, deltaY: number): void {
    this.endPoint.x += deltaX
    this.endPoint.y += deltaY

    // 根据路由模式决定更新策略
    const options = this.routeOptions
    const mode = options.route?.mode || this.routeMode

    if (mode === 'incremental' || mode === 'locked') {
      // 增量更新：仅调整末段，保持其他折点不变
      this.moveEndPointIncremental()
    } else {
      // 传统全量更新
      this.updatePoints()
    }
  }

  /**
   * 增量更新终点：仅调整末段与倒数第二个点的连接，保持前面折点不变
   */
  private moveEndPointIncremental(): void {
    const n = this.pointsList.length
    if (n >= 2) {
      const list = this.pointsList.map((p) => ({ ...p }))
      const prevPoint = list[n - 2]

      // 更新最后一个点为新的终点
      list[n - 1] = { x: this.endPoint.x, y: this.endPoint.y }

      // 判断原末段方向并保持正交
      const originalDir = getSegmentDirection(prevPoint, this.pointsList[n - 1])
      if (originalDir === 'horizontal') {
        // 保持水平：调整倒数第二个点的y坐标
        list[n - 2] = { x: prevPoint.x, y: list[n - 1].y }
      } else if (originalDir === 'vertical') {
        // 保持垂直：调整倒数第二个点的x坐标
        list[n - 2] = { x: list[n - 1].x, y: prevPoint.y }
      } else {
        // 对角线：选择更接近正交的方向
        const dx = Math.abs(prevPoint.x - list[n - 1].x)
        const dy = Math.abs(prevPoint.y - list[n - 1].y)
        if (dx < dy) {
          list[n - 2] = { x: list[n - 1].x, y: prevPoint.y } // 垂直
        } else {
          list[n - 2] = { x: prevPoint.x, y: list[n - 1].y } // 水平
        }
      }

      // 拖拽中仅更新可视路径，不改pointsList
      this.updatePointsAfterDrag(list)
    } else {
      // 回退：只有两点时直接全量更新
      this.updatePoints()
    }
  }

  @action
  updatePointsList(deltaX: number, deltaY: number): void {
    this.pointsList.forEach((item) => {
      item.x += deltaX
      item.y += deltaY
    })
    const startPoint = this.pointsList[0]
    this.startPoint = Object.assign({}, startPoint)
    const endPoint = this.pointsList[this.pointsList.length - 1]
    this.endPoint = Object.assign({}, endPoint)
    this.initPoints()
  }

  @action
  dragAppendStart() {
    // mobx observer 对象被iterator处理会有问题
    this.draggingPointList = this.pointsList.map((i) => i)
  }

  @action
  dragAppendSimple(
    appendInfo: AppendConfig,
    dragInfo: Record<'x' | 'y', number>,
  ) {
    // 因为drag事件是mouseDown事件触发的，因此当真实拖拽之后再设置isDragging
    // 避免因为点击事件造成，在dragStart触发之后，没有触发dragEnd错误设置了isDragging状态，对history计算造成错误
    this.isDragging = true
    const { start, end, startIndex, endIndex, direction } = appendInfo
    const { pointsList } = this
    let draggingPointList = pointsList
    if (direction === SegmentDirection.HORIZONTAL) {
      // 水平，仅调整y坐标，拿到当前线段两个端点移动后的坐标
      pointsList[startIndex] = {
        x: start.x,
        y: start.y + dragInfo.y,
      }
      pointsList[endIndex] = {
        x: end.x,
        y: end.y + dragInfo.y,
      }
      draggingPointList = this.pointsList.map((i) => i)
    } else if (direction === SegmentDirection.VERTICAL) {
      // 垂直，仅调整x坐标， 与水平调整同理
      pointsList[startIndex] = {
        x: start.x + dragInfo.x,
        y: start.y,
      }
      pointsList[endIndex] = {
        x: end.x + dragInfo.x,
        y: end.y,
      }
      draggingPointList = this.pointsList.map((i) => i)
    }
    this.updatePointsAfterDrag(draggingPointList)
    this.draggingPointList = draggingPointList
    // TODO: 判断该逻辑是否需要
    if (this.text?.value) {
      this.setText(assign({}, this.text, this.textPosition))
    }
    return {
      start: assign({}, pointsList[startIndex]),
      end: assign({}, pointsList[endIndex]),
      startIndex,
      endIndex,
      direction,
    }
  }

  @action
  dragAppend(appendInfo: AppendConfig, dragInfo: Record<'x' | 'y', number>) {
    this.isDragging = true
    const { start, end, startIndex, endIndex, direction } = appendInfo
    const { pointsList } = this
    if (direction === SegmentDirection.HORIZONTAL) {
      // 水平，仅调整y坐标
      // step1: 拿到当前线段两个端点移动后的坐标
      pointsList[startIndex] = {
        x: start.x,
        y: start.y + dragInfo.y,
      }
      pointsList[endIndex] = {
        x: end.x,
        y: end.y + dragInfo.y,
      }
      // step2: 计算拖拽后,两个端点与节点外框的交点
      // 定义一个拖住中节点list
      let draggingPointList = this.pointsList.map((i) => i)
      if (startIndex !== 0 && endIndex !== this.pointsList.length - 1) {
        // 2.1)如果线段没有连接起终点，过滤会穿插在图形内部的线段，取整个图形离线段最近的点
        draggingPointList = this.removeCrossPoints(
          startIndex,
          endIndex,
          draggingPointList,
        )
      }
      if (startIndex === 0) {
        // 2.2)如果线段连接了起点, 判断起点是否在节点内部
        const startPosition = {
          x: start.x,
          y: start.y + dragInfo.y,
        }
        const inNode = isInNode(startPosition, this.sourceNode)
        if (!inNode) {
          // 如果不在节点内部，更换起点为线段与节点的交点
          const anchorList = this.sourceNode.anchors
          draggingPointList = this.getDraggingPoints(
            direction,
            'start',
            startPosition,
            anchorList,
            draggingPointList,
          )
        }
      }
      if (endIndex === this.pointsList.length - 1) {
        // 2.2)如果线段连接了终点, 判断起点是否在节点内部
        const endPosition = {
          x: end.x,
          y: end.y + dragInfo.y,
        }
        const inNode = isInNode(endPosition, this.targetNode)
        if (!inNode) {
          // 如果不在节点内部，更换终点为线段与节点的交点
          const anchorList = this.targetNode.anchors
          draggingPointList = this.getDraggingPoints(
            direction,
            'end',
            endPosition,
            anchorList,
            draggingPointList,
          )
        }
      }
      this.updatePointsAfterDrag(draggingPointList)
      // step3: 调整到对应外框的位置后，执行updatePointsAfterDrag，找到当前线段和图形的准确交点
      this.draggingPointList = draggingPointList
    } else if (direction === SegmentDirection.VERTICAL) {
      // 垂直，仅调整x坐标， 与水平调整同理
      pointsList[startIndex] = {
        x: start.x + dragInfo.x,
        y: start.y,
      }
      pointsList[endIndex] = {
        x: end.x + dragInfo.x,
        y: end.y,
      }
      let draggingPointList = this.pointsList.map((i) => i)
      if (startIndex !== 0 && endIndex !== this.pointsList.length - 1) {
        draggingPointList = this.removeCrossPoints(
          startIndex,
          endIndex,
          draggingPointList,
        )
      }
      if (startIndex === 0) {
        const startPosition = {
          x: start.x + dragInfo.x,
          y: start.y,
        }
        const inNode = isInNode(startPosition, this.sourceNode)
        if (!inNode) {
          const anchorList = this.sourceNode.anchors
          draggingPointList = this.getDraggingPoints(
            direction,
            'start',
            startPosition,
            anchorList,
            draggingPointList,
          )
        }
      }
      if (endIndex === this.pointsList.length - 1) {
        const endPosition = {
          x: end.x + dragInfo.x,
          y: end.y,
        }
        const inNode = isInNode(endPosition, this.targetNode)
        if (!inNode) {
          const anchorList = this.targetNode.anchors
          draggingPointList = this.getDraggingPoints(
            direction,
            'end',
            endPosition,
            anchorList,
            draggingPointList,
          )
        }
      }
      this.updatePointsAfterDrag(draggingPointList)
      this.draggingPointList = draggingPointList
    }
    // TODO: 确认该判断逻辑是否需要
    if (this.text?.value) {
      this.setText(assign({}, this.text, this.textPosition))
    }
    return {
      start: assign({}, pointsList[startIndex]),
      end: assign({}, pointsList[endIndex]),
      startIndex,
      endIndex,
      direction,
    }
  }

  @action
  dragAppendEnd() {
    if (this.draggingPointList) {
      let pointsList = pointFilter(points2PointsList(this.points))

      // 应用路径简化（如果启用）
      const options = this.routeOptions
      if (options.simplify?.enabled) {
        pointsList = simplifyPolyline(
          pointsList,
          options.simplify.collinearEpsilon,
          options.simplify.minSegmentLen,
        )
      }

      // 更新pointsList，重新渲染appendWidth
      this.pointsList = pointsList.map((i) => i)
      // draggingPointList清空
      this.draggingPointList = []
      // 更新起终点
      const startPoint = pointsList[0]
      this.startPoint = assign({}, startPoint)
      const endPoint = pointsList[pointsList.length - 1]
      this.endPoint = assign({}, endPoint)

      // 清除文本位置缓存，强制重新计算
      this._cachedTextPos = undefined
    }
    this.isDragging = false
  }

  /* 拖拽之后个更新points，仅更新边，不更新pointsList，
     appendWidth会依赖pointsList,更新pointsList会重新渲染appendWidth，从而导致不能继续拖拽
     在拖拽结束后再进行pointsList的更新
  */
  @action
  updatePointsAfterDrag(pointsList: Point[]) {
    // 找到准确的连接点后,更新points, 更新边，同时更新依赖points的箭头
    const list = this.updateCrossPoints(pointsList)
    this.points = list.map((point) => `${point.x},${point.y}`).join(' ')
  }

  // 获取边调整的起点
  @action
  getAdjustStart() {
    return this.pointsList[0] || this.startPoint
  }

  // 获取边调整的终点
  @action
  getAdjustEnd() {
    const { pointsList } = this
    return pointsList[pointsList.length - 1] || this.endPoint
  }

  // 起终点拖拽调整过程中，进行折线路径更新
  @action
  updateAfterAdjustStartAndEnd({
    startPoint,
    endPoint,
    sourceNode,
    targetNode,
  }: {
    startPoint: Point
    endPoint: Point
    sourceNode: BaseNodeModel
    targetNode: BaseNodeModel
  }) {
    this.pointsList = getPolylinePoints(
      {
        x: startPoint.x,
        y: startPoint.y,
      },
      {
        x: endPoint.x,
        y: endPoint.y,
      },
      sourceNode,
      targetNode,
      this.offset || 0,
    )

    this.initPoints()
  }

  /**
   * 重置路径：清除用户自定义折点，回到自动路径模式
   */
  @action
  resetPath() {
    this.userFixedPoints.clear()
    this.routeMode = 'auto'
    this._cachedTextPos = undefined
    this.updatePoints() // 重新计算路径
  }

  /**
   * 标记折点为用户自定义（在手动拖拽折点时调用）
   */
  markPointAsUserFixed(index: number) {
    this.userFixedPoints.add(index)
  }

  /**
   * 获取当前路径的统计信息（用于调试和监控）
   */
  getPathStats() {
    const pointsList = this.pointsList
    const totalLength = pointsList.reduce((sum, point, index) => {
      if (index === 0) return 0
      const prev = pointsList[index - 1]
      return sum + distance(point.x, point.y, prev.x, prev.y)
    }, 0)

    return {
      pointCount: pointsList.length,
      totalLength: Math.round(totalLength),
      userFixedCount: this.userFixedPoints.size,
      routeMode: this.routeMode,
    }
  }
}

export default PolylineEdgeModel
