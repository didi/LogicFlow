import LogicFlow, { RectNode, RectNodeModel, Model } from '@logicflow/core'
import { find, findIndex, isEqual, isEmpty } from 'lodash-es'

class freeAnchorNodeModel extends RectNodeModel {
  allowCreateNewPoint: boolean = true
  curAnchorId: string = ''
  constructor(data: any, graphModel: any) {
    super(data, graphModel)
  }
  initNodeData(data: LogicFlow.NodeConfig<LogicFlow.PropertiesType>): void {
    super.initNodeData(data)
    this.registerEvent()
    this.setIsShowAnchor(true)
  }
  registerEvent() {
    // 鼠标移入时，实时创建锚点
    this.graphModel.eventCenter.on(
      'node:mouseenter,node:mouseleave,node:mousemove',
      ({ data, e: event }) => {
        console.log('node:mouseenter', data.type !== this.type)
        if (data.type !== this.type) return
        if (!event || !this.allowCreateNewPoint) return
        const { clientX, clientY } = event
        const {
          canvasOverlayPosition: { x, y },
        } = this.graphModel.getPointByClient({
          x: clientX,
          y: clientY,
        })

        const { x: translateX, y: translateY } =
          this.getProjectionPointFromCenter(
            x,
            y,
            this.x,
            this.y,
            this.width,
            this.height,
          )
        console.log(
          'data',
          data,
          [clientX, clientY],
          this.graphModel.transformModel.CanvasPointToHtmlPoint([
            this.x,
            this.y,
          ]),
          [this.x, this.y],
          [x, y],
          [translateX, translateY],
        )
        const anchorId = `${this.id}_${x}_${y}`
        this.anchorsOffset.push({
          id: anchorId,
          x: translateX - this.x,
          y: translateY - this.y,
        })
        this.curAnchorId = anchorId
      },
    )
    this.graphModel.eventCenter.on('node:mouseover', ({ data, e: event }) => {
      console.log('node:mouseover', data.type !== this.type)
      if (data.type !== this.type) return
      console.log('this.anchorsOffset', this.anchorsOffset)
      if (!event) return
      const { clientX, clientY } = event
      const {
        canvasOverlayPosition: { x, y },
      } = this.graphModel.getPointByClient({
        x: clientX,
        y: clientY,
      })
      // this.removeUnusedAnchors();
      if (this.curAnchorId) {
        const curAnchorIndex = findIndex(
          this.anchorsOffset,
          (anchor: any) => anchor.id === this.curAnchorId,
        )
        if (curAnchorIndex >= 0) {
          this.anchorsOffset.splice(curAnchorIndex, 1, {
            ...this.anchorsOffset[curAnchorIndex],
            x,
            y,
          })
        }
      }
    })
    // 鼠标移动实时更新锚点坐标
    this.graphModel.eventCenter.on('anchor:dragstart', ({ data }) => {
      const { id } = data
      const curAnchorIndex = findIndex(
        this.anchorsOffset,
        (anchor: any) => anchor.id === id,
      )
      if (curAnchorIndex >= 0) {
        this.allowCreateNewPoint = false
      }
    })
    this.graphModel.eventCenter.on('anchor:dragend', ({ data }) => {
      const { id } = data
      const curAnchorIndex = findIndex(
        this.anchorsOffset,
        (anchor: any) => anchor.id === id,
      )
      if (curAnchorIndex >= 0) {
        this.allowCreateNewPoint = true
      }
    })
  }
  getDefaultAnchor(): { x: number; y: number; id: string }[] {
    return []
  }
  getTargetAnchor(position: LogicFlow.Point) {
    const curAnchor = find(this.anchors, (anchor: Model.AnchorConfig) => {
      return isEqual([anchor.x, anchor.y], [position.x, position.y])
    })
    // super.getTargetAnchor会返回距离position最近的锚点信息，如果curAnchor有值的话，super.getTargetAnchor返回的就是同坐标的锚点
    // 所以这里直接return了super.getTargetAnchor
    if (!curAnchor && this.allowCreateNewPoint) {
      this.removeUnusedAnchors()
      const { x: translateX, y: translateY } =
        this.getProjectionPointFromCenter(
          position.x,
          position.y,
          this.x,
          this.y,
          this.width,
          this.height,
        )
      this.anchorsOffset.push({
        id: `${this.id}_${position.x}_${position.y}`,
        x: translateX - this.x,
        y: translateY - this.y,
      })
    }
    return super.getTargetAnchor(position)
  }
  removeUnusedAnchors() {
    const { edges: incomingEdges } = this.incoming
    const { edges: outgoingEdges } = this.outgoing
    const onUsedAnchors: any[] = []
    if (!isEmpty(incomingEdges)) {
      incomingEdges.forEach((edge) => {
        onUsedAnchors.push(edge.targetAnchorId)
      })
    }
    if (!isEmpty(incomingEdges)) {
      outgoingEdges.forEach((edge) => {
        onUsedAnchors.push(edge.sourceAnchorId)
      })
    }
    console.log('outgoingEdges', outgoingEdges)
    this.anchorsOffset = this.anchorsOffset.filter((anchor: any) =>
      onUsedAnchors.includes(anchor.id),
    )
  }
  // 获取点距矩形最近的边框的投影点坐标
  getProjectionPointFromCenter(
    px: number,
    py: number,
    cx: number,
    cy: number,
    width: number,
    height: number,
  ) {
    // 计算矩形的四个边界
    const left = cx - width / 2
    const right = cx + width / 2
    const top = cy - height / 2
    const bottom = cy + height / 2

    // 计算点到矩形四条边的投影点
    // 左边界的投影
    const projectionLeftX = left
    const projectionLeftY = Math.max(top, Math.min(py, bottom))

    // 右边界的投影
    const projectionRightX = right
    const projectionRightY = Math.max(top, Math.min(py, bottom))

    // 上边界的投影
    const projectionTopX = Math.max(left, Math.min(px, right))
    const projectionTopY = top

    // 下边界的投影
    const projectionBottomX = Math.max(left, Math.min(px, right))
    const projectionBottomY = bottom

    // 计算与点的距离，并选择最近的投影点
    const distance = (x1: number, y1: number, x2: number, y2: number) =>
      Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)

    // 计算每个投影点与点的距离
    const distanceLeft = distance(px, py, projectionLeftX, projectionLeftY)
    const distanceRight = distance(px, py, projectionRightX, projectionRightY)
    const distanceTop = distance(px, py, projectionTopX, projectionTopY)
    const distanceBottom = distance(
      px,
      py,
      projectionBottomX,
      projectionBottomY,
    )

    // 找到最短的距离并返回对应的投影点
    let minDistance = distanceLeft
    let projectionPoint = { x: projectionLeftX, y: projectionLeftY }

    if (distanceRight < minDistance) {
      minDistance = distanceRight
      projectionPoint = { x: projectionRightX, y: projectionRightY }
    }

    if (distanceTop < minDistance) {
      minDistance = distanceTop
      projectionPoint = { x: projectionTopX, y: projectionTopY }
    }

    if (distanceBottom < minDistance) {
      minDistance = distanceBottom
      projectionPoint = { x: projectionBottomX, y: projectionBottomY }
    }

    return projectionPoint
  }
}

export default {
  type: 'freeAnchorNode',
  model: freeAnchorNodeModel,
  view: RectNode,
}
