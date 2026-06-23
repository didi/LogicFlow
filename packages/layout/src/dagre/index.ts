/**
 * @fileoverview Dagre布局插件 - 提供自动化图形布局功能
 *
 * 本插件基于dagre.js实现LogicFlow的自动化布局功能，支持多种布局方向
 * 可自动计算节点位置和连线路径，实现整洁的图形展示
 */
import LogicFlow, { BaseNodeModel, BaseEdgeModel } from '@logicflow/core'
import dagre, { GraphLabel, graphlib } from 'dagre'
import { processEdges } from '../utils/processEdge'
import {
  alignScopedLayoutToGroup,
  applyGroupResizeAndWarnings,
  createGroupLayoutWarningState,
  getNodeSize,
  GroupLayoutOption,
  isGroupModel,
  LayoutEdge,
  LayoutScope,
  moveGroupDescendantsBy,
  resolveLayoutScopes,
} from '../utils/groupLayout'

import NodeConfig = LogicFlow.NodeConfig
import EdgeConfig = LogicFlow.EdgeConfig

/**
 * Dagre布局配置选项接口
 * @interface DagreOption
 * @extends GraphLabel - 继承dagre原生配置
 */
export interface DagreOption extends GraphLabel, GroupLayoutOption {
  /**
   * 是否是默认锚点
   * true: 会根据布局方向自动计算边的路径点
   */
  isDefaultAnchor?: boolean
}

/**
 * Dagre插件接口定义
 */
export interface DagrePlugin {
  /**
   * 执行布局计算
   * @param option - 布局配置选项
   */
  layout(option: DagreOption): void
}

/**
 * Dagre布局类 - LogicFlow自动布局插件
 * 基于dagre.js提供图的自动布局能力
 */
export class Dagre {
  /** 插件名称，用于在LogicFlow中注册 */
  static pluginName = 'dagre'

  /** LogicFlow实例引用 */
  lf: LogicFlow

  /** 当前布局配置 */
  option: DagreOption // 使用已定义的DagreOption接口替代重复定义

  /**
   * 插件初始化方法，由LogicFlow自动调用
   * @param lf - LogicFlow实例
   */
  render(lf: LogicFlow) {
    this.lf = lf
  }

  /**
   * 执行布局算法，重新排列图中的节点和边
   * @param option - 布局配置选项
   */
  layout(option: DagreOption = {}) {
    const { nodes: allNodes, edges: allEdges, gridSize } = this.lf.graphModel

    // 根据网格大小调整节点间距
    let nodesep = 100
    let ranksep = 150
    if (gridSize > 20) {
      nodesep = gridSize * 2
      ranksep = gridSize * 2
    }

    // 合并默认配置和用户配置
    this.option = {
      // 默认从左到右布局
      rankdir: 'LR',
      // 默认右下角对齐
      align: 'UL',
      // 紧凑树形排名算法
      ranker: 'tight-tree',
      // 层级间距
      ranksep,
      // 同层节点间距
      nodesep,
      // 图的水平边距
      marginx: 120,
      // 图的垂直边距
      marginy: 120,
      // 用户自定义选项覆盖默认值
      ...option,
    }
    const scopes = resolveLayoutScopes(allNodes, allEdges, this.option.groupId)
    if (scopes.length === 0) return
    this.applyDagreLayout(allNodes, allEdges, scopes)
  }

  /**
   * 使用 Dagre 布局
   * @param nodes - 节点数据
   * @param edges - 边数据
   */
  applyDagreLayout(
    allNodes: BaseNodeModel[],
    allEdges: BaseEdgeModel[],
    scopes: LayoutScope[],
  ) {
    try {
      const newGraphData = this.convertLayoutDataToLf(
        allNodes,
        allEdges,
        scopes,
      )
      this.lf.renderRawData(newGraphData)
    } catch (error) {
      console.error('Dagre layout error:', error)
    }
  }

  runDagreLayout(
    nodes: BaseNodeModel[],
    edges: LayoutEdge[],
    nodeMap: Map<string, NodeConfig>,
  ) {
    // 创建dagre图实例
    const g = new graphlib.Graph()
    // dagre布局配置
    g.setGraph(this.option)
    //构造dagre布局数据
    g.setDefaultEdgeLabel(() => ({}))
    nodes.forEach((node: BaseNodeModel) => {
      const nodeData = nodeMap.get(node.id)
      const size = nodeData
        ? getNodeSize(nodeData, new Map([[node.id, node]]))
        : node
      g.setNode(node.id, {
        width: size.width || 150,
        height: size.height || 50,
        id: node.id,
      })
    })
    edges.forEach((edge: LayoutEdge) => {
      g.setEdge(edge.sourceNodeId, edge.targetNodeId, {
        id: edge.id,
      })
    })
    // 开始dagre布局
    dagre.layout(g)
    return g
  }

  convertLayoutDataToLf(
    allNodes: BaseNodeModel[],
    allEdges: BaseEdgeModel[],
    scopes: LayoutScope[],
  ) {
    // 存储新的节点和边数据
    const newNodes: NodeConfig[] = allNodes.map((nodeModel) => {
      const lfNode = nodeModel.getData()
      if (!lfNode) {
        throw new Error(`布局错误：找不到ID为 ${nodeModel.id} 的节点`)
      }
      return lfNode
    })
    const nodeMap = new Map(
      newNodes
        .filter((node): node is NodeConfig & { id: string } => !!node.id)
        .map((node) => [node.id, node]),
    )
    const warningState = createGroupLayoutWarningState()

    scopes.forEach((scope) => {
      const layoutData = this.runDagreLayout(scope.nodes, scope.edges, nodeMap)

      scope.nodes.forEach((nodeModel) => {
        const lfNode = nodeMap.get(nodeModel.id)
        const newNode = layoutData.node(nodeModel.id)
        if (!lfNode || !newNode) {
          throw new Error(`布局错误：找不到ID为 ${nodeModel.id} 的节点`)
        }
        const dx = newNode.x - lfNode.x
        const dy = newNode.y - lfNode.y

        // 更新节点坐标
        lfNode.x = newNode.x
        lfNode.y = newNode.y

        // 更新节点文本位置
        if (
          typeof lfNode.text === 'object' &&
          lfNode.text &&
          typeof lfNode.text.x === 'number'
        ) {
          lfNode.text.x = newNode.x
          lfNode.text.y = newNode.y
        }

        if (isGroupModel(nodeModel)) {
          moveGroupDescendantsBy(allNodes, newNodes, nodeModel.id, dx, dy)
        }
      })

      alignScopedLayoutToGroup(allNodes, newNodes, scope.nodes, scope.groupId)
      applyGroupResizeAndWarnings(allNodes, newNodes, this.option, warningState)
    })

    const newEdges: EdgeConfig[] = processEdges(
      this.lf,
      this.option.rankdir,
      this.option.isDefaultAnchor,
      allEdges,
      newNodes,
    )

    return {
      nodes: newNodes,
      edges: newEdges,
    }
  }
}
