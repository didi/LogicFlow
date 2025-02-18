import { get, assign, cloneDeep } from 'lodash-es'
import { action, observable } from 'mobx'
import BaseEdgeModel from './BaseEdgeModel'
import { BaseNodeModel } from '../node'
import LogicFlow from '../../LogicFlow'
import GraphModel from '../GraphModel'
import { ModelType } from '../../constant'
import { getBezierControlPoints, IBezierControls } from '../../util'

import Point = LogicFlow.Point
import EdgeConfig = LogicFlow.EdgeConfig

export class BezierEdgeModel extends BaseEdgeModel {
  modelType = ModelType.BEZIER_EDGE

  offset!: number
  @observable path = ''
  constructor(data: EdgeConfig, graphModel: GraphModel) {
    super(data, graphModel)
    this.initEdgeData(data)
    this.setAttributes()
  }
  initEdgeData(data: EdgeConfig): void {
    this.offset = get(data, 'properties.offset', 100)
    super.initEdgeData(data)
  }
  getEdgeStyle() {
    const { bezier } = this.graphModel.theme
    const style = super.getEdgeStyle()
    const { style: customStyle = {} } = this.properties
    return {
      ...style,
      ...cloneDeep(bezier),
      ...cloneDeep(customStyle),
    }
  }
  getTextPosition(): Point {
    if (this.pointsList && this.pointsList.length > 0) {
      let pointsXSum = 0
      let pointsYSum = 0
      this.pointsList.forEach(({ x, y }) => {
        pointsXSum += x
        pointsYSum += y
      })
      return {
        x: pointsXSum / this.pointsList.length,
        y: pointsYSum / this.pointsList.length,
      }
    }
    return {
      x: (this.startPoint.x + this.endPoint.x) / 2,
      y: (this.startPoint.y + this.endPoint.y) / 2,
    }
  }
  getData() {
    const data = super.getData()
    const pointsList = this.pointsList.map(({ x, y }) => ({ x, y }))
    return {
      ...data,
      pointsList,
    }
  }

  /* 获取贝塞尔曲线的控制点 */
  private getControls(): IBezierControls {
    const start = this.startPoint
    const end = this.endPoint
    const points = getBezierControlPoints({
      start,
      end,
      sourceNode: this.sourceNode,
      targetNode: this.targetNode,
      offset: this.offset,
    })
    return points
  }
  /* 获取贝塞尔曲线的path */
  private getPath(points: Point[]): string {
    const [start, sNext, ePre, end] = points
    return `M ${start.x} ${start.y}
    C ${sNext.x} ${sNext.y},
    ${ePre.x} ${ePre.y},
    ${end.x} ${end.y}`
  }
  @action
  initPoints() {
    if (this.pointsList.length > 0) {
      this.path = this.getPath(this.pointsList)
    } else {
      this.updatePoints()
    }
  }

  @action
  updatePoints() {
    const { sNext, ePre } = this.getControls()
    this.updatePath(sNext, ePre)
  }
  updatePath(sNext: Point, ePre: Point) {
    sNext = cloneDeep(sNext)
    ePre = cloneDeep(ePre)
    const start = {
      x: this.startPoint.x,
      y: this.startPoint.y,
    }
    const end = {
      x: this.endPoint.x,
      y: this.endPoint.y,
    }
    if (!sNext || !ePre) {
      const control = this.getControls()
      sNext = control.sNext
      ePre = control.ePre
    }
    this.pointsList = [start, sNext, ePre, end]
    this.path = this.getPath(this.pointsList)
  }
  @action
  updateStartPoint(anchor: Point) {
    this.startPoint = Object.assign({}, anchor)
    this.updatePoints()
  }

  @action
  updateEndPoint(anchor: Point) {
    this.endPoint = Object.assign({}, anchor)
    this.updatePoints()
  }
  @action
  moveStartPoint(deltaX: number, deltaY: number): void {
    this.startPoint.x += deltaX
    this.startPoint.y += deltaY
    const [, sNext, ePre] = this.pointsList
    // 保持调整点一起移动
    sNext.x += deltaX
    sNext.y += deltaY
    this.updatePath(sNext, ePre)
  }
  @action
  moveEndPoint(deltaX: number, deltaY: number): void {
    this.endPoint.x += deltaX
    this.endPoint.y += deltaY
    const [, sNext, ePre] = this.pointsList
    // 保持调整点一起移动
    ePre.x += deltaX
    ePre.y += deltaY
    this.updatePath(sNext, ePre)
  }
  @action
  updateAdjustAnchor(anchor: Point, type: string) {
    if (type === 'sNext') {
      this.pointsList[1] = anchor
    } else if (type === 'ePre') {
      this.pointsList[2] = anchor
    }
    this.path = this.getPath(this.pointsList)
    if (this.text?.value) {
      this.setText(assign({}, this.text, this.textPosition))
    }
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
  // 起终点拖拽调整过程中，进行曲线路径更新
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
    const { sNext, ePre } = getBezierControlPoints({
      start: startPoint,
      end: endPoint,
      sourceNode,
      targetNode,
      offset: this.offset,
    })
    this.pointsList = [startPoint, sNext, ePre, endPoint]
    this.initPoints()
  }
}

export default BezierEdgeModel
