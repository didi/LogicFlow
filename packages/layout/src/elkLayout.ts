/**
 * @fileoverview ElkLayout布局插件 - 提供自动化图形布局功能
 *
 * 本插件基于elkjs实现LogicFlow的自动化布局功能，支持多种布局方向
 * 可自动计算节点位置和连线路径，实现整洁的图形展示
 */
import LogicFlow, { BaseNodeModel, BaseEdgeModel } from '@logicflow/core'
import elkConstructor from 'elkjs/lib/elk.bundled'
import { LayoutOptions, ElkNode } from 'elkjs/lib/elk-api'

import NodeConfig = LogicFlow.NodeConfig
import EdgeConfig = LogicFlow.EdgeConfig
import Direction = LogicFlow.Direction
import Point = LogicFlow.Point

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

type BaseNodeData = {
  x: number
  y: number
  width: number
  height: number
}

type IBezierControls = {
  sNext: Point
  ePre: Point
}

// 定义边界数据结构，左上坐标 + 右下坐标定位一个矩形
type BoxBoundsPoint = {
  minX: number // Left Top X
  minY: number // Left Top Y
  maxX: number // Right Bottom X
  maxY: number // Right Bottom Y
}

type NodeBBox = {
  x: number
  y: number
  width: number
  height: number
  centerX: number
  centerY: number
} & BoxBoundsPoint

interface BoxBounds extends BoxBoundsPoint {
  x: number
  y: number
  width: number
  height: number
  centerX: number
  centerY: number
}

enum SegmentDirection {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical',
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

    // 由于默认的option参数，之前是设计的dagre的参数格式，所以将option参数映射为elk参数
    const elkOptionMap = {
      rankdir: {
        LR: 'RIGHT',
        TB: 'DOWN',
        BT: 'UP',
        RL: 'LEFT',
        default: 'RIGHT',
      },
      align: {
        UL: 'RIGHTDOWN',
        UR: 'RIGHTUP',
        DL: 'LEFTDOWN',
        DR: 'LEFTUP',
        default: 'BALANCED',
      },
      ranker: {
        'network-simplex': 'NETWORK_SIMPLEX',
        'tight-tree': 'NETWORK_SIMPLEX',
        'longest-path': 'LONGEST_PATH',
        default: 'NETWORK_SIMPLEX',
      },
      acyclicer: {
        greedy: 'GREEDY',
        default: 'DEPTH_FIRST',
      },
    }

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

  convertLayoutDataToLf(
    nodes: BaseNodeModel[],
    edges: BaseEdgeModel[],
    layoutData: ElkNode,
  ) {
    // 存储新的节点和边数据
    const newNodes: NodeConfig[] = []
    const newEdges: EdgeConfig[] = []

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

    // 处理边的路径和锚点
    edges.forEach((edgeModel) => {
      const lfEdge: EdgeConfig = edgeModel.getData()
      if (!lfEdge) {
        throw new Error(`布局错误：找不到ID为 ${edgeModel.id} 的边`)
      }

      if (!this.option.isDefaultAnchor) {
        // 自定义锚点，不调整边的关联锚点，只清除路径相关数据，让LogicFlow自动计算
        delete lfEdge.pointsList
        delete lfEdge.startPoint
        delete lfEdge.endPoint
        if (
          typeof lfEdge.text === 'object' &&
          lfEdge.text &&
          lfEdge.text.value
        ) {
          lfEdge.text = lfEdge.text.value
        }
      } else {
        // 默认锚点，重新计算路径以及边的起点和终点（节点默认锚点为上下左右）
        delete lfEdge.pointsList
        delete lfEdge.startPoint
        delete lfEdge.endPoint
        delete lfEdge.sourceAnchorId
        delete lfEdge.targetAnchorId

        lfEdge.pointsList = this.calcPointsList(edgeModel, newNodes)

        if (lfEdge.pointsList) {
          // 设置边的起点和终点
          const first = lfEdge.pointsList[0]
          const last = lfEdge.pointsList[lfEdge.pointsList.length - 1]
          lfEdge.startPoint = { x: first.x, y: first.y }
          lfEdge.endPoint = { x: last.x, y: last.y }
        }
        if (
          typeof lfEdge.text === 'object' &&
          lfEdge.text &&
          lfEdge.text.value
        ) {
          // 保留文本内容
          lfEdge.text = lfEdge.text.value
        }
      }

      newEdges.push(lfEdge)
    })
    return {
      nodes: newNodes,
      edges: newEdges,
    }
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

    // 处理从左到右(LR)布局的边路径，折线
    if (this.option.rankdir === 'LR' && model.modelType === 'polyline-edge') {
      // 正向连线：源节点在目标节点左侧
      if (newSourceNodeData.x <= newTargetNodeData.x) {
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

    // 处理从上到下(TB)布局的边路径, 折线
    if (this.option.rankdir === 'TB' && model.modelType === 'polyline-edge') {
      // 正向连线：源节点在目标节点上方
      if (newSourceNodeData.y <= newTargetNodeData.y) {
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

    // 处理从左到右(LR)布局的边路径, 贝塞尔曲线
    if (this.option.rankdir === 'LR' && model.modelType === 'bezier-edge') {
      const startPoint = {
        x: newSourceNodeData.x + sourceNodeModel.width / 2,
        y: newSourceNodeData.y,
      }
      const endPoint = {
        x: newTargetNodeData.x - targetNodeModel.width / 2,
        y: newTargetNodeData.y,
      }
      let sNext: Point = { x: 0, y: 0 }
      let ePre: Point = { x: 0, y: 0 }
      // 正向连线：源节点在目标节点左侧
      if (newSourceNodeData.x < newTargetNodeData.x) {
        const result = this.getBezierControlPoints({
          start: startPoint,
          end: endPoint,
          sourceNode: {
            x: newSourceNodeData.x,
            y: newSourceNodeData.y,
            width: sourceNodeModel.width,
            height: sourceNodeModel.height,
          },
          targetNode: {
            x: newTargetNodeData.x,
            y: newTargetNodeData.y,
            width: targetNodeModel.width,
            height: targetNodeModel.height,
          },
          offset,
        })
        sNext = result.sNext
        ePre = result.ePre
      }
      // 反向连线：源节点在目标节点右侧
      if (newSourceNodeData.x > newTargetNodeData.x) {
        if (newSourceNodeData.y >= newTargetNodeData.y) {
          // 源节点在目标节点的右下方
          sNext = {
            x:
              newSourceNodeData.x +
              sourceNodeModel.width / 2 +
              offset +
              targetNodeModel.width / 2,
            y:
              newSourceNodeData.y +
              sourceNodeModel.height +
              targetNodeModel.height,
          }
          ePre = {
            x:
              newTargetNodeData.x -
              targetNodeModel.width / 2 -
              offset -
              sourceNodeModel.width / 2,
            y:
              newTargetNodeData.y +
              sourceNodeModel.height +
              targetNodeModel.height,
          }
        } else {
          // 源节点在目标节点的右上方
          sNext = {
            x:
              newSourceNodeData.x +
              sourceNodeModel.width / 2 +
              offset +
              targetNodeModel.width / 2,
            y:
              newSourceNodeData.y -
              sourceNodeModel.height -
              targetNodeModel.height,
          }
          ePre = {
            x:
              newTargetNodeData.x -
              targetNodeModel.width / 2 -
              offset -
              sourceNodeModel.width / 2,
            y:
              newTargetNodeData.y -
              sourceNodeModel.height -
              targetNodeModel.height,
          }
        }
      }
      pointsList.push(startPoint, sNext, ePre, endPoint)
      return pointsList
    }

    // 处理从上到下(TB)布局的边路径, 贝塞尔曲线
    if (this.option.rankdir === 'TB' && model.modelType === 'bezier-edge') {
      const startPoint = {
        x: newSourceNodeData.x,
        y: newSourceNodeData.y + sourceNodeModel.height / 2,
      }
      const endPoint = {
        x: newTargetNodeData.x,
        y: newTargetNodeData.y - targetNodeModel.height / 2,
      }
      let sNext: Point = { x: 0, y: 0 }
      let ePre: Point = { x: 0, y: 0 }
      if (newSourceNodeData.y <= newTargetNodeData.y) {
        // 正向连线：源节点在目标节点上方
        const result = this.getBezierControlPoints({
          start: startPoint,
          end: endPoint,
          sourceNode: {
            x: newSourceNodeData.x,
            y: newSourceNodeData.y,
            width: sourceNodeModel.width,
            height: sourceNodeModel.height,
          },
          targetNode: {
            x: newTargetNodeData.x,
            y: newTargetNodeData.y,
            width: targetNodeModel.width,
            height: targetNodeModel.height,
          },
          offset,
        })
        sNext = result.sNext
        ePre = result.ePre
      }
      if (newSourceNodeData.y > newTargetNodeData.y) {
        // 反向连线：源节点在目标节点下方
        if (newSourceNodeData.x >= newTargetNodeData.x) {
          // 源节点在目标节点右下方
          sNext = {
            x:
              newSourceNodeData.x +
              sourceNodeModel.width / 2 +
              offset +
              targetNodeModel.width / 2,
            y:
              newSourceNodeData.y +
              sourceNodeModel.height +
              targetNodeModel.height,
          }
          ePre = {
            x:
              newTargetNodeData.x +
              targetNodeModel.width / 2 +
              offset +
              sourceNodeModel.width / 2,
            y:
              newTargetNodeData.y -
              sourceNodeModel.height -
              targetNodeModel.height,
          }
        } else {
          // 源节点在目标节点左下方
          sNext = {
            x:
              newSourceNodeData.x -
              sourceNodeModel.width / 2 -
              offset -
              targetNodeModel.width / 2,
            y:
              newSourceNodeData.y +
              sourceNodeModel.height +
              targetNodeModel.height,
          }
          ePre = {
            x:
              newTargetNodeData.x -
              targetNodeModel.width / 2 -
              offset -
              sourceNodeModel.width / 2,
            y:
              newTargetNodeData.y -
              sourceNodeModel.height -
              targetNodeModel.height,
          }
        }
      }
      pointsList.push(startPoint, sNext, ePre, endPoint)
      return pointsList
    }

    // 无法确定路径时返回undefined，让LogicFlow自行处理
    return undefined
  }

  // bezier曲线
  getBezierControlPoints = ({
    start,
    end,
    sourceNode,
    targetNode,
    offset,
  }: {
    start: Point
    end: Point
    sourceNode: BaseNodeData
    targetNode: BaseNodeData
    offset: number
  }): IBezierControls => {
    const sBBox = this.getNodeBBox(sourceNode)
    const tBBox = this.getNodeBBox(targetNode)
    const sExpendBBox = this.getExpandedBBox(sBBox, offset)
    const tExpendBBox = this.getExpandedBBox(tBBox, offset)
    const sNext = this.getExpandedBBoxPoint(sExpendBBox, sBBox, start)
    const ePre = this.getExpandedBBoxPoint(tExpendBBox, tBBox, end)
    return {
      sNext,
      ePre,
    }
  }

  /* 获取节点bbox */
  getNodeBBox = (node: BaseNodeData): NodeBBox => {
    const { x, y, width, height } = node
    return {
      minX: x - width / 2,
      minY: y - height / 2,
      maxX: x + width / 2,
      maxY: y + height / 2,
      x,
      y,
      width,
      height,
      centerX: x,
      centerY: y,
    }
  }

  /* 扩展的bbox,保证起始点的下一个点一定在node的垂直方向，不会与线重合, offset是点与线的垂直距离 */
  getExpandedBBox = (bbox: BoxBounds, offset: number): BoxBounds => {
    if (bbox.width === 0 && bbox.height === 0) {
      return bbox
    }
    return {
      x: bbox.x,
      y: bbox.y,
      centerX: bbox.centerX,
      centerY: bbox.centerY,
      minX: bbox.minX - offset,
      minY: bbox.minY - offset,
      maxX: bbox.maxX + offset,
      maxY: bbox.maxY + offset,
      height: bbox.height + 2 * offset,
      width: bbox.width + 2 * offset,
    }
  }

  /* 判断点与中心点边的方向：是否水平，true水平，false垂直 */
  pointDirection = (point: Point, bbox: BoxBounds): Direction => {
    const dx = Math.abs(point.x - bbox.centerX)
    const dy = Math.abs(point.y - bbox.centerY)
    return dx / bbox.width > dy / bbox.height
      ? SegmentDirection.HORIZONTAL
      : SegmentDirection.VERTICAL
  }

  /* 获取扩展图形上的点，即起始终点相邻的点，上一个或者下一个节点 */
  getExpandedBBoxPoint = (
    expendBBox: BoxBounds,
    bbox: BoxBounds,
    point: Point,
  ): Point => {
    // https://github.com/didi/LogicFlow/issues/817
    // 没有修复前传入的参数bbox实际是expendBBox
    // 由于pointDirection使用的是dx / bbox.width > dy / bbox.height判定方向
    // 此时的bbox.width是增加了offset后的宽度，bbox.height同理
    // 这导致了部分极端情况(宽度很大或者高度很小)，计算出来的方向错误
    const direction = this.pointDirection(point, bbox)
    if (direction === SegmentDirection.HORIZONTAL) {
      return {
        x: point.x > expendBBox.centerX ? expendBBox.maxX : expendBBox.minX,
        y: point.y,
      }
    }
    return {
      x: point.x,
      y: point.y > expendBBox.centerY ? expendBBox.maxY : expendBBox.minY,
    }
  }
}
