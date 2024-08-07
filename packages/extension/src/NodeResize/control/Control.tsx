import {
  h,
  Component,
  GraphModel,
  BaseNodeModel,
  BaseEdgeModel,
  RectNodeModel,
  DiamondNodeModel,
  EllipseNodeModel,
  ModelType,
  Rect,
  LogicFlowUtil,
} from '@logicflow/core'
import { RectResizeModel } from '../node'

type VectorData = Record<'deltaX' | 'deltaY', number>

const { StepDrag } = LogicFlowUtil

interface IControlProps {
  index: number
  x: number
  y: number
  model: BaseNodeModel
  graphModel: GraphModel
  style?: CSSStyleDeclaration
}

interface IControlState {
  startX: number
  startY: number
  endX: number
  endY: number
  dragging: boolean
}

class Control extends Component<IControlProps, IControlState> {
  index: number
  nodeModel: BaseNodeModel
  graphModel: GraphModel
  dragHandler: LogicFlowUtil.StepDrag

  constructor(props: IControlProps) {
    super()
    this.index = props.index
    this.nodeModel = props.model
    this.graphModel = props.graphModel
    // 为保证对齐线功能正常使用，step默认是网格grid的两倍，
    // 没有网格设置，默认为2，保证坐标是整数
    // let step = 2;
    // if (gridSize > 1) {
    //   step = 2 * gridSize;
    // }
    // if (this.nodeModel.gridSize) {
    //   step = 2 * this.nodeModel.gridSize;
    // }

    this.dragHandler = new StepDrag({
      onDragging: this.onDragging,
      onDragEnd: this.onDragEnd,
      step: 1,
    })
  }

  getNodeEdges(nodeId: string) {
    const { graphModel } = this
    const { edges } = graphModel
    const sourceEdges: BaseEdgeModel[] = []
    const targetEdges: BaseEdgeModel[] = []
    for (let i = 0; i < edges.length; i++) {
      const edgeModel = edges[i]
      if (edgeModel.sourceNodeId === nodeId) {
        sourceEdges.push(edgeModel)
      } else if (edges[i].targetNodeId === nodeId) {
        targetEdges.push(edgeModel)
      }
    }
    return {
      sourceEdges,
      targetEdges,
    }
  }

  // 更新中心点位置，更新文案位置
  updatePosition = ({ deltaX, deltaY }: VectorData) => {
    const { x, y } = this.nodeModel
    this.nodeModel.x = x + deltaX / 2
    this.nodeModel.y = y + deltaY / 2
    this.nodeModel.moveText(deltaX / 2, deltaY / 2)
  }
  // 计算control拖动后，节点的宽高
  getResize = ({
    index,
    deltaX,
    deltaY,
    width,
    height,
    PCTResizeInfo,
    pct = 1,
    freezeWidth = false,
    freezeHeight = false,
  }: any) => {
    // TODO: 定义 getResize 方法的参数类型
    const resize = {
      width,
      height,
      deltaX,
      deltaY,
    }
    if (PCTResizeInfo) {
      const sensitivity = 4 // 越低越灵敏
      let deltaScale = 0
      let combineDelta = 0
      switch (index) {
        case 0:
          combineDelta = (deltaX * -1 - deltaY) / sensitivity
          break
        case 1:
          combineDelta = (deltaX - deltaY) / sensitivity
          break
        case 2:
          combineDelta = (deltaX + deltaY) / sensitivity
          break
        case 3:
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
        case 0:
          deltaX = width - spcWidth
          deltaY = height - spcHeight
          break
        case 1:
          deltaX = spcWidth - width
          deltaY = height - spcHeight
          break
        case 2:
          deltaX = spcWidth - width
          deltaY = spcHeight - height
          break
        case 3:
          deltaX = width - spcWidth
          deltaY = spcHeight - height
          break
        default:
          break
      }
      resize.width = spcWidth
      resize.height = spcHeight
      resize.deltaX = deltaX / pct
      resize.deltaY = deltaY / pct
      return resize
    }
    // 如果限制了宽/高不变，对应的width/height保持一致
    switch (index) {
      case 0:
        resize.width = freezeWidth ? width : width - deltaX * pct
        resize.height = freezeHeight ? height : height - deltaY * pct
        break
      case 1:
        resize.width = freezeWidth ? width : width + deltaX * pct
        resize.height = freezeHeight ? height : height - deltaY * pct
        break
      case 2:
        resize.width = freezeWidth ? width : width + deltaX * pct
        resize.height = freezeHeight ? height : height + deltaY * pct
        break
      case 3:
        resize.width = freezeWidth ? width : width - deltaX * pct
        resize.height = freezeHeight ? height : height + deltaY * pct
        break
      default:
        break
    }
    return resize
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
    const edges = this.getNodeEdges(id)
    // 更新边
    edges.sourceEdges.forEach((item) => {
      const anchorItem = anchors.find(
        (anchor) => anchor.id === item.sourceAnchorId,
      )
      if (anchorItem) {
        item.updateStartPoint({
          x: anchorItem.x,
          y: anchorItem.y,
        })
      }
    })
    edges.targetEdges.forEach((item) => {
      const anchorItem = anchors.find(
        (anchor) => anchor.id === item.targetAnchorId,
      )
      if (anchorItem) {
        item.updateEndPoint({
          x: anchorItem.x,
          y: anchorItem.y,
        })
      }
    })
  }
  // 矩形更新
  updateRect = ({ deltaX, deltaY }: VectorData) => {
    const { x, y, width, height, radius, PCTResizeInfo } = this
      .nodeModel as RectNodeModel
    const { minWidth, minHeight, maxWidth, maxHeight } = this
      .nodeModel as RectResizeModel
    // 更新中心点位置，更新文案位置
    const { index } = this
    const freezeWidth = minWidth === maxWidth
    const freezeHeight = minHeight === maxHeight
    const size = this.getResize({
      index,
      deltaX,
      deltaY,
      width,
      height,
      PCTResizeInfo,
      pct: 1,
      freezeWidth,
      freezeHeight,
    })
    // 限制放大缩小的最大最小范围
    if (
      size.width < minWidth ||
      size.width > maxWidth ||
      size.height < minHeight ||
      size.height > maxHeight
    ) {
      // 为了避免放到和缩小位置和鼠标不一致的问题
      this.dragHandler.cancelDrag()
      return
    }
    // 如果限制了宽/高不变，对应的x/y不产生位移
    this.updatePosition({
      deltaX: freezeWidth ? 0 : size.deltaX,
      deltaY: freezeHeight ? 0 : size.deltaY,
    })
    // 更新宽高
    this.nodeModel.width = size.width
    this.nodeModel.height = size.height
    this.nodeModel.setProperties({
      nodeSize: {
        width: size.width,
        height: size.height,
      },
    })
    // const edges = this.getNodeEdges(id)
    const beforeNode = {
      x,
      y,
      width,
      height,
      radius,
    }
    const afterNode = {
      x: this.nodeModel.x,
      y: this.nodeModel.y,
      width: this.nodeModel.width,
      height: this.nodeModel.height,
      radius,
    }
    // 更新边
    this.updateEdgePointByAnchors()
    this.eventEmit({
      deltaX,
      deltaY,
      beforeNode,
      afterNode,
    })
  }
  // 椭圆更新
  updateEllipse = ({ deltaX, deltaY }: VectorData) => {
    const { rx, ry, x, y, PCTResizeInfo } = this.nodeModel as EllipseNodeModel
    const { index } = this
    const { minWidth, minHeight, maxWidth, maxHeight } = this
      .nodeModel as RectResizeModel
    const freezeWidth = minWidth === maxWidth
    const freezeHeight = minHeight === maxHeight
    const width = rx
    const height = ry
    const size = this.getResize({
      index,
      deltaX,
      deltaY,
      width,
      height,
      PCTResizeInfo,
      pct: 1 / 2,
      freezeWidth,
      freezeHeight,
    })
    // 限制放大缩小的最大最小范围
    if (
      size.width < minWidth / 2 ||
      size.width > maxWidth / 2 ||
      size.height < minHeight / 2 ||
      size.height > maxHeight / 2
    ) {
      this.dragHandler.cancelDrag()
      return
    }
    // 更新中心点位置，更新文案位置
    // 如果限制了宽/高不变，对应的x/y不产生位移
    this.updatePosition({
      deltaX: freezeWidth ? 0 : size.deltaX,
      deltaY: freezeHeight ? 0 : size.deltaY,
    })
    // 更新rx ry,宽高为计算属性自动更新
    // @ts-ignore
    this.nodeModel.rx = size.width
    // @ts-ignore
    this.nodeModel.ry = size.height
    this.nodeModel.setProperties({
      nodeSize: {
        rx: size.width,
        ry: size.height,
      },
    })

    const beforeNode = {
      x,
      y,
    }
    const afterNode = {
      rx: size.width,
      ry: size.height,
      x: this.nodeModel.x,
      y: this.nodeModel.y,
    }
    // 更新边
    this.updateEdgePointByAnchors()
    this.eventEmit({
      deltaX,
      deltaY,
      beforeNode: {
        ...beforeNode,
        rx,
        ry,
      },
      afterNode,
    })
  }
  // 菱形更新
  updateDiamond = ({ deltaX, deltaY }: VectorData) => {
    const { rx, ry, x, y, PCTResizeInfo } = this.nodeModel as DiamondNodeModel
    const { index } = this
    const { minWidth, minHeight, maxWidth, maxHeight } = this
      .nodeModel as RectResizeModel
    const freezeWidth = minWidth === maxWidth
    const freezeHeight = minHeight === maxHeight
    const width = rx
    const height = ry
    const size = this.getResize({
      index,
      deltaX,
      deltaY,
      width,
      height,
      PCTResizeInfo,
      pct: 1 / 2,
      freezeWidth,
      freezeHeight,
    })
    // 限制放大缩小的最大最小范围
    if (
      size.width < minWidth / 2 ||
      size.width > maxWidth / 2 ||
      size.height < minHeight / 2 ||
      size.height > maxHeight / 2
    ) {
      this.dragHandler.cancelDrag()
      return
    }
    // 更新中心点位置，更新文案位置
    // 如果限制了宽/高不变，对应的x/y不产生位移
    this.updatePosition({
      deltaX: freezeWidth ? 0 : size.deltaX,
      deltaY: freezeHeight ? 0 : size.deltaY,
    })
    // 更新rx ry,宽高为计算属性自动更新
    // @ts-ignore
    this.nodeModel.rx = size.width
    // @ts-ignore
    this.nodeModel.ry = size.height
    this.nodeModel.setProperties({
      nodeSize: {
        rx: size.width,
        ry: size.height,
      },
    })
    const beforeNode = {
      x,
      y,
      rx,
      ry,
    }
    const afterNode = {
      rx: size.width,
      ry: size.height,
      x: this.nodeModel.x,
      y: this.nodeModel.y,
    }
    // 更新边
    this.updateEdgePointByAnchors()
    this.eventEmit({
      deltaX,
      deltaY,
      beforeNode,
      afterNode,
    })
  }
  eventEmit = ({ deltaX, deltaY, beforeNode, afterNode }: any) => {
    const { id, modelType, type } = this.nodeModel
    const oldNodeSize = {
      id,
      modelType,
      type,
      ...beforeNode,
    }
    const newNodeSize = {
      id,
      modelType,
      type,
      ...afterNode,
    }
    this.graphModel.eventCenter.emit('node:resize', {
      preData: oldNodeSize,
      data: newNodeSize,
      deltaX,
      deltaY,
      index: this.index,
      model: this.nodeModel,
    })
  }
  onDragging = ({ deltaX, deltaY }: VectorData) => {
    const { transformModel } = this.graphModel
    const { modelType } = this.nodeModel
    ;[deltaX, deltaY] = transformModel.fixDeltaXY(deltaX, deltaY)
    // html和矩形的计算方式是一样的，共用一个方法
    if (
      modelType === ModelType.RECT_NODE ||
      modelType === ModelType.HTML_NODE
    ) {
      this.updateRect({
        deltaX,
        deltaY,
      })
      // this.nodeModel.resize(deltaX, deltaY);
    } else if (modelType === ModelType.ELLIPSE_NODE) {
      this.updateEllipse({
        deltaX,
        deltaY,
      })
    } else if (modelType === ModelType.DIAMOND_NODE) {
      this.updateDiamond({
        deltaX,
        deltaY,
      })
    }
  }
  /**
   * 由于将拖拽放大缩小改成丝滑模式，这个时候需要在拖拽结束的时候，将节点的位置更新到grid上.
   */
  onDragEnd = () => {
    const { gridSize = 1 } = this.graphModel
    const x = gridSize * Math.round(this.nodeModel.x / gridSize)
    const y = gridSize * Math.round(this.nodeModel.y / gridSize)
    this.nodeModel.moveTo(x, y)

    // 先触发onDragging()->更新边->再触发用户自定义的getDefaultAnchor()，所以onDragging()拿到的anchors是滞后的
    // 为了正确设置最终的位置，应该在拖拽结束的时候，再设置一次边的Point位置，此时拿到的anchors是最新的
    this.updateEdgePointByAnchors()
  }

  render(): h.JSX.Element {
    const { x, y, index, model } = this.props
    const style = (model as RectResizeModel).getControlPointStyle()
    return (
      <g className={`lf-resize-control-${index}`}>
        <Rect
          className="lf-node-control"
          x={x}
          y={y}
          {...style}
          onMouseDown={this.dragHandler.handleMouseDown}
        />
      </g>
    )
  }
}

export default Control
