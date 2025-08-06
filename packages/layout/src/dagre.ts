/**
 * @fileoverview Dagre布局插件 - 提供自动化图形布局功能
 *
 * 本插件基于dagre.js实现LogicFlow的自动化布局功能，支持多种布局方向
 * 可自动计算节点位置和连线路径，实现整洁的图形展示
 */
import LogicFlow, { BaseNodeModel, BaseEdgeModel } from '@logicflow/core'
import dagre, { GraphLabel, graphlib } from 'dagre'

import NodeConfig = LogicFlow.NodeConfig
import EdgeConfig = LogicFlow.EdgeConfig
import Point = LogicFlow.Point

/**
 * Dagre布局配置选项接口
 * @interface DagreOption
 * @extends GraphLabel - 继承dagre原生配置
 */
export interface DagreOption extends GraphLabel {
  /**
   * 是否自动调整连线锚点和计算路径
   * true: 会根据布局方向自动计算边的路径点
   */
  changeAnchor?: boolean
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

    // 创建dagre图实例
    const g = new graphlib.Graph()
    g.setGraph(this.option)
    g.setDefaultEdgeLabel(() => ({}))

    // 将LogicFlow节点添加到dagre图中
    nodes.forEach((node: BaseNodeModel) => {
      g.setNode(node.id, {
        width: node.width || 150,
        height: node.height || 50,
        id: node.id,
      })
    })

    // 将LogicFlow边添加到dagre图中
    edges.forEach((edge: BaseEdgeModel) => {
      g.setEdge(edge.sourceNodeId, edge.targetNodeId, {
        id: edge.id,
      })
    })

    // 执行dagre布局算法
    dagre.layout(g)

    // 存储新的节点和边数据
    const newNodes: NodeConfig[] = []
    const newEdges: EdgeConfig[] = []

    // 更新节点位置
    g.nodes().forEach((nodeId: string) => {
      const { x, y } = g.node(nodeId)
      const lfNode = this.lf.getNodeDataById(nodeId)
      if (!lfNode) {
        throw new Error(`布局错误：找不到ID为 ${nodeId} 的节点`)
      }

      // 更新节点坐标
      lfNode.x = x
      lfNode.y = y

      // 更新节点文本位置
      if (lfNode?.text?.x) {
        lfNode.text.x = x
        lfNode.text.y = y
      }

      newNodes.push(lfNode)
    })

    // 处理边的路径和锚点
    edges.forEach((edge: BaseEdgeModel) => {
      const lfEdge: any = this.lf.getEdgeDataById(edge.id)
      if (!lfEdge) {
        return
      }

      if (!option.changeAnchor) {
        // 不调整锚点时，清除路径相关数据让LogicFlow自动计算
        delete lfEdge.pointsList
        delete lfEdge.startPoint
        delete lfEdge.endPoint
      } else {
        // 调整锚点时，重新计算路径
        delete lfEdge.pointsList
        delete lfEdge.startPoint
        delete lfEdge.endPoint
        delete lfEdge.sourceAnchorId
        delete lfEdge.targetAnchorId

        const model = this.lf.getEdgeModelById(edge.id)
        if (model) {
          // 计算自定义折线路径
          lfEdge.pointsList = this.calcPointsList(model, newNodes)
        }

        if (lfEdge.pointsList) {
          // 设置边的起点和终点
          const first = lfEdge.pointsList[0]
          const last = lfEdge.pointsList[lfEdge.pointsList.length - 1]
          lfEdge.startPoint = { x: first.x, y: first.y }
          lfEdge.endPoint = { x: last.x, y: last.y }

          // 调整边标签位置
          if (lfEdge.text && lfEdge.text.value) {
            lfEdge.text = {
              x: last.x - this.getBytesLength(lfEdge.text.value) * 6 - 10,
              y: last.y,
              value: lfEdge.text.value,
            }
          }
        } else if (lfEdge.text && lfEdge.text.value) {
          // 没有自定义路径时保留文本内容
          lfEdge.text = lfEdge.text.value
        }
      }

      newEdges.push(lfEdge)
    })

    // 将计算好的布局数据应用到画布
    this.lf.renderRawData({
      nodes: newNodes,
      edges: newEdges,
    })
  }

  /**
   * 计算字符串显示宽度（用于文本定位）
   * @param word - 要计算的文本
   * @returns 估算的文本像素宽度
   */
  getBytesLength(word: string): number {
    if (!word) {
      return 0
    }

    let totalLength = 0
    for (let i = 0; i < word.length; i++) {
      const c = word.charCodeAt(i)
      // 大写字母宽度加权
      if (word.match(/[A-Z]/)) {
        totalLength += 1.5
      }
      // ASCII字符和半角字符
      else if ((c >= 0x0001 && c <= 0x007e) || (c >= 0xff60 && c <= 0xff9f)) {
        totalLength += 1
      }
      // 其他字符（如中文）
      else {
        totalLength += 2
      }
    }

    return totalLength
  }

  /**
   * 优化折线路径点，移除冗余点
   * @param points - 原始路径点数组
   * @returns 优化后的路径点数组
   */
  pointFilter(points: Point[]): Point[] {
    const allPoints = [...points] // 创建副本避免修改原始数据
    let i = 1

    // 删除直线上的中间点（保持路径简洁）
    while (i < allPoints.length - 1) {
      const pre = allPoints[i - 1]
      const current = allPoints[i]
      const next = allPoints[i + 1]

      // 如果三点共线，移除中间点
      if (
        (pre.x === current.x && current.x === next.x) || // 垂直线上的点
        (pre.y === current.y && current.y === next.y)
      ) {
        // 水平线上的点
        allPoints.splice(i, 1)
      } else {
        i++
      }
    }

    return allPoints
  }

  /**
   * 计算边的折线路径点
   * @param model - 边模型
   * @param nodes - 节点数据数组
   * @returns 计算后的路径点数组，如果无法计算则返回undefined
   */
  calcPointsList(
    model: BaseEdgeModel,
    nodes: NodeConfig[],
  ): Point[] | undefined {
    const pointsList: Point[] = []

    // 获取源节点和目标节点的模型与布局数据
    const sourceNodeModel = this.lf.getNodeModelById(model.sourceNodeId)
    const targetNodeModel = this.lf.getNodeModelById(model.targetNodeId)
    const newSourceNodeData = nodes.find(
      (node: NodeConfig) => node.id === model.sourceNodeId,
    )
    const newTargetNodeData = nodes.find(
      (node: NodeConfig) => node.id === model.targetNodeId,
    )

    // 数据验证
    if (
      !sourceNodeModel ||
      !targetNodeModel ||
      !newSourceNodeData ||
      !newTargetNodeData
    ) {
      return undefined
    }

    // 折线偏移量（用于创建合适的转折点）
    const offset = Number(model.offset) || 50

    // 处理从左到右(LR)布局的边路径
    if (this.option.rankdir === 'LR' && model.modelType === 'polyline-edge') {
      // 正向连线：源节点在目标节点左侧
      if (newSourceNodeData.x < newTargetNodeData.x) {
        // 从源节点右侧中心出发
        pointsList.push({
          x: newSourceNodeData.x + sourceNodeModel.width / 2,
          y: newSourceNodeData.y,
        })
        // 向右延伸一段距离
        pointsList.push({
          x: newSourceNodeData.x + sourceNodeModel.width / 2 + offset,
          y: newSourceNodeData.y,
        })
        // 垂直移动到目标节点的高度
        pointsList.push({
          x: newSourceNodeData.x + sourceNodeModel.width / 2 + offset,
          y: newTargetNodeData.y,
        })
        // 连接到目标节点左侧中心
        pointsList.push({
          x: newTargetNodeData.x - targetNodeModel.width / 2,
          y: newTargetNodeData.y,
        })

        return this.pointFilter(pointsList)
      }

      // 反向连线：源节点在目标节点右侧
      if (newSourceNodeData.x > newTargetNodeData.x) {
        // 根据节点相对Y轴位置选择不同路径
        if (newSourceNodeData.y >= newTargetNodeData.y) {
          // 源节点在目标节点的右下方，从源节点上方出发
          pointsList.push({
            x: newSourceNodeData.x,
            y: newSourceNodeData.y + sourceNodeModel.height / 2,
          })
          pointsList.push({
            x: newSourceNodeData.x,
            y: newSourceNodeData.y + sourceNodeModel.height / 2 + offset,
          })
          pointsList.push({
            x: newTargetNodeData.x,
            y: newSourceNodeData.y + sourceNodeModel.height / 2 + offset,
          })
          pointsList.push({
            x: newTargetNodeData.x,
            y: newTargetNodeData.y + targetNodeModel.height / 2,
          })
        } else {
          // 源节点在目标节点的右上方，从源节点下方出发
          pointsList.push({
            x: newSourceNodeData.x,
            y: newSourceNodeData.y - sourceNodeModel.height / 2,
          })
          pointsList.push({
            x: newSourceNodeData.x,
            y: newSourceNodeData.y - sourceNodeModel.height / 2 - offset,
          })
          pointsList.push({
            x: newTargetNodeData.x,
            y: newSourceNodeData.y - sourceNodeModel.height / 2 - offset,
          })
          pointsList.push({
            x: newTargetNodeData.x,
            y: newTargetNodeData.y - targetNodeModel.height / 2,
          })
        }

        return this.pointFilter(pointsList)
      }
    }

    // 处理从上到下(TB)布局的边路径
    if (this.option.rankdir === 'TB' && model.modelType === 'polyline-edge') {
      // 正向连线：源节点在目标节点上方
      if (newSourceNodeData.y < newTargetNodeData.y) {
        // 从源节点底部中心出发
        pointsList.push({
          x: newSourceNodeData.x,
          y: newSourceNodeData.y + sourceNodeModel.height / 2,
        })
        // 向下延伸一段距离
        pointsList.push({
          x: newSourceNodeData.x,
          y: newSourceNodeData.y + sourceNodeModel.height / 2 + offset,
        })
        // 水平移动到目标节点的位置
        pointsList.push({
          x: newTargetNodeData.x,
          y: newSourceNodeData.y + sourceNodeModel.height / 2 + offset,
        })
        // 连接到目标节点顶部中心
        pointsList.push({
          x: newTargetNodeData.x,
          y: newTargetNodeData.y - targetNodeModel.height / 2,
        })

        return this.pointFilter(pointsList)
      }

      // 反向连线：源节点在目标节点下方
      if (newSourceNodeData.y > newTargetNodeData.y) {
        if (newSourceNodeData.x >= newTargetNodeData.x) {
          // 源节点在目标节点右下方，从源节点右侧出发
          pointsList.push({
            x: newSourceNodeData.x + sourceNodeModel.width / 2,
            y: newSourceNodeData.y,
          })
          pointsList.push({
            x: newSourceNodeData.x + sourceNodeModel.width / 2 + offset,
            y: newSourceNodeData.y,
          })
          pointsList.push({
            x: newSourceNodeData.x + sourceNodeModel.width / 2 + offset,
            y: newTargetNodeData.y,
          })
          pointsList.push({
            x: newTargetNodeData.x + targetNodeModel.width / 2,
            y: newTargetNodeData.y,
          })
        } else {
          // 源节点在目标节点左下方，从源节点左侧出发
          pointsList.push({
            x: newSourceNodeData.x - sourceNodeModel.width / 2,
            y: newSourceNodeData.y,
          })
          pointsList.push({
            x: newSourceNodeData.x - sourceNodeModel.width / 2 - offset,
            y: newSourceNodeData.y,
          })
          pointsList.push({
            x: newSourceNodeData.x - sourceNodeModel.width / 2 - offset,
            y: newTargetNodeData.y,
          })
          pointsList.push({
            x: newTargetNodeData.x - targetNodeModel.width / 2,
            y: newTargetNodeData.y,
          })
        }

        return this.pointFilter(pointsList)
      }
    }

    // 无法确定路径时返回undefined，让LogicFlow自行处理
    return undefined
  }
}
