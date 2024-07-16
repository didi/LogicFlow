import LogicFlow, {
  BaseEdgeModel,
  BaseNodeModel,
  EventType,
  transformNodeData,
  transformEdgeData,
} from '@logicflow/core'
import { cloneDeep, filter, forEach, has, map } from 'lodash-es'
import groupNode, { GroupNodeModel } from './groupNode'

import GraphConfigData = LogicFlow.GraphConfigData
import GraphElements = LogicFlow.GraphElements
import EdgeConfig = LogicFlow.EdgeConfig
import EdgeData = LogicFlow.EdgeData
// import NodeConfig = LogicFlow.NodeConfig
import NodeData = LogicFlow.NodeData
import ElementsInfoInGroup = DynamicGroup.ElementsInfoInGroup

export * from './groupNode'

export class DynamicGroup {
  static pluginName = 'dynamicGroup'

  private lf: LogicFlow
  // 激活态的 group 节点
  activeGroup?: GroupNodeModel
  // 存储节点与 group 的映射关系
  nodeGroupMap: Map<string, string> = new Map()

  constructor({ lf }: LogicFlow.IExtensionProps) {
    lf.register(groupNode)
    this.lf = lf

    // 初始化插件，从监听事件开始及设置规则开始
    this.init()
  }

  /**
   * 获取分组内的节点
   * @param groupModel
   */
  getNodesInGroup(groupModel: GroupNodeModel): string[] {
    let nodeIds: string[] = []
    if (groupModel.isGroup) {
      forEach(Array.from(groupModel.children), (nodeId: string) => {
        nodeIds.push(nodeId)

        const nodeModel = this.lf.getNodeModelById(nodeId)
        if (nodeModel?.isGroup) {
          nodeIds = nodeIds.concat(
            this.getNodesInGroup(nodeModel as GroupNodeModel),
          )
        }
      })
    }
    return nodeIds
  }

  /**
   * 获取节点所属的分组
   * @param nodeId
   */
  getGroupByNodeId(nodeId: string) {
    const groupId = this.nodeGroupMap.get(nodeId)
    if (groupId) {
      return this.lf.getNodeModelById(groupId)
    }
  }

  addNodeToGroup({ data: node }: { data: NodeData }) {
    // 1. 如果该节点之前已经在 group 中了，则将其从之前的 group 移除
    const preGroupId = this.nodeGroupMap.get(node.id)
    if (preGroupId) {
      const group = this.lf.getNodeModelById(preGroupId) as GroupNodeModel
      group.removeChild(node.id)
      this.nodeGroupMap.delete(node.id)
      group.setGroupNodeAddable(false)
    }

    // 2. 然后再判断这个节点是否在某个 group 范围内，如果是，则将其添加到对应的 group 中
    const nodeModel = this.lf.getNodeModelById(node.id)
    const bounds = nodeModel?.getBounds()
    if (nodeModel && bounds) {
      // TODO: 找到这个范围内的 groupModel, 并加 node 添加到该 group
    }
  }

  removeNodeFromGroup({ data: node }: { data: NodeData }) {
    if (node.isGroup && node.children) {
      forEach(Array.from((node as GroupNodeModel).children), (childId) => {
        this.nodeGroupMap.delete(childId)
        this.lf.deleteNode(childId)
      })
    }
  }

  setActiveGroup() {}

  onNodeSelect() {}

  onGraphRendered() {}

  /**
   * 创建一个 Group 类型节点内部所有子节点的副本
   * 并且在遍历所有 nodes 的过程中，顺便拿到所有 edges (只在 Group 范围的 edges)
   */
  initGroupChildNodes(
    nodeIdMap: Record<string, string>,
    children: Set<string>,
    curGroup: GroupNodeModel,
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
        const childNodeData = childNode.getData()
        const eventType = EventType.NODE_GROUP_COPY || 'node:group-copy-add'

        const newNodeConfig = transformNodeData(childNodeData, distance)
        const tempChildNode = this.lf.addNode(newNodeConfig, eventType)
        curGroup.addChild(tempChildNode.id)

        nodeIdMap[childId] = tempChildNode.id // id 同 childId，做映射存储
        allChildNodes.push(tempChildNode)

        // 1. 存储 children 内部节点相关的输入边（incoming）
        allRelatedEdges.push(
          ...[...tempChildNode.incoming.edges, ...tempChildNode.outgoing.edges],
        )

        if (children instanceof Set) {
          const { childNodes, edgesData } = this.initGroupChildNodes(
            nodeIdMap,
            children,
            tempChildNode as GroupNodeModel,
            distance,
          )

          allChildNodes.push(...childNodes)
          edgesDataArr.push(...edgesData)
        }
      }
    })

    // TODO: 确认，递归的方式，是否将所有嵌套的边数据都有返回
    console.log('allRelatedEdges -->>', allRelatedEdges)

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

  init() {
    const { lf } = this
    const { graphModel } = lf
    // 添加分组节点移动规则
    // 1. 移动分组节点时，同时移动分组内所有节点
    // 2. 移动子节点时，判断是否有限制规则（isRestrict）
    graphModel.addNodeMoveRules((model, deltaX, deltaY) => {
      // 判断如果是 group，移动时需要同时移动组内的所有节点
      if (model.isGroup) {
        const nodeIds = this.getNodesInGroup(model as GroupNodeModel)
        graphModel.moveNodes(nodeIds, deltaX, deltaY, true)
        return true
      }

      const groupId = this.nodeGroupMap.get(model.id)!
      const groupModel = this.lf.getNodeModelById(groupId) as GroupNodeModel

      if (groupModel && groupModel.isRestrict) {
        // 如果移动的节点存在与分组中，且这个分组禁止子节点移出去
        const { x1, y1, x2, y2 } = model.getBounds()
        return groupModel.isAllowMoveTo({
          x1: x1 + deltaX,
          y1: y1 + deltaY,
          x2: x2 + deltaX,
          y2: y2 + deltaY,
        })
      }

      return true
    })
    graphModel.group = this

    lf.on('node:add,node:drop,node:dnd-add', this.addNodeToGroup)
    lf.on('node:delete', this.removeNodeFromGroup)
    lf.on('node:drag,node:dnd-drag', this.setActiveGroup)
    lf.on('node:click', this.onNodeSelect)
    lf.on('graph:rendered', this.onGraphRendered)
    // lf.eventCenter.on('node:resize', this.onGroupResize)

    // https://github.com/didi/LogicFlow/issues/1346
    // 重写 addElements() 方法，在 addElements() 原有基础上增加对 group 内部所有 nodes 和 edges 的复制功能
    // 使用场景：addElements api 项目内部目前只在快捷键粘贴时使用（此处解决的也应该是粘贴场景的问题）
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
        const { children, ...rest } = node
        const model = lf.addNode(rest)

        if (originId) nodeIdMap[originId] = model.id
        elements.nodes.push(model) // 此时为 group 的 nodeModel

        // TODO: 递归创建 group 的 nodeModel 的 children
        if (model.isGroup) {
          const { edgesData } = this.initGroupChildNodes(
            nodeIdMap,
            children,
            model as GroupNodeModel,
            distance,
          )
          edgesInnerGroup.push(...edgesData)
        }
      })

      forEach(edgesInnerGroup, (edge) => {
        this.createEdge(edge, nodeIdMap, distance)
      })

      console.log('selectedEdges --->>>', selectedEdges)
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
  }
}

export namespace DynamicGroup {
  export type ElementsInfoInGroup = {
    childNodes: BaseNodeModel[] // 分组节点的所有子节点 model
    edgesData: EdgeData[] // 属于分组内的线的 EdgeData (即开始节点和结束节点都在 Group 内)
  }

  export type DynamicGroupOptions = Partial<{
    isCollapsed: boolean
  }>
}

export default DynamicGroup
