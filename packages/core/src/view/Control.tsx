import { createElement as h, Component } from 'preact/compat'
import { cloneDeep, find, forEach, map } from 'lodash-es'
import { Rect } from './shape'
import LogicFlow from '../LogicFlow'
import { getNodeBBox, IDragParams, StepDrag, handleResize } from '../util'
import { BaseNodeModel, GraphModel } from '../model'

import NodeData = LogicFlow.NodeData
import VectorData = LogicFlow.VectorData
import { EventType } from '../constant'
import ResizeInfo = ResizeControl.ResizeInfo
import ResizeNodeData = ResizeControl.ResizeNodeData
import ControlItemProps = ResizeControl.ControlItemProps

export enum ResizeControlIndex {
  LEFT_TOP = 0,
  RIGHT_TOP = 1,
  RIGHT_BOTTOM = 2,
  LEFT_BOTTOM = 3,
}

export type IResizeControlProps = {
  model: BaseNodeModel
  graphModel: GraphModel
} & ControlItemProps

export type IResizeControlState = {
  startX: number
  startY: number
  endX: number
  endY: number
  dragging: boolean
}

export class ResizeControl extends Component<
  IResizeControlProps,
  IResizeControlState
> {
  readonly index: ResizeControlIndex
  readonly nodeModel: BaseNodeModel
  readonly graphModel: GraphModel
  readonly dragHandler: StepDrag

  constructor(props: IResizeControlProps) {
    super()
    const { index, model, graphModel } = props
    this.index = index
    this.nodeModel = model
    this.graphModel = graphModel

    // 初始化拖拽工具
    this.dragHandler = new StepDrag({
      onDragging: this.onDragging,
      onDragEnd: this.onDragEnd,
      step: graphModel.gridSize,
    })
  }

  componentWillUnmount() {
    this.dragHandler.destroy()
  }

  updateEdgePointByAnchors = () => {
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
    const { id, anchors } = this.nodeModel
    const edges = this.graphModel.getNodeEdges(id)
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

  triggerResizeEvent = (
    preNodeData: ResizeNodeData,
    curNodeData: ResizeNodeData,
    deltaX,
    deltaY,
    index,
    nodeModel: BaseNodeModel,
  ) => {
    this.graphModel.eventCenter.emit(EventType.NODE_RESIZE, {
      preData: preNodeData,
      data: curNodeData,
      deltaX,
      deltaY,
      index,
      model: nodeModel,
    })
  }

  /**
   * 计算 Control 拖动后，节点的高度信息
   * @param index
   * @param resizeInfo
   * @param pct
   * @param freezeWidth
   * @param freezeHeight
   */
  recalcResizeInfo = (
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

  resizeNode = ({ deltaX, deltaY }: VectorData) => {
    const { index } = this
    const { model, graphModel, x, y } = this.props

    // DONE: 调用每个节点中更新缩放时的方法 updateNode 函数，用来各节点缩放的方法
    handleResize({
      x,
      y,
      deltaX,
      deltaY,
      index,
      nodeModel: model,
      graphModel,
      cancelCallback: () => {
        this.dragHandler.cancelDrag()
      },
    })
    // 1. 计算当前 Control 的一些信息，
    // const {
    //   r, // circle
    //   rx, // ellipse/diamond
    //   ry,
    //   width, // rect/html
    //   height,
    //   PCTResizeInfo,
    //
    //   minWidth,
    //   minHeight,
    //   maxWidth,
    //   maxHeight,
    // } = this.nodeModel
    // const isFreezeWidth = minWidth === maxWidth
    // const isFreezeHeight = minHeight === maxHeight
    //
    // const resizeInfo = {
    //   width: r || rx || width,
    //   height: r || ry || height,
    //   deltaX,
    //   deltaY,
    //   PCTResizeInfo,
    // }
    //
    // const pct = r || (rx && ry) ? 1 / 2 : 1
    // const nextSize = this.recalcResizeInfo(
    //   this.index,
    //   resizeInfo,
    //   pct,
    //   isFreezeWidth,
    //   isFreezeHeight,
    // )
    //
    // // 限制放大缩小的最大最小范围
    // if (
    //   nextSize.width < minWidth ||
    //   nextSize.width > maxWidth ||
    //   nextSize.height < minHeight ||
    //   nextSize.height > maxHeight
    // ) {
    //   this.dragHandler.cancelDrag()
    //   return
    // }
    // // 如果限制了宽高不变，对应的 x/y 不产生位移
    // nextSize.deltaX = isFreezeWidth ? 0 : nextSize.deltaX
    // nextSize.deltaY = isFreezeWidth ? 0 : nextSize.deltaY
    //
    // const preNodeData = this.nodeModel.getData()
    // const curNodeData = this.nodeModel.resize(nextSize)
    //
    // // 更新边
    // this.updateEdgePointByAnchors()
    // // 触发 resize 事件
    // this.triggerResizeEvent(preNodeData, curNodeData, deltaX, deltaY, this.index, this.nodeModel)
  }

  onDragging = ({ deltaX, deltaY }: IDragParams) => {
    const { transformModel } = this.graphModel
    const [dx, dy] = transformModel.fixDeltaXY(deltaX, deltaY)

    this.resizeNode({
      deltaX: dx,
      deltaY: dy,
    })
  }

  // 由于将拖拽放大缩小改成丝滑模式，这个时候需要再拖拽结束的时候，将节点的位置更新到 grid 上。
  onDragEnd = () => {
    // TODO: 确认下面该代码是否还需要（应该是默认让节点拖拽以 gridSize 为步长移动）
    // const { gridSize = 1 } = this.graphModel
    // const x = gridSize * Math.round(this.nodeModel.x / gridSize)
    // const y = gridSize * Math.round(this.nodeModel.y / gridSize)
    const x = this.nodeModel.x
    const y = this.nodeModel.y
    this.nodeModel.moveTo(x, y)

    // 先触发 onDragging() -> 更新边 -> 再触发用户自定义的 getDefaultAnchor()，所以 onDragging()
    // 拿到的 anchors 是滞后的，为了正确的设置最终的位置，应该在拖拽结束的时候，再设置一次边的 Point 位置，
    // 此时拿到的 anchors 是最新的
    this.updateEdgePointByAnchors()
  }

  render(): h.JSX.Element {
    const { x, y, direction, model } = this.props
    const { width, height, ...restStyle } = model.getResizeControlStyle()
    return (
      <g className={`lf-resize-control lf-resize-control-${direction}`}>
        <Rect
          className="lf-resize-control-content"
          x={x}
          y={y}
          width={width ?? 7}
          height={height ?? 7}
          {...restStyle}
        />
        <Rect
          className="lf-resize-control-content"
          x={x}
          y={y}
          width={25}
          height={25}
          fill="transparent"
          stroke="transparent"
          onMouseDown={this.dragHandler.handleMouseDown}
        />
      </g>
    )
  }
}

interface IResizeControlGroupProps {
  style: LogicFlow.CommonTheme
  model: BaseNodeModel
  graphModel: GraphModel
}

export class ResizeControlGroup extends Component<IResizeControlGroupProps> {
  constructor() {
    super()
  }

  getResizeControl(): h.JSX.Element[] {
    const { model, graphModel } = this.props
    const { minX, minY, maxX, maxY } = getNodeBBox(model)

    const controlList: ControlItemProps[] = [
      {
        index: ResizeControlIndex.LEFT_TOP,
        direction: 'nw',
        x: minX,
        y: minY,
      }, // 左上角
      {
        index: ResizeControlIndex.RIGHT_TOP,
        direction: 'ne',
        x: maxX,
        y: minY,
      }, // 右上角
      {
        index: ResizeControlIndex.RIGHT_BOTTOM,
        direction: 'se',
        x: maxX,
        y: maxY,
      }, // 右下角
      {
        index: ResizeControlIndex.LEFT_BOTTOM,
        direction: 'sw',
        x: minX,
        y: maxY,
      }, // 左下角
    ]

    return map(controlList, (control) => (
      <ResizeControl {...control} model={model} graphModel={graphModel} />
    ))
  }

  getResizeOutline() {
    const { model } = this.props
    const { x, y, width, height } = model
    const style = model.getResizeOutlineStyle()
    return <Rect {...style} x={x} y={y} width={width} height={height} />
  }

  render(): h.JSX.Element {
    return (
      <g className="lf-resize-control-group">
        {this.getResizeOutline()}
        {this.getResizeControl()}
      </g>
    )
  }
}

export namespace ResizeControl {
  export type RectShapeResizeProps = {
    width: number
    height: number
  }

  export type PolygonShapeResizerProps = {
    rx: number
    ry: number
  }
  export type ResizeProps = RectShapeResizeProps | PolygonShapeResizerProps

  export type ResizeInfo = {
    width: number
    height: number
    deltaX: number
    deltaY: number
    PCTResizeInfo?: PCTResizeParams
  }
  export type ResizeNodeData = NodeData & Partial<ResizeProps>

  export type Direction = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'
  export type ControlItemProps = {
    index: ResizeControlIndex
    direction: Direction
    x: number
    y: number
  }

  export type PCTResizeParams = {
    ResizePCT: {
      widthPCT: number
      heightPCT: number
    }
    ResizeBasis: {
      basisWidth: number
      basisHeight: number
    }
    ScaleLimit: {
      maxScaleLimit: number
      minScaleLimit: number
    }
  }
}

export default ResizeControlGroup
