/**
 * @fileoverview ElkLayout布局插件 - 提供自动化图形布局功能
 *
 * 本插件基于elkjs实现LogicFlow的自动化布局功能，支持多种布局方向
 * 可自动计算节点位置和连线路径，实现整洁的图形展示
 */
import LogicFlow, { BaseNodeModel, BaseEdgeModel } from '@logicflow/core'
import elkConstructor from 'elkjs/lib/elk.bundled'
import { LayoutOptions, ElkNode } from 'elkjs/lib/elk-api'
import { processEdges } from '../utils/processEdge'
import { elkOptionMap } from './config'

import NodeConfig = LogicFlow.NodeConfig
import EdgeConfig = LogicFlow.EdgeConfig

/**
 * ElkLayout布局配置选项接口
 * @interface ElkLayoutOption
 */
export interface ElkLayoutOption {
  /**
   * 布局方向
   * 'LR' | 'TB' | 'BT' | 'RL'
   */
  rankdir?: 'LR' | 'TB' | 'BT' | 'RL'
  /**
   * 对齐方式
   * 'UL' | 'UR' | 'DL' | 'DR'
   */
  align?: 'UL' | 'UR' | 'DL' | 'DR'
  /**
   * 同层节点间距
   */
  nodesep?: number
  /**
   * 层级间距
   */
  ranksep?: number
  /**
   * 图的水平边距
   */
  marginx?: number
  /**
   * 图的垂直边距
   */
  marginy?: number
  /**
   * 排版算法
   * 'network-simplex' | 'tight-tree' | 'longest-path'
   */
  ranker?: 'network-simplex' | 'tight-tree' | 'longest-path'
  /**
   * 边间距
   */
  edgesep?: number
  /**
   * 有向无环图处理算法
   * 'greedy'
   */
  acyclicer?: 'greedy'
  /**
   * 是否是默认锚点
   * true: 会根据布局方向自动计算边的路径点
   */
  isDefaultAnchor?: boolean
  /**
   * ELK 原生布局属性，用于覆盖默认配置
   */
  elkOption?: LayoutOptions
}

/**
 * ElkLayout插件接口定义
 */
export interface ElkLayoutPlugin {
  /**
   * 执行布局计算
   * @param option - 布局配置选项
   */
  layout(option: ElkLayoutOption): void
}

/**
 * ElkLayout布局类 - LogicFlow自动布局插件
 * 基于elkjs提供图的自动布局能力
 */
export class ElkLayout {
  /** 插件名称，用于在LogicFlow中注册 */
  static pluginName = 'elkLayout'

  /** LogicFlow实例引用 */
  lf: LogicFlow

  /** 当前布局配置 */
  option: ElkLayoutOption

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
  layout(option: ElkLayoutOption = {}) {
    const { nodes, edges, gridSize } = this.lf.graphModel

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

    this.applyElkLayout(nodes, edges)
  }

  /**
   * 使用 ELK 布局
   * @param nodes - 节点数据
   * @param edges - 边数据
   * @param elkOption - ELK 配置选项
   */
  async applyElkLayout(nodes: BaseNodeModel[], edges: BaseEdgeModel[]) {
    // 创建elk实例
    const elk = new elkConstructor()
    // elk布局配置
    const layoutOptions = this.convertOptionsToElk()
    // 构造elk布局数据
    const elkGraph = {
      id: 'root',
      children: nodes.map((node) => ({
        id: node.id,
        width: node.width || 150,
        height: node.height || 50,
      })),
      edges: edges.map((edge) => ({
        id: edge.id,
        sources: [edge.sourceNodeId],
        targets: [edge.targetNodeId],
      })),
    }
    // 开始elk布局
    try {
      const elkLayoutGraph = await elk.layout(elkGraph, { layoutOptions })
      const newGraphData = this.convertLayoutDataToLf(
        nodes,
        edges,
        elkLayoutGraph,
      )
      this.lf.renderRawData(newGraphData)
    } catch (error) {
      console.error('ELK layout error:', error)
    }
  }
  convertOptionsToElk(): LayoutOptions {
    // elk布局配置
    const rankdir = (this.option.rankdir ||
      'default') as keyof typeof elkOptionMap.rankdir
    const align = (this.option.align ||
      'default') as keyof typeof elkOptionMap.align
    const ranker = (this.option.ranker ||
      'default') as keyof typeof elkOptionMap.ranker
    const acyclicer = (this.option.acyclicer ||
      'default') as keyof typeof elkOptionMap.acyclicer

    const layoutOptions = {
      'elk.algorithm': 'layered',
      'elk.direction':
        elkOptionMap.rankdir[rankdir] || elkOptionMap.rankdir.default,
      'elk.layered.nodePlacement.bk.fixedAlignment':
        elkOptionMap.align[align] || elkOptionMap.align.default,
      'elk.layered.layering.strategy':
        elkOptionMap.ranker[ranker] || elkOptionMap.ranker.default,
      'elk.layered.cycleBreaking.strategy':
        elkOptionMap.acyclicer[acyclicer] || elkOptionMap.acyclicer.default,
      'elk.padding': `[top=${this.option.marginx || 20}, left=${this.option.marginy || 20}, bottom=${this.option.marginx || 20}, right=${this.option.marginy || 20}]`,
      'elk.spacing.nodeNode': `${this.option.nodesep || 50}`,
      'elk.spacing.edgeEdge': `${this.option.edgesep || 10}`,
      'elk.layered.spacing.nodeNodeBetweenLayers': `${this.option.ranksep || 100}`,
      'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',
      'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
      ...this.option.elkOption,
    }
    return layoutOptions
  }

  convertLayoutDataToLf(
    nodes: BaseNodeModel[],
    edges: BaseEdgeModel[],
    layoutData: ElkNode,
  ) {
    // 存储新的节点和边数据
    const newNodes: NodeConfig[] = []

    // 更新节点位置
    nodes.forEach((nodeModel) => {
      const lfNode = nodeModel.getData()
      const newNode = (layoutData?.children || []).find(
        (n) => n.id === nodeModel.id,
      )
      if (!lfNode || !newNode || !newNode.x || !newNode.y) {
        throw new Error(`布局错误：找不到ID为 ${nodeModel.id} 的节点`)
      }
      // 更新节点坐标
      lfNode.x = newNode.x + nodeModel.width / 2
      lfNode.y = newNode.y + nodeModel.height / 2

      // 更新节点文本位置
      if (lfNode?.text?.x) {
        lfNode.text.x = newNode.x + nodeModel.width / 2
        lfNode.text.y = newNode.y + nodeModel.height / 2
      }
      newNodes.push(lfNode)
    })

    const newEdges: EdgeConfig[] = processEdges(
      this.lf,
      this.option.rankdir,
      this.option.isDefaultAnchor,
      edges,
      newNodes,
    )

    return {
      nodes: newNodes,
      edges: newEdges,
    }
  }
}
