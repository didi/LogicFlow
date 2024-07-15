import LogicFlow, {
  BaseEdgeModel,
  BaseNodeModel,
  EventType,
} from '@logicflow/core'
import { filter, forEach, has, map } from 'lodash-es'
import groupNode, { GroupNodeModel } from './groupNode'

import GraphConfigData = LogicFlow.GraphConfigData
import GraphElements = LogicFlow.GraphElements
import EdgeConfig = LogicFlow.EdgeConfig

export * from './groupNode'

export namespace DynamicGroup {
  export type DynamicGroupOptions = Partial<{
    isFold: boolean
  }>
}

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

  addNodeToGroup() {
    // 1. 如果该节点之前已经在 group 中了，则将其从之前的 group 移除
  }

  removeNodeFromGroup() {}

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
    current: GroupNodeModel,
    distance: number,
  ) {
    const allNodes: BaseNodeModel[] = []
    const allEdges: BaseEdgeModel[] = []

    forEach(Array.from(children), (nodeId: string) => {
      const nodeModel = this.lf.getNodeModelById(nodeId)
      if (nodeModel) {
        const { id, children, ...nodeConfig } = nodeModel.getData()
        const eventType = EventType.NODE_GROUP_COPY || 'node:group-copy-add'

        const childNodeModel = this.lf.addNode(
          {
            ...nodeConfig,
            x: nodeConfig.x + distance,
            y: nodeConfig.y + distance,
            text: nodeConfig.text?.value,
            // 如果不传递type，会自动触发 NODE_ADD
            // 有概率触发appendToGroup
          },
          eventType,
        )
        current.addChild(childNodeModel.id)

        nodeIdMap[id] = childNodeModel.id // id 同 nodeId
        allNodes.push(childNodeModel)

        // 1. 存储 children 内部节点相关的输入边（incoming）
        allEdges.push(
          ...[
            ...childNodeModel.incoming.edges,
            ...childNodeModel.outgoing.edges,
          ],
        )

        if (children instanceof Set) {
          const { nodes: childNodes, edges: childEdges } =
            this.initGroupChildNodes(
              nodeIdMap,
              children,
              childNodeModel as GroupNodeModel,
              distance,
            )

          allNodes.push(...childNodes)
          allEdges.push(...childEdges)
        }
      }
    })

    // 1. 判断每一条边的开始节点、目标节点是否在 Group 中
    const edgesInnerGroup = filter(allEdges, (edge) => {
      // TODO: 是否将 nodeIdMap 直接使用 Map 类型数据
      return (
        has(nodeIdMap, edge.sourceNodeId) && has(nodeIdMap, edge.targetNodeId)
      )
    })
    // 2. 为每一条 Group 的内部变构建出 EdgeData 数据
    // TODO: 什么意思呢？把 EdgeData 数据 往 BaseEdgeModel[] 中塞！why
    const edgesDataInnerGroup = map(edgesInnerGroup, (edge) => {
      return edge.getData()
    })

    console.log('edgesDataInnerGroup', edgesDataInnerGroup)

    return {
      nodes: allNodes,
      edges: allEdges,
    }
  }

  init() {
    const { lf } = this
    const { graphModel } = lf
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
    // lf.on('node:delete', this.removeNodeFromGroup)
    lf.eventCenter.on('node:drag,node:dnd-drag', this.setActiveGroup)
    lf.eventCenter.on('node:click', this.onNodeSelect)
    lf.eventCenter.on('graph:rendered', this.onGraphRendered)
    // lf.eventCenter.on('node:resize', this.onGroupResize)

    // https://github.com/didi/LogicFlow/issues/1346
    // 重写 addElements() 方法，在 addElements() 原有基础上增加对 group 内部所有 nodes 和 edges 的复制功能
    lf.addElements = (
      { nodes: selectedNodes, edges: selectedEdges }: GraphConfigData,
      distance = 40,
    ): GraphElements => {
      // 1. 初始化变量
      const nodeIdMap: Record<string, string> = {}
      const elements: GraphElements = {
        nodes: [],
        edges: [],
      }
      const edgesInnerGroup: EdgeConfig[] = []

      forEach(selectedNodes, (node) => {
        const preId = node.id
        const { children, ...rest } = node
        const model = lf.addNode(rest)

        if (preId) nodeIdMap[preId] = model.id
        elements.nodes.push(model) // 此时为 group 的 nodeModel

        // TODO: 递归创建 group 的 nodeModel 的 children
        if (model.isGroup) {
          const { edges } = this.initGroupChildNodes(
            nodeIdMap,
            children,
            model as GroupNodeModel,
            distance,
          )
          edgesInnerGroup.push(...edges)
        }
      })

      console.log('selectedEdges --->>>', selectedEdges)

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

export default DynamicGroup
