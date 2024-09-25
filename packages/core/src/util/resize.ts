import { ResizeControl, ResizeControlIndex } from '../view/Control'
import { cloneDeep, find, forEach } from 'lodash-es'
import { BaseNodeModel, GraphModel } from '../model'
import { EventType } from '../constant'

import ResizeInfo = ResizeControl.ResizeInfo
import ResizeNodeData = ResizeControl.ResizeNodeData
import {
  calculatePointAfterRotateAngle,
  getNewCenter,
  radianToAngle,
} from '../algorithm/rotate'
import type { SimplePoint } from '../algorithm/rotate'

function recalcRotatedResizeInfo(
  pct: number,
  resizeInfo: ResizeInfo,
  rotate: number,
  controlX: number,
  controlY: number,
  oldCenterX: number,
  oldCenterY: number,
  freezeWidth = false,
  freezeHeight = false,
) {
  // 假设我们触摸的点是右下角的control
  const { deltaX, deltaY, width: oldWidth, height: oldHeight } = resizeInfo
  const angle = radianToAngle(rotate)

  // 右下角的control
  const startZeroTouchControlPoint = {
    x: controlX, // control锚点的坐标x
    y: controlY, // control锚点的坐标y
  }
  const oldCenter = { x: oldCenterX, y: oldCenterY }
  // 右下角的control坐标（transform后的-touchStartPoint）
  const startRotatedTouchControlPoint = calculatePointAfterRotateAngle(
    startZeroTouchControlPoint,
    oldCenter,
    angle,
  )
  // 右下角的control坐标（transform后的-touchEndPoint）
  const endRotatedTouchControlPoint = {
    x: startRotatedTouchControlPoint.x + deltaX,
    y: startRotatedTouchControlPoint.y + deltaY,
  }
  // 计算出新的宽度和高度以及新的中心点
  const {
    width: newWidth,
    height: newHeight,
    center: newCenter,
  } = calculateWidthAndHeight(
    startRotatedTouchControlPoint,
    endRotatedTouchControlPoint,
    oldCenter,
    angle,
    freezeWidth,
    freezeHeight,
    oldWidth,
    oldHeight,
  )
  // calculateWidthAndHeight()得到的是整个宽度，比如圆pct=0.5,此时newWidth等于整个圆直径
  resizeInfo.width = newWidth * pct
  resizeInfo.height = newHeight * pct

  // BaseNodeModel.resize(deltaX/2, deltaY/2)，因此这里要*2
  resizeInfo.deltaX = (newCenter.x - oldCenter.x) * 2
  resizeInfo.deltaY = (newCenter.y - oldCenter.y) * 2

  return resizeInfo
}

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
  rotate = 0,
  controlX: number | undefined,
  controlY: number | undefined,
  oldCenterX: number,
  oldCenterY: number,
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
  if (
    rotate % (2 * Math.PI) !== 0 &&
    controlX !== undefined &&
    controlY !== undefined
  ) {
    // 角度rotate不为0，则触发另外的计算修正resize的deltaX和deltaY
    // 因为rotate不为0的时候，左上角的坐标一直在变化
    // 角度rotate不为0得到的resizeInfo.deltaX仅仅代表中心点的变化，而不是宽度的变化
    return recalcRotatedResizeInfo(
      pct,
      nextResizeInfo,
      rotate,
      controlX,
      controlY,
      oldCenterX,
      oldCenterY,
      freezeWidth,
      freezeHeight,
    )
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
export type IHandleResizeParams = {
  x?: number
  y?: number
  deltaX: number
  deltaY: number
  index: ResizeControlIndex
  nodeModel: BaseNodeModel
  graphModel: GraphModel
  cancelCallback?: () => void
}

/**
 * 处理节点的 resize 事件，提出来放到 utils 中，方便在外面（extension）中使用
 * @param x
 * @param y
 * @param deltaX
 * @param deltaY
 * @param index
 * @param nodeModel
 * @param graphModel
 * @param cancelCallback
 */
export const handleResize = ({
  x,
  y,
  deltaX,
  deltaY,
  index,
  nodeModel,
  graphModel,
  cancelCallback,
}: IHandleResizeParams) => {
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
    rotate,
    x: oldCenterX,
    y: oldCenterY,
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
  const controlX = x
  const controlY = y
  const nextSize = recalcResizeInfo(
    index,
    resizeInfo,
    pct,
    isFreezeWidth,
    isFreezeHeight,
    rotate,
    controlX,
    controlY,
    oldCenterX,
    oldCenterY,
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
  if (
    rotate % (2 * Math.PI) == 0 ||
    PCTResizeInfo ||
    controlX === undefined ||
    controlY === undefined
  ) {
    // rotate!==0并且不是PCTResizeInfo时，即使是isFreezeWidth||isFreezeHeight
    // recalcRotatedResizeInfo()计算出来的中心点会发生变化

    // 如果限制了宽高不变，对应的 x/y 不产生位移
    nextSize.deltaX = isFreezeWidth ? 0 : nextSize.deltaX
    nextSize.deltaY = isFreezeHeight ? 0 : nextSize.deltaY
  }

  const preNodeData = nodeModel.getData()
  const curNodeData = nodeModel.resize(nextSize)

  // 检测preNodeData和curNodeData是否没变化
  if (preNodeData.x === curNodeData.x && preNodeData.y === curNodeData.y) {
    // 中心点x和y都没有变化，说明无法resize，阻止下面边的更新以及resize事件的emit
    return
  }

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

export function calculateWidthAndHeight(
  startRotatedTouchControlPoint: SimplePoint,
  endRotatedTouchControlPoint: SimplePoint,
  oldCenter: SimplePoint,
  angle: number,
  freezeWidth = false,
  freezeHeight = false,
  oldWidth: number,
  oldHeight: number,
) {
  // 假设目前触摸的是右下角的control点
  // 计算出来左上角的control坐标，resize过程左上角的control坐标保持不变
  const freezePoint: SimplePoint = {
    x: oldCenter.x - (startRotatedTouchControlPoint.x - oldCenter.x),
    y: oldCenter.y - (startRotatedTouchControlPoint.y - oldCenter.y),
  }
  // 【touchEndPoint】右下角 + freezePoint左上角 计算出新的中心点
  const newCenter = getNewCenter(freezePoint, endRotatedTouchControlPoint)

  // 得到【touchEndPoint】右下角-没有transform的坐标
  let endZeroTouchControlPoint: SimplePoint = calculatePointAfterRotateAngle(
    endRotatedTouchControlPoint,
    newCenter,
    -angle,
  )

  // ---------- 使用transform之前的坐标计算出新的width和height ----------

  // 得到左上角---没有transform的坐标
  let zeroFreezePoint: SimplePoint = calculatePointAfterRotateAngle(
    freezePoint,
    newCenter,
    -angle,
  )

  if (freezeWidth) {
    // 如果固定width，那么不能单纯使用endZeroTouchControlPoint.x=startZeroTouchControlPoint.x
    // 因为去掉transform的左上角不一定是重合的，我们要保证的是transform后的左上角重合
    const newWidth = Math.abs(endZeroTouchControlPoint.x - zeroFreezePoint.x)
    const widthDx = newWidth - oldWidth

    // 点击的是左边锚点，是+widthDx/2，点击是右边锚点，是-widthDx/2
    if (newCenter.x > endZeroTouchControlPoint.x) {
      // 当前触摸的是左边锚点
      newCenter.x = newCenter.x + widthDx / 2
    } else {
      // 当前触摸的是右边锚点
      newCenter.x = newCenter.x - widthDx / 2
    }
  }
  if (freezeHeight) {
    const newHeight = Math.abs(endZeroTouchControlPoint.y - zeroFreezePoint.y)
    const heightDy = newHeight - oldHeight
    if (newCenter.y > endZeroTouchControlPoint.y) {
      // 当前触摸的是上边锚点
      newCenter.y = newCenter.y + heightDy / 2
    } else {
      newCenter.y = newCenter.y - heightDy / 2
    }
  }

  if (freezeWidth || freezeHeight) {
    // 如果调整过transform之前的坐标，那么transform后的坐标也会改变，那么算出来的newCenter也得调整
    // 由于无论如何rotate，中心点都是不变的，因此我们可以使用transform之前的坐标算出新的中心点
    const nowFreezePoint = calculatePointAfterRotateAngle(
      zeroFreezePoint,
      newCenter,
      angle,
    )

    // 得到当前新rect的左上角与实际上transform后的左上角的偏移量
    const dx = nowFreezePoint.x - freezePoint.x
    const dy = nowFreezePoint.y - freezePoint.y

    // 修正不使用transform的坐标: 左上角、右下角、center
    newCenter.x = newCenter.x - dx
    newCenter.y = newCenter.y - dy
    zeroFreezePoint = calculatePointAfterRotateAngle(
      freezePoint,
      newCenter,
      -angle,
    )
    endZeroTouchControlPoint = {
      x: newCenter.x - (zeroFreezePoint.x - newCenter.x),
      y: newCenter.y - (zeroFreezePoint.y - newCenter.y),
    }
  }

  // transform之前的坐标的左上角+右下角计算出宽度和高度
  let width = Math.abs(endZeroTouchControlPoint.x - zeroFreezePoint.x)
  let height = Math.abs(endZeroTouchControlPoint.y - zeroFreezePoint.y)

  // ---------- 使用transform之前的坐标计算出新的width和height ----------

  if (freezeWidth) {
    // 理论计算出来的width应该等于oldWidth
    // 但是有误差，比如oldWidth = 100; newWidth=100.000000000001
    // 会在handleResize()限制放大缩小的最大最小范围中被阻止滑动
    width = oldWidth
  }
  if (freezeHeight) {
    height = oldHeight
  }

  return {
    width,
    height,
    center: newCenter,
  }
}
