import { ResizeControl, ResizeControlIndex } from '../view/Control'
import { cloneDeep, find, forEach } from 'lodash-es'
import { BaseNodeModel, GraphModel } from '../model'
import { EventType } from '../constant'

import ResizeInfo = ResizeControl.ResizeInfo
import ResizeNodeData = ResizeControl.ResizeNodeData

/**
 * 计算 Control 拖动后，节点的高度信息
 * @param index
 * @param resizeInfo
 * @param pct
 * @param freezeWidth
 * @param freezeHeight
 */
export const recalcResizeInfo = (
  index: ResizeControlIndex,
  resizeInfo: ResizeInfo,
  pct = 1,
  freezeWidth = false,
  freezeHeight = false,
): ResizeInfo => {
  const nextResizeInfo = cloneDeep(resizeInfo)
  let { deltaX, deltaY } = nextResizeInfo
  const { width, height, PCTResizeInfo } = nextResizeInfo
  if (PCTResizeInfo) {
    const sensitivity = 4 // 越低越灵敏
    let deltaScale = 0
    let combineDelta = 0
    switch (index) {
      case ResizeControlIndex.LEFT_TOP:
        combineDelta = (deltaX * -1 - deltaY) / sensitivity
        break
      case ResizeControlIndex.RIGHT_TOP:
        combineDelta = (deltaX - deltaY) / sensitivity
        break
      case ResizeControlIndex.RIGHT_BOTTOM:
        combineDelta = (deltaX + deltaY) / sensitivity
        break
      case ResizeControlIndex.LEFT_BOTTOM:
        combineDelta = (deltaX * -1 + deltaY) / sensitivity
        break
      default:
        break
    }

    if (combineDelta !== 0) {
      deltaScale =
        Math.round(
          (combineDelta / PCTResizeInfo.ResizeBasis.basisHeight) * 100000,
        ) / 1000
    }

    PCTResizeInfo.ResizePCT.widthPCT = Math.max(
      Math.min(
        PCTResizeInfo.ResizePCT.widthPCT + deltaScale,
        PCTResizeInfo.ScaleLimit.maxScaleLimit,
      ),
      PCTResizeInfo.ScaleLimit.minScaleLimit,
    )
    PCTResizeInfo.ResizePCT.heightPCT = Math.max(
      Math.min(
        PCTResizeInfo.ResizePCT.heightPCT + deltaScale,
        PCTResizeInfo.ScaleLimit.maxScaleLimit,
      ),
      PCTResizeInfo.ScaleLimit.minScaleLimit,
    )

    const spcWidth = Math.round(
      (PCTResizeInfo.ResizePCT.widthPCT *
        PCTResizeInfo.ResizeBasis.basisWidth) /
        100,
    )
    const spcHeight = Math.round(
      (PCTResizeInfo.ResizePCT.heightPCT *
        PCTResizeInfo.ResizeBasis.basisHeight) /
        100,
    )

    switch (index) {
      case ResizeControlIndex.LEFT_TOP:
        deltaX = width - spcWidth
        deltaY = height - spcHeight
        break
      case ResizeControlIndex.RIGHT_TOP:
        deltaX = spcWidth - width
        deltaY = height - spcHeight
        break
      case ResizeControlIndex.RIGHT_BOTTOM:
        deltaX = spcWidth - width
        deltaY = spcHeight - height
        break
      case ResizeControlIndex.LEFT_BOTTOM:
        deltaX = width - spcWidth
        deltaY = spcHeight - height
        break
      default:
        break
    }
    return nextResizeInfo
  }

  // 如果限制了宽/高不变，对应的 width/height 保持一致
  switch (index) {
    case ResizeControlIndex.LEFT_TOP:
      nextResizeInfo.width = freezeWidth ? width : width - deltaX * pct
      nextResizeInfo.height = freezeHeight ? height : height - deltaY * pct
      break
    case ResizeControlIndex.RIGHT_TOP:
      nextResizeInfo.width = freezeWidth ? width : width + deltaX * pct
      nextResizeInfo.height = freezeHeight ? height : height - deltaY * pct
      break
    case ResizeControlIndex.RIGHT_BOTTOM:
      nextResizeInfo.width = freezeWidth ? width : width + deltaX * pct
      nextResizeInfo.height = freezeHeight ? height : height + deltaY * pct
      break
    case ResizeControlIndex.LEFT_BOTTOM:
      nextResizeInfo.width = freezeWidth ? width : width - deltaX * pct
      nextResizeInfo.height = freezeHeight ? height : height + deltaY * pct
      break
    default:
      break
  }

  return nextResizeInfo
}

export const updateEdgePointByAnchors = (
  nodeModel: BaseNodeModel,
  graphModel: GraphModel,
) => {
  // https://github.com/didi/LogicFlow/issues/807
  // https://github.com/didi/LogicFlow/issues/875
  // 之前的做法，比如Rect是使用getRectResizeEdgePoint()计算边的point缩放后的位置
  // getRectResizeEdgePoint()考虑了瞄点在四条边以及在4个圆角的情况
  // 使用的是一种等比例缩放的模式，比如：
  // const pct = (y - beforeNode.y) / (beforeNode.height / 2 - radius)
  // afterPoint.y = afterNode.y + (afterNode.height / 2 - radius) * pct
  // 但是用户自定义的getDefaultAnchor()不一定是按照比例编写的
  // 它可能是 x: x + 20：每次缩放都会保持在x右边20的位置，因此用户自定义瞄点时，然后产生无法跟随的问题
  // 现在的做法是：直接获取用户自定义瞄点的位置，然后用这个位置作为边的新的起点，而不是自己进行计算
  const { id, anchors } = nodeModel
  const edges = graphModel.getNodeEdges(id)
  // 更新边
  forEach(edges, (edge) => {
    if (edge.sourceNodeId === id) {
      // 边是以该节点为 sourceNode 时
      const anchorItem = find(
        anchors,
        (anchor) => anchor.id === edge.sourceAnchorId,
      )

      if (anchorItem) {
        edge.updateStartPoint({
          x: anchorItem.x,
          y: anchorItem.y,
        })
      }
    } else if (edge.targetNodeId === id) {
      // 边是以该节点为 targetNode 时
      const anchorItem = find(
        anchors,
        (anchor) => anchor.id === edge.targetAnchorId,
      )

      if (anchorItem) {
        edge.updateEndPoint({
          x: anchorItem.x,
          y: anchorItem.y,
        })
      }
    }
  })
}

export const triggerResizeEvent = (
  preNodeData: ResizeNodeData,
  curNodeData: ResizeNodeData,
  deltaX: number,
  deltaY: number,
  index: number,
  nodeModel: BaseNodeModel,
  graphModel: GraphModel,
) => {
  graphModel.eventCenter.emit(EventType.NODE_RESIZE, {
    preData: preNodeData,
    data: curNodeData,
    deltaX,
    deltaY,
    index,
    model: nodeModel,
  })
}

// TODO：确认 handleResize 函数的类型定义
// export type IHandleResizeParams = {
//   deltaX: number
//   deltaY: number
//   index: ResizeControlIndex
//   nodeModel: BaseNodeModel
//   graphModel: GraphModel
//   cancelCallback?: () => void
// }

/**
 * 处理节点的 resize 事件，提出来放到 utils 中，方便在外面（extension）中使用
 * @param deltaX
 * @param deltaY
 * @param index
 * @param nodeModel
 * @param graphModel
 * @param cancelCallback
 */
export const handleResize = ({
  deltaX,
  deltaY,
  index,
  nodeModel,
  graphModel,
  cancelCallback,
}) => {
  const {
    r, // circle
    rx, // ellipse/diamond
    ry,
    width, // rect/html
    height,
    PCTResizeInfo,

    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
  } = nodeModel
  const isFreezeWidth = minWidth === maxWidth
  const isFreezeHeight = minHeight === maxHeight

  const resizeInfo = {
    width: r || rx || width,
    height: r || ry || height,
    deltaX,
    deltaY,
    PCTResizeInfo,
  }

  const pct = r || (rx && ry) ? 1 / 2 : 1
  const nextSize = recalcResizeInfo(
    index,
    resizeInfo,
    pct,
    isFreezeWidth,
    isFreezeHeight,
  )

  // 限制放大缩小的最大最小范围
  if (
    nextSize.width < minWidth ||
    nextSize.width > maxWidth ||
    nextSize.height < minHeight ||
    nextSize.height > maxHeight
  ) {
    // this.dragHandler.cancelDrag()
    cancelCallback?.()
    return
  }
  // 如果限制了宽高不变，对应的 x/y 不产生位移
  nextSize.deltaX = isFreezeWidth ? 0 : nextSize.deltaX
  nextSize.deltaY = isFreezeWidth ? 0 : nextSize.deltaY

  const preNodeData = nodeModel.getData()
  const curNodeData = nodeModel.resize(nextSize)

  // 更新边
  updateEdgePointByAnchors(nodeModel, graphModel)
  // 触发 resize 事件
  triggerResizeEvent(
    preNodeData,
    curNodeData,
    deltaX,
    deltaY,
    index,
    nodeModel,
    graphModel,
  )
}
