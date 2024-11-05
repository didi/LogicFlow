/**
 * @deprecated
 * 待废弃，2.0 版本将 提供 dynamic-group 支持分组功能，当前 Group 插件设计和实现有比较多的问题，后续不再维护，请及时切换
 */
import { forEach, isEmpty, isObject } from 'lodash-es'
import LogicFlow, {
  BaseEdgeModel,
  BaseNodeModel,
  EventType,
  Model,
} from '@logicflow/core'
import GroupNode, { GroupNodeModel } from './GroupNode'

import GraphConfigData = LogicFlow.GraphConfigData
import EdgeConfig = LogicFlow.EdgeConfig
import NodeData = LogicFlow.NodeData
import Point = LogicFlow.Point
import BoxBoundsPoint = Model.BoxBoundsPoint
import NodeConfig = LogicFlow.NodeConfig

const DEFAULT_TOP_Z_INDEX = -1000
const DEFAULT_BOTTOM_Z_INDEX = -10000

export class Group {
  static pluginName = 'group'

  private lf: LogicFlow
  topGroupZIndex = DEFAULT_BOTTOM_Z_INDEX
  activeGroup: any
  nodeGroupMap: Map<string, string> = new Map()

  constructor({ lf }: LogicFlow.IExtensionProps) {
    lf.register(GroupNode)
    this.lf = lf

    lf.graphModel.addNodeMoveRules((model, deltaX, deltaY) => {
      if (model.isGroup) {
        // 如果移动的是分组，那么分组的子节点也跟着移动。
        const nodeIds = this.getNodeAllChild(model)
        lf.graphModel.moveNodes(nodeIds, deltaX, deltaY, true)
        return true
      }
      const groupModel = lf.getNodeModelById(
        this.nodeGroupMap.get(model.id)!,
      ) as GroupNodeModel
      if (groupModel && groupModel.isRestrict) {
        // 如果移动的节点存在分组中，且这个分组禁止子节点移出去。
        const { minX, minY, maxX, maxY } = model.getBounds()
        return groupModel.isAllowMoveTo({
          minX: minX + deltaX,
          minY: minY + deltaY,
          maxX: maxX + deltaX,
          maxY: maxY + deltaY,
        })
      }

      return true
    })

    lf.graphModel.group = this
    lf.on('node:add,node:drop,node:dnd-add', this.appendNodeToGroup)
    lf.on('node:delete', this.deleteGroupChild)
    lf.on('node:dnd-drag,node:drag', this.setActiveGroup)
    lf.on('node:click', this.nodeSelected)
    lf.on('graph:rendered', this.graphRendered)

    // https://github.com/didi/LogicFlow/issues/1346
    // 重写 addElements() 方法，在 addElements() 原有基础上增加对 group 内部所有 nodes 和 edges 的复制功能
    lf.addElements = (
      { nodes: selectedNodes, edges: selectedEdges }: GraphConfigData,
      distance: number,
    ): {
      nodes: BaseNodeModel[]
      edges: BaseEdgeModel[]
    } => {
      // ============== 变量初始化 ==============
      const nodeIdMap: Record<string, string> = {}
      const elements: any = {
        nodes: [],
        edges: [],
      }
      const groupInnerEdges: EdgeConfig[] = []
      // ============== 变量初始化 ==============

      forEach(selectedNodes, (node) => {
        const preId = node.id
        const { children, ...rest } = node
        const nodeModel = lf.addNode(rest)
        if (!nodeModel) {
          return {
            nodes: [],
            edges: [],
          }
        }
        if (preId) nodeIdMap[preId] = nodeModel.id
        elements.nodes.push(nodeModel) // group的nodeModel

        // 递归创建group的nodeModel的children
        const { edgesArray } = this.createAllChildNodes(
          nodeIdMap,
          children as Set<string>,
          nodeModel,
          distance,
        )
        groupInnerEdges.push(...edgesArray)
      })

      groupInnerEdges.forEach((edge) => {
        this.createEdgeModel(edge, nodeIdMap, distance)
      })
      // 构建的时候直接偏移，这里不需要再进行再度偏移
      // groupInnerChildren.nodes.forEach(node => this.translateNodeData(node, distance));
      // groupInnerChildren.edges.forEach(edge => this. translateEdgeData(edge, distance));

      // 最外层的edges继续执行创建edgeModel的流程
      // 由于最外层会调用 translateEdgeData()，因此这里不用传入distance进行偏移
      forEach(selectedEdges, (edge) => {
        const edgeModel = this.createEdgeModel(edge, nodeIdMap, 0)
        elements.edges.push(edgeModel)
      })

      // 返回elements进行选中效果，即触发element.selectElementById()
      // shortcut.ts也会对最外层的nodes和edges进行偏移，即translateNodeData()
      return elements
    }
  }

  /**
   * 创建一个Group类型节点内部的所有子节点的副本
   * 并且在遍历所有nodes的过程中顺便拿到所有edges（只在Group范围的edges）
   */
  createAllChildNodes(
    nodeIdMap: Record<string, string>,
    children: Set<string>,
    current: BaseNodeModel,
    distance: number,
  ) {
    const { lf } = this
    const edgesDataArray: EdgeConfig[] = []
    const edgesNodeModelArray: BaseEdgeModel[] = []
    const nodesArray: BaseNodeModel[] = []
    children?.forEach((childId: string) => {
      const childNodeModel = lf.getNodeModelById(childId)
      if (childNodeModel) {
        const {
          x,
          y,
          properties,
          type,
          rotate,
          children,
          // incoming,
          // outgoing,
        } = childNodeModel
        const nodeConfig: NodeConfig = {
          x: x + distance,
          y: y + distance,
          properties,
          type,
          rotate,
          // 如果不传递type，会自动触发NODE_ADD
          // 有概率触发appendToGroup
        }

        const eventType =
          EventType.NODE_GROUP_COPY || ('node:group-copy-add' as EventType)
        const newChildModel = lf.addNode(nodeConfig, eventType)

        ;(current as GroupNodeModel).addChild(newChildModel.id)
        nodeIdMap[childId] = newChildModel.id
        nodesArray.push(newChildModel)
        // 存储children内部节点相关的输入边
        childNodeModel.incoming.edges.forEach((edge) => {
          edgesNodeModelArray.push(edge)
        })
        // 存储children内部节点相关的输出边
        childNodeModel.outgoing.edges.forEach((edge) => {
          edgesNodeModelArray.push(edge)
        })

        if (children instanceof Set) {
          const { nodesArray: childNodes, edgesArray: childEdges } =
            this.createAllChildNodes(
              nodeIdMap,
              children,
              newChildModel,
              distance,
            )
          nodesArray.push(...childNodes)
          edgesDataArray.push(...childEdges)
        }
      }
    })
    // 1. 判断每一条边的开始节点和目标节点是否在Group中
    const filterEdgesArray: BaseEdgeModel[] = edgesNodeModelArray.filter(
      (edge: BaseEdgeModel) =>
        nodeIdMap[edge.sourceNodeId] && nodeIdMap[edge.targetNodeId],
    )
    // 2. 为每一条group的内部边构建出EdgeData数据
    // 从GraphModel.ts的getSelectElements()可以知道EdgeConfig就是EdgeData
    const filterEdgesDataArray: EdgeConfig[] = filterEdgesArray.map((item) =>
      item.getData(),
    )
    return {
      nodesArray,
      edgesArray: edgesDataArray.concat(filterEdgesDataArray), // ??? what's this
    }
  }

  createEdgeModel(
    edge: EdgeConfig,
    nodeIdMap: Record<string, string>,
    distance: number,
  ) {
    const { lf } = this
    let sourceId = edge.sourceNodeId
    let targetId = edge.targetNodeId
    if (nodeIdMap[sourceId]) sourceId = nodeIdMap[sourceId]
    if (nodeIdMap[targetId]) targetId = nodeIdMap[targetId]
    const { type, startPoint, endPoint, pointsList, text } = edge
    // ====== 仿造shortcut.ts的 translateEdgeData()逻辑 ======
    const newStartPoint = {
      x: (startPoint?.x || 0) + distance,
      y: (startPoint?.y || 0) + distance,
    }
    const newEndPoint = {
      x: (endPoint?.x || 0) + distance,
      y: (endPoint?.y || 0) + distance,
    }
    let newPointsList: Point[] = []
    if (pointsList && pointsList.length > 0) {
      newPointsList = pointsList.map((point) => {
        point.x += distance
        point.y += distance
        return point
      })
    }
    const edgeConfig: EdgeConfig = {
      type,
      startPoint: newStartPoint,
      endPoint: newEndPoint,
      sourceNodeId: sourceId,
      targetNodeId: targetId,
      pointsList: newPointsList,
    }

    if (isObject(text) && !isEmpty(text)) {
      edgeConfig.text = {
        ...text,
        x: text?.x + distance,
        y: text?.y + distance,
      }
    }
    // ====== 仿造shortcut.ts的 translateEdgeData()逻辑 ======

    // 简化复制时的参数传入，防止创建出两个edge属于同个group这种情况
    return lf.graphModel.addEdge(edgeConfig)
  }

  /**
   * 获取一个节点内部所有的子节点，包裹分组的子节点
   */
  getNodeAllChild(model: GroupNodeModel | BaseNodeModel) {
    let nodeIds: string[] = []
    if (model.children) {
      ;(model as GroupNodeModel).children.forEach((nodeId) => {
        nodeIds.push(nodeId)
        const nodeModel = this.lf.getNodeModelById(nodeId)
        if (nodeModel?.isGroup) {
          nodeIds = nodeIds.concat(this.getNodeAllChild(nodeModel))
        }
      })
    }
    return nodeIds
  }

  graphRendered = ({ data }: { data: LogicFlow.GraphData }) => {
    // 如果节点
    if (data && data.nodes) {
      data.nodes.forEach((node) => {
        if (node.children) {
          ;(node.children as string[]).forEach((nodeId) => {
            this.nodeGroupMap.set(nodeId, node.id)
          })
        }
      })

      // 初始化nodes时进行this.topGroupZIndex的校准更新
      this.checkAndCorrectTopGroupZIndex(data.nodes)
    }
  }
  appendNodeToGroup = ({ data }: { data: NodeData }) => {
    // 如果这个节点之前已经在group中了，则将其从之前的group中移除
    const preGroupId = this.nodeGroupMap.get(data.id)
    if (preGroupId) {
      const preGroup = this.lf.getNodeModelById(preGroupId) as GroupNodeModel
      preGroup.removeChild(data.id)
      this.nodeGroupMap.delete(data.id)
      preGroup.setAllowAppendChild(false)
    }

    // 然后再判断这个节点是否在某个group中，如果在，则将其添加到对应的group中
    const nodeModel = this.lf.getNodeModelById(data.id)
    const bounds = nodeModel?.getBounds()
    if (bounds && nodeModel) {
      const group = this.getGroup(bounds, data) as GroupNodeModel

      // https://github.com/didi/LogicFlow/issues/1261
      // 当使用SelectionSelect框选后触发lf.addNode(Group)
      // 会触发appendNodeToGroup()的执行
      // 由于this.getGroup()会判断node.id !== nodeData.id
      // 因此当addNode是Group类型时，this.getGroup()会一直返回空
      // 导致了下面这段代码无法执行，也就是无法将当前添加的Group添加到this.nodeGroupMap中
      // 这导致了折叠分组时触发的foldEdge()无法正确通过getNodeGroup()拿到正确的groupId
      // 从而导致折叠分组时一直都会创建一个虚拟边
      // 而初始化分组时由于正确设置了nodeGroupMap的数据，因此不会产生虚拟边的错误情况
      if (nodeModel.isGroup) {
        // 如果这个节点是分组，那么将其子节点也记录下来
        ;(data.children as Set<string>).forEach((nodeId) => {
          this.nodeGroupMap.set(nodeId, data.id)
        })
        // 新增node时进行this.topGroupZIndex的校准更新
        this.checkAndCorrectTopGroupZIndex([data])
        this.nodeSelected({
          data,
          isSelected: false,
          isMultiple: false,
        })
      }
      if (!group) return
      const isAllowAppendIn = group.isAllowAppendIn(data)
      if (!isAllowAppendIn) {
        this.lf.emit('group:not-allowed', {
          group: group.getData(),
          node: data,
        })
        return
      }
      group.addChild(data.id)
      this.nodeGroupMap.set(data.id, group.id)
      group.setAllowAppendChild(false)
    }
  }
  deleteGroupChild = ({ data }: { data: NodeData }) => {
    // 如果删除的是分组节点，则同时删除分组的子节点
    if (data.children) {
      ;(data.children as Set<string>).forEach((nodeId) => {
        this.nodeGroupMap.delete(nodeId)
        this.lf.deleteNode(nodeId)
      })
    }
    const groupId = this.nodeGroupMap.get(data.id)
    if (groupId) {
      const group = this.lf.getNodeModelById(groupId) as GroupNodeModel
      group.removeChild(data.id)
      this.nodeGroupMap.delete(data.id)
    }
  }
  setActiveGroup = ({ data }: { data: NodeData }) => {
    const nodeModel = this.lf.getNodeModelById(data.id)
    const bounds = nodeModel?.getBounds()
    if (nodeModel && bounds) {
      const newGroup = this.getGroup(bounds, data)
      if (this.activeGroup) {
        this.activeGroup.setAllowAppendChild(false)
      }
      if (!newGroup || (nodeModel.isGroup && newGroup.id === data.id)) return
      const isAllowAppendIn = (newGroup as GroupNodeModel).isAllowAppendIn(data)
      if (!isAllowAppendIn) {
        return
      }
      this.activeGroup = newGroup
      this.activeGroup.setAllowAppendChild(true)
    }
  }
  findNodeAndChildMaxZIndex = (nodeModel: BaseNodeModel) => {
    let maxZIndex = DEFAULT_BOTTOM_Z_INDEX
    if (nodeModel.isGroup) {
      maxZIndex = Math.max(maxZIndex, nodeModel.zIndex)
    }
    if (nodeModel.children) {
      ;(nodeModel as GroupNodeModel).children.forEach((nodeId) => {
        if (typeof nodeId === 'object') {
          // 正常情况下, GroupNodeModel.children是一个id数组，这里只是做个兼容
          // @ts-ignore
          nodeId = nodeId.id
        }
        const child = this.lf.getNodeModelById(nodeId)
        if (child?.isGroup) {
          const childMaxZIndex = this.findNodeAndChildMaxZIndex(child)
          maxZIndex = Math.max(childMaxZIndex, maxZIndex)
        }
      })
    }
    return maxZIndex
  }
  checkAndCorrectTopGroupZIndex = (nodes: NodeData[]) => {
    // 初始化时/增加新节点时，找出新增nodes的最大zIndex
    let maxZIndex = DEFAULT_BOTTOM_Z_INDEX
    nodes.forEach((node: NodeData) => {
      const nodeModel = this.lf.getNodeModelById(node.id)
      if (nodeModel) {
        const currentNodeMaxZIndex = this.findNodeAndChildMaxZIndex(nodeModel)
        if (currentNodeMaxZIndex > maxZIndex) {
          maxZIndex = currentNodeMaxZIndex
        }
      }
    })

    if (this.topGroupZIndex >= maxZIndex) {
      // 一般是初始化时/增加新节点时发生，因为外部强行设置了一个很大的zIndex
      // 删除节点不会影响目前最高zIndex的赋值
      return
    }
    // 新增nodes中如果存在zIndex比this.topGroupZIndex大
    // 说明this.topGroupZIndex已经失去意义，代表不了目前最高zIndex的group，需要重新校准

    // https://github.com/didi/LogicFlow/issues/1535
    // 当外部直接设置多个BaseNode.zIndex=1时
    // 当点击某一个node时，由于这个this.topGroupZIndex是从-10000开始计算的，this.topGroupZIndex+1也就是-9999
    // 这就造成当前点击的node的zIndex远远比其它node的zIndex小，因此造成zIndex错乱问题
    const allGroupNodes = this.lf.graphModel.nodes.filter(
      (node: BaseNodeModel) => node.isGroup,
    )
    let max = this.topGroupZIndex
    for (let i = 0; i < allGroupNodes.length; i++) {
      const groupNode = allGroupNodes[i]
      if (groupNode.zIndex > max) {
        max = groupNode.zIndex
      }
    }
    this.topGroupZIndex = max
  }
  /**
   * 1. 分组节点默认在普通节点下面。
   * 2. 分组节点被选中后，会将分组节点以及其内部的其他分组节点放到其余分组节点的上面。
   * 3. 分组节点取消选中后，不会将分组节点重置为原来的高度。
   * 4. 由于LogicFlow核心目标是支持用户手动绘制流程图，所以不考虑一张流程图超过1000个分组节点的情况。
   */
  nodeSelected = ({
    data,
    isMultiple,
    isSelected,
  }: {
    data: NodeData
    isMultiple: boolean
    isSelected: boolean
  }) => {
    const nodeModel = this.lf.getNodeModelById(data.id)
    this.toFrontGroup(nodeModel)
    // 重置所有的group zIndex,防止group节点zIndex增长为正。
    if (this.topGroupZIndex > DEFAULT_TOP_Z_INDEX) {
      this.topGroupZIndex = DEFAULT_BOTTOM_Z_INDEX
      const allGroups = this.lf.graphModel.nodes
        .filter((node) => node.isGroup)
        .sort((a, b) => a.zIndex - b.zIndex)
      let preZIndex = 0
      for (let i = 0; i < allGroups.length; i++) {
        const group = allGroups[i]
        if (group.zIndex !== preZIndex) {
          this.topGroupZIndex++
          preZIndex = group.zIndex
        }
        group.setZIndex(this.topGroupZIndex)
      }
    }
    // FIX #1004
    // 如果节点被多选，
    // 这个节点是分组，则将分组的所有子节点取消选中
    // 这个节点是分组的子节点，且其所属分组节点已选，则取消选中
    if (isMultiple && isSelected) {
      if (nodeModel?.isGroup) {
        ;(nodeModel as GroupNodeModel).children.forEach((child) => {
          const childModel = this.lf.graphModel.getElement(child)
          childModel?.setSelected(false)
        })
      } else {
        const groupId = this.nodeGroupMap.get(data.id)
        if (groupId) {
          const groupModel = this.lf.getNodeModelById(groupId)
          groupModel?.isSelected && nodeModel?.setSelected(false)
        }
      }
    }
  }
  toFrontGroup = (model?: BaseNodeModel) => {
    if (!model || !model.isGroup) {
      return
    }
    this.topGroupZIndex++
    model.setZIndex(this.topGroupZIndex)
    if (model.children) {
      ;(model as GroupNodeModel).children.forEach((nodeId) => {
        const node = this.lf.getNodeModelById(nodeId)
        this.toFrontGroup(node)
      })
    }
  }

  /**
   * 获取自定位置其所属分组
   * 当分组重合时，优先返回最上层的分组
   */
  getGroup(
    bounds: BoxBoundsPoint,
    nodeData: NodeData,
  ): BaseNodeModel | undefined {
    const { nodes } = this.lf.graphModel
    const groups = nodes.filter(
      (node) =>
        node.isGroup &&
        (node as GroupNodeModel).isInRange(bounds) &&
        node.id !== nodeData.id,
    )

    if (groups.length === 0) return
    if (groups.length === 1) return groups[0]
    let topGroup = groups[groups.length - 1]
    for (let i = groups.length - 2; i >= 0; i--) {
      if (groups[i].zIndex > topGroup.zIndex) {
        topGroup = groups[i]
      }
    }
    return topGroup
  }

  /**
   * 获取某个节点所属的groupModel
   */
  getNodeGroup(nodeId: string) {
    const groupId = this.nodeGroupMap.get(nodeId)
    if (groupId) {
      return this.lf.getNodeModelById(groupId)
    }
  }

  render() {}
  destroy() {}
}

export * from './GroupNode'
export default GroupNode
