import LogicFlow, {
  CallbackArgs,
  Model,
  BaseNodeModel,
  BaseEdgeModel,
  EventType,
  transformNodeData,
  transformEdgeData,
} from '@logicflow/core'
import { assign, filter, forEach, cloneDeep, has, map } from 'lodash-es'
import { PoolModel } from './PoolModel'
import { PoolView } from './PoolView'
import { LaneModel } from './LaneModel'
import { LaneView } from './LaneView'
import { isAllowMoveTo, isBoundsInLane } from './utils'

import GraphConfigData = LogicFlow.GraphConfigData
import GraphElements = LogicFlow.GraphElements
import EdgeConfig = LogicFlow.EdgeConfig
import EdgeData = LogicFlow.EdgeData
import NodeData = LogicFlow.NodeData
import BoxBoundsPoint = Model.BoxBoundsPoint
type ElementsInfoInGroup = {
  childNodes: BaseNodeModel[] // 分组节点的所有子节点 model
  edgesData: EdgeData[] // 属于分组内的线的 EdgeData (即开始节点和结束节点都在 Group 内)
}

export const PoolNode = {
  type: 'pool',
  view: PoolView,
  model: PoolModel,
}

export const LaneNode = {
  type: 'lane',
  view: LaneView,
  model: LaneModel,
}

export class PoolElements {
  static pluginName = 'PoolElements'
  private lf: LogicFlow
  // 激活态的 group 节点
  activeGroup?: LaneModel
  // 存储节点与 group 的映射关系
  nodeLaneMap: Map<string, string> = new Map()

  constructor({ lf, options }: LogicFlow.IExtensionProps) {
    lf.register(PoolNode)
    lf.register(LaneNode)
    this.lf = lf
    assign(this, options)
    // 初始化插件，从监听事件开始及设置规则开始
    this.init()
  }

  /**
   * 获取节点所属的泳道
   * @param nodeId
   */
  getLaneByNodeId(nodeId: string) {
    const laneId = this.nodeLaneMap.get(nodeId)
    if (laneId) {
      return this.lf.getNodeModelById(laneId)
    }
  }

  /**
   * 获取指定范围内的泳道
   * 当泳道重合时，优先返回最上层的泳道
   * @param bounds
   * @param nodeData
   */
  getLaneByBounds(bounds: BoxBoundsPoint, nodeData: NodeData): any | undefined {
    const { nodes } = this.lf.graphModel
    const lanes = filter(nodes, (node) => {
      return (
        !!node.isGroup &&
        isBoundsInLane(bounds, node) &&
        node.id !== nodeData.id
      )
    })

    const count = lanes.length
    if (count <= 1) {
      return lanes[0] as LaneModel
    } else {
      let topZIndexLane = lanes[count - 1]
      for (let i = count - 2; i >= 0; i--) {
        if (lanes[i].zIndex > topZIndexLane.zIndex) {
          topZIndexLane = lanes[i]
        }
      }
      return topZIndexLane as LaneModel
    }
  }

  /**
   * 提高元素的层级，如果是 group，同时提高其子元素的层级
   * @param model
   */
  onSelectionDrop = () => {
    const { nodes: selectedNodes } = this.lf.graphModel.getSelectElements()
    selectedNodes.forEach((node) => {
      this.addNodeToGroup(node)
    })
  }
  onNodeAddOrDrop = ({ data: node }: CallbackArgs<'node:add'>) => {
    this.addNodeToGroup(node)
  }

  addNodeToGroup = (node: LogicFlow.NodeData) => {
    // 1. 如果该节点之前已经有泳道了，则将其从之前的泳道移除
    const preLaneId = this.nodeLaneMap.get(node.id)
    if (preLaneId) {
      const lane = this.lf.getNodeModelById(preLaneId) as LaneModel

      lane.removeChild(node.id)
      this.nodeLaneMap.delete(node.id)
      lane.setAllowAppendChild(false)
    }

    // 2. 然后再判断这个节点是否在某个泳道范围内，如果是，则将其添加到对应的泳道中
    const nodeModel = this.lf.getNodeModelById(node.id)
    const bounds = nodeModel?.getBounds()

    if (nodeModel && bounds) {
      // TODO: 确认下面的注释内容
      // https://github.com/didi/LogicFlow/issues/1261
      // 当使用 SelectionSelect 框选后触发 lf.addNode(Group)
      // 会触发 appendNodeToGroup() 的执行
      // 由于 this.getGroup() 会判断 node.id !== nodeData.id
      // 因此当 addNode 是 Group 类型时，this.getGroup() 会一直返回空
      // 导致了下面这段代码无法执行，也就是无法将当前添加的 Group 添加到 this.nodeLaneMap 中
      // 这导致了折叠分组时触发的 foldEdge() 无法正确通过 getNodeGroup() 拿到正确的 groupId
      // 从而导致折叠分组时一直都会创建一个虚拟边
      // 而初始化分组时由于正确设置了nodeLaneMap的数据，因此不会产生虚拟边的错误情况
      if (nodeModel.isGroup) {
        const lane = nodeModel as LaneModel
        forEach(Array.from(lane.children), (childId) => {
          this.nodeLaneMap.set(childId, node.id)
        })
      }

      const lane = this.getLaneByBounds(bounds, node)
      if (lane) {
        const isAllowAppendIn = lane.isAllowAppendIn(node)
        if (isAllowAppendIn) {
          lane.addChild(node.id)
          // 建立节点与 lane 的映射关系放在了 lane.addChild 触发的事件中，与直接调用 addChild 的行为保持一致
          lane.setAllowAppendChild(false)
          const nodeModel = this.lf.getNodeModelById(node.id)
          nodeModel?.setProperties({
            ...nodeModel.properties,
            parent: lane.id,
            // relativeDistanceX: nodeModel.x - lane.x,
            // relativeDistanceY: nodeModel.y - lane.y,
          })
        } else {
          // 抛出不允许插入的事件
          this.lf.emit('lane:not-allowed', {
            lane: lane.getData(),
            node,
          })
        }
      }
    }
  }

  onGroupAddNode = ({
    data: groupData,
    childId,
  }: CallbackArgs<'group:add-node'>) => {
    this.nodeLaneMap.set(childId, groupData.id)
  }

  removeNodeFromGroup = ({
    data: node,
    model,
  }: CallbackArgs<'node:delete'>) => {
    if (model.isGroup && node.children) {
      forEach(Array.from((node as LaneModel).children), (childId) => {
        this.nodeLaneMap.delete(childId)
        this.lf.deleteNode(childId)
      })
    }

    const laneId = this.nodeLaneMap.get(node.id)
    if (laneId) {
      const lane = this.lf.getNodeModelById(laneId)
      lane && (lane as LaneModel).removeChild(node.id)
      this.nodeLaneMap.delete(node.id)
      const nodeModel = this.lf.getNodeModelById(node.id)
      // 移除时删除properties中的parent和relativeDistanceX、relativeDistanceY
      const newProperties = {
        ...nodeModel?.properties,
        parent: undefined,
        relativeDistanceX: undefined,
        relativeDistanceY: undefined,
      }
      nodeModel?.setProperties(newProperties)
    }
  }

  onSelectionDrag = () => {
    const { nodes: selectedNodes } = this.lf.graphModel.getSelectElements()
    selectedNodes.forEach((node) => {
      this.setActiveGroup(node)
    })
  }

  onNodeDrag = ({ data: node }: CallbackArgs<'node:drag'>) => {
    this.setActiveGroup(node)
  }

  setActiveGroup = (node: LogicFlow.NodeData) => {
    const nodeModel = this.lf.getNodeModelById(node.id)
    const bounds = nodeModel?.getBounds()

    if (nodeModel && bounds) {
      const targetGroup = this.getLaneByBounds(bounds, node)
      if (this.activeGroup) {
        this.activeGroup.setAllowAppendChild(false)
      }

      if (!targetGroup || (nodeModel.isGroup && targetGroup.id === node.id)) {
        return
      }

      const isAllowAppendIn = targetGroup.isAllowAppendIn(node)
      if (!isAllowAppendIn) return

      this.activeGroup = targetGroup
      this.activeGroup?.setAllowAppendChild(true)
    }
  }
  /**
   * @param node
   * @param isMultiple
   * @param isSelected
   */
  onNodeSelect = ({
    data: node,
    isMultiple,
    isSelected,
  }: Omit<CallbackArgs<'node:click'>, 'e' | 'position'>) => {
    const nodeModel = this.lf.getNodeModelById(node.id)
    // FIX #1004
    // 如果节点被多选，
    // 这个节点是分组，则将分组的所有子节点取消选中
    // 这个节点是分组的子节点，且其所属分组节点已选，则取消选中
    if (isMultiple && isSelected) {
      if (nodeModel?.isGroup) {
        const { children } = nodeModel as LaneModel
        forEach(Array.from(children), (childId) => {
          const childModel = this.lf.getNodeModelById(childId)
          childModel?.setSelected(false)
        })
      } else {
        const laneId = this.nodeLaneMap.get(node.id)
        if (laneId) {
          const laneModel = this.lf.getNodeModelById(laneId)
          laneModel?.isSelected && nodeModel?.setSelected(false)
        }
      }
    }
  }

  onNodeMove = ({
    deltaX,
    deltaY,
    data,
  }: Omit<CallbackArgs<'node:mousemove'>, 'e' | 'position'>) => {
    const { id, x, y, properties } = data
    if (!properties) {
      return
    }
    const { width, height } = properties
    const groupId = this.nodeLaneMap.get(id)
    if (!groupId) {
      return
    }
    const groupModel = this.lf.getNodeModelById(groupId) as LaneModel

    if (!groupModel || !groupModel.isRestrict || !groupModel.autoResize) {
      return
    }
    // 当父节点isRestrict=true & autoResize=true
    // 子节点在父节点中移动时，父节点会自动调整大小

    // step1: 计算出当前child的bounds
    const newX = x + deltaX / 2
    const newY = y + deltaY / 2
    const minX = newX - width! / 2
    const minY = newY - height! / 2
    const maxX = newX + width! / 2
    const maxY = newY + height! / 2
    // step2：比较当前child.bounds与parent.bounds的差异，比如child.minX<parent.minX，那么parent.minX=child.minX
    let hasChange = false
    const groupBounds = groupModel.getBounds()
    const newGroupBounds = Object.assign({}, groupBounds)
    if (minX < newGroupBounds.minX) {
      newGroupBounds.minX = minX
      hasChange = true
    }
    if (minY < newGroupBounds.minY) {
      newGroupBounds.minY = minY
      hasChange = true
    }
    if (maxX > newGroupBounds.maxX) {
      newGroupBounds.maxX = maxX
      hasChange = true
    }
    if (maxY > newGroupBounds.maxY) {
      newGroupBounds.maxY = maxY
      hasChange = true
    }
    if (!hasChange) {
      return
    }
    // step3: 根据当前parent.bounds去计算出最新的x、y、width、height
    const newGroupX =
      newGroupBounds.minX + (newGroupBounds.maxX - newGroupBounds.minX) / 2
    const newGroupY =
      newGroupBounds.minY + (newGroupBounds.maxY - newGroupBounds.minY) / 2
    const newGroupWidth = newGroupBounds.maxX - newGroupBounds.minX
    const newGroupHeight = newGroupBounds.maxY - newGroupBounds.minY
    groupModel.moveTo(newGroupX, newGroupY)
    groupModel.width = newGroupWidth
    groupModel.height = newGroupHeight
  }

  onGraphRendered = ({ data }: CallbackArgs<'graph:rendered'>) => {
    forEach(data.nodes, (node) => {
      if (node.children) {
        forEach(node.children, (childId) => {
          this.nodeLaneMap.set(childId, node.id)
        })
      }
    })
  }

  removeChildrenInGroupNodeData<
    T extends LogicFlow.NodeData | LogicFlow.NodeConfig,
  >(nodeData: T) {
    const newNodeData = cloneDeep(nodeData)
    delete newNodeData.children
    if (newNodeData.properties?.children) {
      delete newNodeData.properties.children
    }
    return newNodeData
  }

  /**
   * 创建一个 Group 类型节点内部所有子节点的副本
   * 并且在遍历所有 nodes 的过程中，顺便拿到所有 edges (只在 Group 范围的 edges)
   */
  initGroupChildNodes(
    nodeIdMap: Record<string, string>,
    children: Set<string>,
    curGroup: LaneModel,
    distance: number,
  ): ElementsInfoInGroup {
    // Group 中所有子节点
    const allChildNodes: BaseNodeModel[] = []
    // 属于 Group 内部边的 EdgeData
    const edgesDataArr: EdgeData[] = []
    // 所有有关联的连线
    const allRelatedEdges: BaseEdgeModel[] = []

    forEach(Array.from(children), (childId: string) => {
      const childNode = this.lf.getNodeModelById(childId)
      if (childNode) {
        const childNodeChildren = childNode.children
        const childNodeData = childNode.getData()
        const eventType = EventType.NODE_GROUP_COPY || 'node:group-copy-add'

        const newNodeConfig = transformNodeData(
          this.removeChildrenInGroupNodeData(childNodeData),
          distance,
        )
        const tempChildNode = this.lf.addNode(newNodeConfig, eventType)
        curGroup.addChild(tempChildNode.id)

        nodeIdMap[childId] = tempChildNode.id // id 同 childId，做映射存储
        allChildNodes.push(tempChildNode)

        // 1. 存储 children 内部节点相关的输入边（incoming）
        allRelatedEdges.push(
          ...[...tempChildNode.incoming.edges, ...tempChildNode.outgoing.edges],
        )

        if (childNodeChildren instanceof Set) {
          const { childNodes, edgesData } = this.initGroupChildNodes(
            nodeIdMap,
            childNodeChildren,
            tempChildNode as LaneModel,
            distance,
          )

          allChildNodes.push(...childNodes)
          edgesDataArr.push(...edgesData)
        }
      }
    })

    // 1. 判断每一条边的开始节点、目标节点是否在 Group 中
    const edgesInnerGroup = filter(allRelatedEdges, (edge) => {
      return (
        has(nodeIdMap, edge.sourceNodeId) && has(nodeIdMap, edge.targetNodeId)
      )
    })
    // 2. 为「每一条 Group 的内部边」构建出 EdgeData 数据，得到 EdgeConfig，生成新的线
    const edgesDataInnerGroup = map(edgesInnerGroup, (edge) => {
      return edge.getData()
    })

    return {
      childNodes: allChildNodes,
      edgesData: edgesDataArr.concat(edgesDataInnerGroup),
    }
  }

  /**
   * 根据参数 edge 选择是新建边还是基于已有边，复制一条边出来
   * @param edge
   * @param nodeIdMap
   * @param distance
   */
  createEdge(
    edge: EdgeConfig | EdgeData,
    nodeIdMap: Record<string, string>,
    distance: number,
  ) {
    const { sourceNodeId, targetNodeId } = edge
    const sourceId = nodeIdMap[sourceNodeId] ?? sourceNodeId
    const targetId = nodeIdMap[targetNodeId] ?? targetNodeId

    // 如果是有 id 且 text 是对象的边，需要重新计算位置，否则直接用 edgeConfig 生成边
    let newEdgeConfig = cloneDeep(edge)
    if (edge.id && typeof edge.text === 'object' && edge.text !== null) {
      newEdgeConfig = transformEdgeData(edge as EdgeData, distance)
    }

    return this.lf.graphModel.addEdge({
      ...newEdgeConfig,
      sourceNodeId: sourceId,
      targetNodeId: targetId,
    })
  }

  /**
   * 检测group:resize后的bounds是否会小于children的bounds
   * 限制group进行resize时不能小于内部的占地面积
   * @param groupModel
   * @param deltaX
   * @param deltaY
   * @param newWidth
   * @param newHeight
   */
  checkGroupBoundsWithChildren(
    groupModel: LaneModel,
    deltaX: number,
    deltaY: number,
    newWidth: number,
    newHeight: number,
  ) {
    if (groupModel.children) {
      const { children, x, y } = groupModel
      // 根据deltaX和deltaY计算出当前model的bounds
      const newX = x + deltaX / 2
      const newY = y + deltaY / 2
      const groupMinX = newX - newWidth / 2
      const groupMinY = newY - newHeight / 2
      const groupMaxX = newX + newWidth / 2
      const groupMaxY = newY + newHeight / 2

      const childrenArray = Array.from(children)
      for (let i = 0; i < childrenArray.length; i++) {
        const childId = childrenArray[i]
        const child = this.lf.getNodeModelById(childId)
        if (!child) {
          continue
        }
        const childBounds = child.getBounds()
        const { minX, minY, maxX, maxY } = childBounds
        // parent:resize后的bounds不能小于child:bounds，否则阻止其resize
        const canResize =
          groupMinX <= minX &&
          groupMinY <= minY &&
          groupMaxX >= maxX &&
          groupMaxY >= maxY
        if (!canResize) {
          return false
        }
      }
    }

    return true
  }

  init() {
    const { lf } = this
    const { graphModel } = lf
    // 添加分组节点移动规则
    // 1. 移动分组节点时，同时移动分组内所有节点
    // 2. 移动子节点时，判断是否有限制规则（isRestrict）
    graphModel.addNodeMoveRules((model, deltaX, deltaY) => {
      // 判断如果是 group，移动时需要同时移动组内的所有节点
      if (model.isGroup) {
        return true
      }

      const groupId = this.nodeLaneMap.get(model.id)!
      const groupModel = this.lf.getNodeModelById(groupId) as LaneModel

      if (groupModel && groupModel.isRestrict) {
        if (groupModel.autoResize) {
          // 子节点在父节点中移动时，父节点会自动调整大小
          // 在node:mousemove中进行父节点的调整
          return true
        } else {
          // 如果移动的节点存在于某个分组中，且这个分组禁止子节点移出去
          const groupBounds = groupModel.getBounds()
          return isAllowMoveTo(groupBounds, model, deltaX, deltaY)
        }
      }

      return true
    })
    graphModel.addNodeResizeRules((model, deltaX, deltaY, width, height) => {
      if (model.isGroup && model.isRestrict) {
        return this.checkGroupBoundsWithChildren(
          model as LaneModel,
          deltaX,
          deltaY,
          width,
          height,
        )
      }
      return true
    })

    graphModel.dynamicGroup = this
    lf.on('node:add,node:drop,node:dnd-add', this.onNodeAddOrDrop)
    lf.on('selection:drop', this.onSelectionDrop)
    lf.on('node:delete', this.removeNodeFromGroup)
    lf.on('node:drag,node:dnd-drag', this.onNodeDrag)
    lf.on('selection:drag', this.onSelectionDrag)
    lf.on('node:click', this.onNodeSelect)
    lf.on('node:mousemove', this.onNodeMove)
    lf.on('graph:rendered', this.onGraphRendered)

    lf.on('group:add-node', this.onGroupAddNode)

    lf.addElements = (
      { nodes: selectedNodes, edges: selectedEdges }: GraphConfigData,
      distance = 40,
    ): GraphElements => {
      // oldNodeId -> newNodeId 映射 Map
      const nodeIdMap: Record<string, string> = {}
      // 本次添加的所有节点和边
      const elements: GraphElements = {
        nodes: [],
        edges: [],
      }
      // 所有属于分组内的边 -> sourceNodeId 和 targetNodeId 都在 Group 内
      const edgesInnerGroup: EdgeData[] = []

      forEach(selectedNodes, (node) => {
        const originId = node.id
        const children = node.properties?.children ?? node.children

        const model = lf.addNode(this.removeChildrenInGroupNodeData(node))

        if (originId) nodeIdMap[originId] = model.id
        elements.nodes.push(model) // 此时为 group 的 nodeModel

        if (model.isGroup) {
          const { edgesData } = this.initGroupChildNodes(
            nodeIdMap,
            children,
            model as LaneModel,
            distance,
          )
          edgesInnerGroup.push(...edgesData)
        }
      })

      forEach(edgesInnerGroup, (edge) => {
        this.createEdge(edge, nodeIdMap, distance)
      })
      forEach(selectedEdges, (edge) => {
        elements.edges.push(this.createEdge(edge, nodeIdMap, distance))
      })

      // 返回 elements 进行选中效果，即触发 element.selectElementById()
      // shortcut.ts 也会对最外层的 nodes 和 edges 进行偏移，即 translationNodeData()
      return elements
    }

    this.render()
  }

  render() {}

  destroy() {
    // 销毁监听的事件，并移除渲染的 dom 内容
    this.lf.off('node:add,node:drop,node:dnd-add', this.onNodeAddOrDrop)
    this.lf.off('selection:drop', this.onSelectionDrop)
    this.lf.off('node:delete', this.removeNodeFromGroup)
    this.lf.off('node:drag,node:dnd-drag', this.onNodeDrag)
    this.lf.off('selection:drag', this.onSelectionDrag)
    this.lf.off('node:click', this.onNodeSelect)
    this.lf.off('node:mousemove', this.onNodeMove)
    this.lf.off('graph:rendered', this.onGraphRendered)
    this.lf.off('group:add-node', this.onGroupAddNode)
  }
}

export default PoolElements
