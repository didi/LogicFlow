import { Component } from 'preact/compat'
import { Circle, Line } from './shape'
import { BaseNode } from './node'
import LogicFlow from '../LogicFlow'
import { ElementState, EventType } from '../constant'
import { GraphModel, BaseNodeModel, Model } from '../model'
import {
  StepDrag,
  formatAnchorConnectValidateData,
  targetNodeInfo,
  distance,
  cancelRaf,
  createRaf,
  IDragParams,
} from '../util'

import AnchorConfig = Model.AnchorConfig
import NodeData = LogicFlow.NodeData

interface IProps {
  // x: number;
  // y: number;
  // id?: string;
  anchorData: AnchorConfig
  node: BaseNode<any>
  style?: Record<string, any>
  hoverStyle?: Record<string, any>
  edgeStyle?: Record<string, any>
  anchorIndex: number
  graphModel: GraphModel
  nodeModel: BaseNodeModel
  setHoverOff: (e: MouseEvent) => void
}

interface IState {
  startX: number
  startY: number
  endX: number
  endY: number
  dragging: boolean
}

class Anchor extends Component<IProps, IState> {
  preTargetNode?: BaseNodeModel
  sourceRuleResults: Map<string, Model.ConnectRuleResult> // 不同的target，source的校验规则产生的结果不同
  targetRuleResults: Map<string, Model.ConnectRuleResult> // 不同的target，target的校验规则不同
  dragHandler: StepDrag
  t: any

  constructor() {
    super()
    this.sourceRuleResults = new Map()
    this.targetRuleResults = new Map()

    this.state = {
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0,
      dragging: false,
    }
    this.dragHandler = new StepDrag({
      onDragStart: this.onDragStart,
      onDragging: this.onDragging,
      onDragEnd: this.onDragEnd,
    })
  }

  getAnchorShape() {
    const { anchorData, style, node } = this.props
    const anchorShape = node.getAnchorShape(anchorData)
    if (anchorShape) return anchorShape
    const { x, y } = anchorData
    const hoverStyle = {
      ...style,
      ...style?.hover,
    }
    return (
      <g>
        <Circle
          className="lf-node-anchor-hover"
          {...hoverStyle}
          {...{
            x,
            y,
          }}
        />
        <Circle
          className="lf-node-anchor"
          {...style}
          {...{
            x,
            y,
          }}
        />
      </g>
    )
  }

  // TODO: 确定 event 是否会有 null 和 undefined 的情况，事件类型做相应的适配
  onDragStart = ({ event }: Partial<IDragParams>) => {
    const { anchorData, nodeModel, graphModel } = this.props
    graphModel.selectNodeById(nodeModel.id)
    if (nodeModel.autoToFront) {
      graphModel.toFront(nodeModel.id)
    }
    graphModel.eventCenter.emit(EventType.ANCHOR_DRAGSTART, {
      data: anchorData,
      e: event!,
      nodeModel,
    })
    this.setState({
      startX: anchorData.x,
      startY: anchorData.y,
      endX: anchorData.x,
      endY: anchorData.y,
    })
  }
  onDragging = ({ event }: IDragParams) => {
    const { graphModel, nodeModel, anchorData } = this.props
    const {
      transformModel,
      eventCenter,
      width,
      height,
      editConfigModel: { autoExpand, stopMoveGraph },
    } = graphModel
    // TODO：确认该方法是否有影响！理论上 onDragging 时 event 必有值
    if (!event) return
    const { clientX, clientY } = event
    const {
      domOverlayPosition: { x, y },
      canvasOverlayPosition: { x: x1, y: y1 },
    } = graphModel.getPointByClient({
      x: clientX,
      y: clientY,
    })
    if (this.t) {
      cancelRaf(this.t)
    }
    let nearBoundary: number[] = [] // TODO: 定义元组类型 Tuple
    const size = 10
    if (x < 10) {
      nearBoundary = [size, 0]
    } else if (x + 10 > width) {
      nearBoundary = [-size, 0]
    } else if (y < 10) {
      nearBoundary = [0, size]
    } else if (y + 10 > height) {
      nearBoundary = [0, -size]
    }
    this.setState({
      endX: x1,
      endY: y1,
      dragging: true,
    })
    this.moveAnchorEnd(x1, y1)
    if (nearBoundary.length > 0 && !stopMoveGraph && autoExpand) {
      this.t = createRaf(() => {
        const [translateX, translateY] = nearBoundary
        transformModel.translate(translateX, translateY)
        const { endX, endY } = this.state
        this.setState({
          endX: endX - translateX,
          endY: endY - translateY,
        })
        this.moveAnchorEnd(endX - translateX, endY - translateY)
      })
    }
    eventCenter.emit(EventType.ANCHOR_DRAG, {
      data: anchorData,
      e: event,
      nodeModel,
    })
  }
  onDragEnd = ({ event }: Partial<IDragParams>) => {
    if (this.t) {
      cancelRaf(this.t)
    }
    const edgeModel = this.checkEnd(event)
    this.setState({
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0,
      dragging: false,
    })
    // 清除掉缓存结果 fix:#320 因为创建边之后，会影响校验结果变化，所以需要重新校验
    this.sourceRuleResults.clear()
    this.targetRuleResults.clear()
    const { graphModel, nodeModel, anchorData } = this.props

    graphModel.eventCenter.emit(EventType.ANCHOR_DRAGEND, {
      data: anchorData,
      e: event!,
      nodeModel,
      edgeModel: edgeModel ?? undefined,
    })
  }

  get customTrajectory() {
    const {
      graphModel: { customTrajectory },
    } = this.props
    return customTrajectory
  }

  get relateEdges() {
    const {
      graphModel: { getAnchorIncomingEdge, getAnchorOutgoingEdge },
      anchorData: { id },
    } = this.props
    return {
      incomingEdgeList: getAnchorIncomingEdge(id),
      outgoingEdgeList: getAnchorOutgoingEdge(id),
    }
  }

  checkEnd = (event: MouseEvent | null | undefined) => {
    const {
      graphModel,
      nodeModel,
      anchorData: { x, y, id },
    } = this.props
    // nodeModel.setSelected(false);
    /* 创建边 */
    const { endX, endY, dragging } = this.state
    const info = targetNodeInfo(
      {
        x: endX,
        y: endY,
      },
      graphModel,
    )
    // 为了保证鼠标离开的时候，将上一个节点状态重置为正常状态。
    if (
      this.preTargetNode &&
      this.preTargetNode.state !== ElementState.DEFAULT
    ) {
      this.preTargetNode.setElementState(ElementState.DEFAULT)
    }
    // 没有dragging就结束边
    if (!dragging) return
    if (info && info.node) {
      const targetNode = info.node
      const anchorId = info.anchor.id
      const targetInfoId = `${nodeModel.id}_${targetNode.id}_${anchorId}_${id}`
      const { isAllPass: isSourcePass, msg: sourceMsg } =
        this.sourceRuleResults.get(targetInfoId) || {}
      const { isAllPass: isTargetPass, msg: targetMsg } =
        this.targetRuleResults.get(targetInfoId) || {}
      if (isSourcePass && isTargetPass) {
        targetNode.setElementState(ElementState.DEFAULT)
        const targetNodeModel = graphModel.getNodeModelById(info.node.id)
        const edgeData = graphModel.edgeGenerator?.(
          nodeModel.getData(),
          targetNodeModel?.getData() as NodeData,
        )
        const edgeModel = graphModel.addEdge({
          ...edgeData,
          sourceNodeId: nodeModel.id,
          sourceAnchorId: id,
          startPoint: {
            x,
            y,
          },
          targetNodeId: info.node.id,
          targetAnchorId: info.anchor.id,
          endPoint: {
            x: info.anchor.x,
            y: info.anchor.y,
          },
        })
        const { anchorData } = this.props
        graphModel.eventCenter.emit(EventType.ANCHOR_DROP, {
          data: anchorData,
          e: event!,
          nodeModel,
          edgeModel,
        })
        return edgeModel
      }
      const nodeData = targetNode.getData()
      graphModel.eventCenter.emit(EventType.CONNECTION_NOT_ALLOWED, {
        data: nodeData,
        msg: targetMsg || sourceMsg || '不允许添加连线',
      })
      return null
    }
  }

  moveAnchorEnd(endX: number, endY: number) {
    const { graphModel, nodeModel, anchorData } = this.props
    const info = targetNodeInfo(
      {
        x: endX,
        y: endY,
      },
      graphModel,
    )
    if (info) {
      const targetNode = info.node
      const anchorId = info.anchor.id
      if (this.preTargetNode && this.preTargetNode !== info.node) {
        this.preTargetNode.setElementState(ElementState.DEFAULT)
      }
      // #500 不允许锚点自己连自己, 在锚点一开始连接的时候, 不触发自己连接自己的校验。
      if (anchorData.id === anchorId) {
        return
      }
      this.preTargetNode = targetNode
      // 支持节点的每个锚点单独设置是否可连接，因此规则key去nodeId + anchorId作为唯一值
      const targetInfoId = `${nodeModel.id}_${targetNode.id}_${anchorId}_${anchorData.id}`

      // 查看鼠标是否进入过target，若有检验结果，表示进入过, 就不重复计算了。
      if (!this.targetRuleResults.has(targetInfoId)) {
        const targetAnchor = info.anchor
        const sourceRuleResult = nodeModel.isAllowConnectedAsSource(
          targetNode,
          anchorData,
          targetAnchor,
        )
        const targetRuleResult = targetNode.isAllowConnectedAsTarget(
          nodeModel,
          anchorData,
          targetAnchor,
        )
        this.sourceRuleResults.set(
          targetInfoId,
          formatAnchorConnectValidateData(sourceRuleResult),
        )
        this.targetRuleResults.set(
          targetInfoId,
          formatAnchorConnectValidateData(targetRuleResult),
        )
      }
      const { isAllPass: isSourcePass } =
        this.sourceRuleResults.get(targetInfoId) ?? {}
      const { isAllPass: isTargetPass } =
        this.targetRuleResults.get(targetInfoId) ?? {}
      // 实时提示出即将链接的锚点
      if (isSourcePass && isTargetPass) {
        targetNode.setElementState(ElementState.ALLOW_CONNECT)
      } else {
        targetNode.setElementState(ElementState.NOT_ALLOW_CONNECT)
      }
    } else if (
      this.preTargetNode &&
      this.preTargetNode.state !== ElementState.DEFAULT
    ) {
      // 为了保证鼠标离开的时候，将上一个节点状态重置为正常状态。
      this.preTargetNode.setElementState(ElementState.DEFAULT)
    }
  }

  isShowLine() {
    const { startX, startY, endX, endY } = this.state
    const v = distance(startX, startY, endX, endY)
    return v > 10
  }

  render() {
    const { startX, startY, endX, endY } = this.state
    const {
      anchorData: { edgeAddable },
      edgeStyle,
    } = this.props
    return (
      // className="lf-anchor" 作为下载时，需要将锚点删除的依据，不要修改类名
      <g className="lf-anchor">
        <g
          onMouseDown={(ev) => {
            if (edgeAddable !== false) {
              this.dragHandler.handleMouseDown(ev)
            }
          }}
        >
          {this.getAnchorShape()}
        </g>
        {this.isShowLine() &&
          (this.customTrajectory ? (
            this.customTrajectory({
              sourcePoint: {
                x: startX,
                y: startY,
              },
              targetPoint: {
                x: endX,
                y: endY,
              },
              ...edgeStyle,
            })
          ) : (
            <Line
              x1={startX}
              y1={startY}
              x2={endX}
              y2={endY}
              {...edgeStyle}
              pointer-events="none"
            />
          ))}
      </g>
    )
  }
}

export default Anchor
