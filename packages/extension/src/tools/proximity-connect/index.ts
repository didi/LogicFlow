import LogicFlow, {
  Model,
  twoPointDistance,
  BaseNodeModel,
  BaseEdgeModel,
} from '@logicflow/core'
import { assign, isEmpty, isEqual, isNil, isFinite, reduce } from 'lodash-es'

import AnchorConfig = Model.AnchorConfig
import Point = LogicFlow.Point

export type ProximityConnectProps = {
  enable: boolean
  distance: number
  reverseDirection: boolean
  virtualEdgeStyle: Record<string, unknown>
}

export class ProximityConnect {
  static pluginName = 'proximityConnect'
  enable: boolean = true
  lf: LogicFlow // lf实例
  closestNode?: BaseNodeModel // 当前距离最近的节点
  currentDistance: number = Infinity // 当前间距
  thresholdDistance: number = 100 // 节点-节点连接距离阈值

  currentNode?: BaseNodeModel // 当前操作节点
  reverseDirection: boolean = false // 节点-节点连线方向，默认是拖拽节点连向最近节点

  currentAnchor?: AnchorConfig // 当前连线锚点
  closestAnchor?: AnchorConfig // 当前距离最近锚点
  virtualEdge?: BaseEdgeModel // 虚拟边
  virtualEdgeStyle: Record<string, unknown> = {
    strokeDasharray: '10,10',
    stroke: '#acacac',
  } // 虚拟边样式

  constructor({
    lf,
    options,
  }: LogicFlow.IExtensionProps & { options: ProximityConnectProps }) {
    this.lf = lf
    assign(this, options)
  }

  render() {
    this.addEventListeners()
  }

  // 增加节点拖拽和锚点拖拽的事件监听
  addEventListeners() {
    // 节点开始拖拽事件
    this.lf.graphModel.eventCenter.on('node:dragstart', ({ data }) => {
      if (!this.enable) return
      const { graphModel } = this.lf
      const { id } = data
      this.currentNode = graphModel.getNodeModelById(id)
    })
    // 节点拖拽事件
    this.lf.graphModel.eventCenter.on('node:drag', () => {
      this.handleNodeDrag()
    })
    // 锚点开始拖拽事件
    this.lf.graphModel.eventCenter.on(
      'anchor:dragstart',
      ({ data, nodeModel }) => {
        if (!this.enable) return
        this.currentNode = nodeModel
        this.currentAnchor = data
      },
    )
    // 锚点拖拽事件
    this.lf.graphModel.eventCenter.on(
      'anchor:drag',
      ({ e: { clientX, clientY } }) => {
        if (!this.enable) return
        this.handleAnchorDrag(clientX, clientY)
      },
    )
    // 节点、锚点拖拽结束事件
    this.lf.graphModel.eventCenter.on('node:drop,anchor:dragend', () => {
      if (!this.enable) return
      this.handleDrop()
    })
  }

  // 节点拖拽动作
  handleNodeDrag() {
    /**
     * 主要做几件事情
     * 判断当前是否有虚拟连线，有的话判断两点距离是否超过阈值，超过的话删除连线
     * 遍历画布上的所有节点，找到距离最近的节点，获取其所有锚点数据
     * 判断每个锚点与当前选中节点的所有锚点之间的距离，找到路路径最短的两个点时，把当前节点、当前锚点当前最短记录记录下来，作为当前最近数据
     * 判断当前最短距离是否小于阈值
     * 如果是 就创建虚拟边
     */
    const { nodes } = this.lf.graphModel

    if (!isNil(this.virtualEdge)) {
      const { startPoint, endPoint, id } = this.virtualEdge
      const curDistance = twoPointDistance(startPoint, endPoint)
      if (curDistance > this.thresholdDistance) {
        this.lf.deleteEdge(id)
        this.virtualEdge = undefined
      }
    }
    if (this.currentNode) {
      this.findClosestAnchorOfNode(this.currentNode, nodes)
    }
    if (this.currentDistance < this.thresholdDistance) {
      this.addVirtualEdge()
    }
  }

  // 节点放下
  handleDrop() {
    this.addActualEdge()
    this.resetData()
  }

  // 锚点拖拽动作
  handleAnchorDrag(clientX: number, clientY: number) {
    // 获取当前点在画布上的位置
    const { graphModel } = this.lf
    const {
      canvasOverlayPosition: { x, y },
    } = graphModel.getPointByClient({
      x: clientX,
      y: clientY,
    })
    if (isNil(x) || isNil(y)) return
    const currentPoint: Point = { x, y }
    const { nodes } = graphModel
    // 判断当前是否有虚拟连线，有的话判断两点距离是否超过阈值，超过的话删除连线
    if (!isNil(this.virtualEdge)) {
      const { endPoint, id } = this.virtualEdge
      const curDistance = twoPointDistance(currentPoint, endPoint)
      if (curDistance > this.thresholdDistance) {
        this.lf.deleteEdge(id)
        this.virtualEdge = undefined
      }
    }
    // 记录最近点的信息
    this.findClosestAnchorOfAnchor(currentPoint, nodes)
    if (this.currentDistance < this.thresholdDistance) {
      this.addVirtualEdge()
    }
  }

  // 节点→节点 找最近的节点和锚点
  findClosestAnchorOfNode(
    draggingNode: BaseNodeModel,
    allNodes: BaseNodeModel[],
  ) {
    if (isNil(draggingNode) || isEmpty(draggingNode)) return
    const { anchors: draggingAnchors = [], id } = draggingNode
    let distance
    let preConnectAnchor
    let closestAnchor
    let closestNode
    allNodes.forEach((node) => {
      if (isEqual(node.id, id)) return
      const { anchors = [] } = node
      // 遍历所有节点，找离当前拖拽节点最近的可连接节点和锚点
      anchors.forEach((anchor) => {
        // 找距离最近的两个锚点
        draggingAnchors.forEach((draggingAnchor) => {
          // 判断拖拽点锚点和当前锚点是否可连线
          const anchorAllowConnect = this.anchorAllowConnect(
            node,
            anchor,
            draggingAnchor,
          )
          if (!anchorAllowConnect) return
          // 获取两个锚点之间的距离
          const curDistance = twoPointDistance(draggingAnchor, anchor)
          if (!distance || curDistance < distance) {
            // 如果是第一条数据，或者当前这对锚点距离更短，就替换数据
            distance = curDistance
            preConnectAnchor = draggingAnchor
            closestAnchor = anchor
            closestNode = node
          }
        })
      })
    })
    this.currentDistance = distance
    this.currentAnchor = preConnectAnchor
    this.closestAnchor = closestAnchor
    this.closestNode = closestNode
  }

  // 锚点→节点 找最近的锚点
  findClosestAnchorOfAnchor(draggingPoint: Point, allNodes: BaseNodeModel[]) {
    if (isNil(draggingPoint)) return
    let distance
    let closestAnchor
    let closestNode
    const { currentNode, currentAnchor } = this
    allNodes.forEach((node) => {
      if (!currentNode) return
      const { anchors = [] } = node
      // 遍历所有节点，找离当前拖拽节点最近的可连接节点和锚点
      anchors.forEach((anchor) => {
        if (isEqual(this.currentAnchor?.id, anchor.id)) return
        // 判断拖拽点锚点和当前锚点是否可连线
        const anchorAllowConnect = this.anchorAllowConnect(
          node,
          anchor,
          currentAnchor,
        )
        if (!anchorAllowConnect) return
        // 获取两个锚点之间的距离
        const curDistance = twoPointDistance(draggingPoint, anchor)
        if (!distance || curDistance < distance) {
          // 如果是第一条数据，或者当前这对锚点距离更短，就替换数据
          distance = curDistance
          closestAnchor = anchor
          closestNode = node
        }
      })
    })
    this.currentDistance = distance
    this.closestAnchor = closestAnchor
    this.closestNode = closestNode
  }

  // 判断锚点是否允许连线
  anchorAllowConnect(
    node: BaseNodeModel,
    anchor: AnchorConfig,
    draggingAnchor: AnchorConfig | undefined,
  ) {
    const { currentNode } = this
    if (!currentNode) return
    // 判断起点是否可连接
    const { isAllPass: sourceValidResult } = this.reverseDirection
      ? node.isAllowConnectedAsSource(currentNode, anchor, draggingAnchor)
      : currentNode.isAllowConnectedAsSource(node, draggingAnchor, anchor)
    // 判断终点是否可连接
    const { isAllPass: targetValidResult } = this.reverseDirection
      ? currentNode.isAllowConnectedAsTarget(node, anchor, draggingAnchor)
      : node.isAllowConnectedAsTarget(currentNode, draggingAnchor, anchor)
    return sourceValidResult && targetValidResult
  }

  // 判断是否应该删除虚拟边
  sameEdgeIsExist(edge: BaseEdgeModel) {
    if (
      isNil(this.closestNode) ||
      isNil(this.currentNode) ||
      isNil(this.closestAnchor) ||
      isNil(this.currentAnchor)
    )
      return false
    if (isNil(edge)) return false
    const {
      closestNode: { id: closestNodeId },
      currentNode: { id: currentNodeId },
      closestAnchor: { id: closestAnchorId },
      currentAnchor: { id: currentAnchorId },
      reverseDirection,
    } = this
    const { sourceNodeId, targetNodeId, sourceAnchorId, targetAnchorId } = edge
    const isExist = reverseDirection
      ? isEqual(closestNodeId, sourceNodeId) &&
        isEqual(currentNodeId, targetNodeId) &&
        isEqual(closestAnchorId, sourceAnchorId) &&
        isEqual(currentAnchorId, targetAnchorId)
      : isEqual(currentNodeId, sourceNodeId) &&
        isEqual(closestNodeId, targetNodeId) &&
        isEqual(currentAnchorId, sourceAnchorId) &&
        isEqual(closestAnchorId, targetAnchorId)
    return isExist
  }

  // 增加虚拟边
  addVirtualEdge() {
    const { edges } = this.lf.graphModel
    // 判断当前是否已存在一条同样配置的真实边
    const actualEdgeIsExist = reduce(
      edges,
      (result, edge) => {
        if (edge.virtual) return result
        return result || this.sameEdgeIsExist(edge)
      },
      false,
    )
    // 如果有真实边就不重复创建边了
    if (actualEdgeIsExist) return

    // 判断当前是否有虚拟边
    // 如果当前已有虚拟边，判断当前的节点和锚点信息与虚拟边的信息是否一致
    if (!isNil(this.virtualEdge)) {
      const {
        virtualEdge: { id: edgeId },
      } = this
      // 信息一致不做处理
      if (this.sameEdgeIsExist(this.virtualEdge)) return
      // 不一致就删除老边
      this.lf.deleteEdge(edgeId)
    }

    // 开始创建虚拟边
    const {
      reverseDirection,
      currentNode,
      closestNode,
      currentAnchor,
      closestAnchor,
    } = this
    if (isEmpty(currentNode) || isEmpty(closestNode)) return
    const properties = {
      style: this.virtualEdgeStyle,
    }
    this.virtualEdge = this.lf.addEdge(
      reverseDirection
        ? {
            sourceNodeId: closestNode?.id,
            targetNodeId: currentNode?.id,
            sourceAnchorId: closestAnchor?.id,
            targetAnchorId: currentAnchor?.id,
            properties,
          }
        : {
            sourceNodeId: currentNode?.id,
            targetNodeId: closestNode?.id,
            sourceAnchorId: currentAnchor?.id,
            targetAnchorId: closestAnchor?.id,
            properties,
          },
    )
    this.virtualEdge.virtual = true
  }

  // 增加实体边
  addActualEdge() {
    if (isNil(this.virtualEdge)) return
    const {
      type,
      sourceNodeId,
      targetNodeId,
      sourceAnchorId,
      targetAnchorId,
      startPoint,
      endPoint,
      pointsList,
    } = this.virtualEdge
    this.lf.addEdge({
      type,
      sourceNodeId,
      targetNodeId,
      sourceAnchorId,
      targetAnchorId,
      startPoint,
      endPoint,
      pointsList,
    })
    this.lf.deleteEdge(this.virtualEdge.id)
  }

  // 设置虚拟边样式
  public setVirtualEdgeStyle(value: Record<string, unknown>) {
    this.virtualEdgeStyle = {
      ...this.virtualEdgeStyle,
      ...value,
    }
  }

  // 设置连线阈值
  public setThresholdDistance(distance: number) {
    console.log('distance', distance)
    if (!isFinite(distance)) return
    this.thresholdDistance = distance
  }

  // 设置连线方向
  public setReverseDirection(value: boolean) {
    this.reverseDirection = value
  }

  // 设置插件开关状态
  public setEnable(enable: boolean) {
    this.enable = enable
    if (!enable) {
      this.resetData()
    }
  }

  // 重置数据
  resetData() {
    this.closestNode = undefined
    this.currentDistance = Infinity
    this.currentNode = undefined
    this.currentAnchor = undefined
    this.closestAnchor = undefined
    this.virtualEdge = undefined
  }
}
