/**
 * 基于DynamicGroup重新实现的泳池节点组件
 * 充分利用DynamicGroup的分组管理能力，实现完整的泳道功能
 */
import LogicFlow, { GraphModel, h, observable } from '@logicflow/core'
import { forEach } from 'lodash-es'
import {
  DynamicGroupNodeModel,
  DynamicGroupNode,
  IGroupNodeProperties,
} from '@logicflow/extension'

// import { LaneModel } from './NewLane'

import NodeConfig = LogicFlow.NodeConfig

// 泳池配置常量
const POOL_CONFIG = {
  // 默认尺寸
  defaultWidth: 600,
  defaultHeight: 300,
  // 标题区域
  titleSize: 30,
  // 泳道配置
  laneWidth: 60,
  laneHeight: 120,
  laneMinHeight: 72,
  // 文本偏移
  textOffset: 15,
  textWidth: 16,
  direction: 'horizontal',
} as const

type direction = 'horizontal' | 'vertical'

export class PoolModel extends DynamicGroupNodeModel {
  // 泳池特定属性
  // 默认子泳道宽高
  defaultLaneWidth: number = POOL_CONFIG.laneWidth
  defaultLaneHeight: number = POOL_CONFIG.laneHeight
  // 标题区域大小：如果是垂直方向，指代的就是标题区的宽度，如果是水平方向，指代的就是标题区的高度
  titleSize: number = POOL_CONFIG.titleSize

  // 布局方向
  @observable direction: direction = 'horizontal'
  @observable isHorizontal: boolean = true

  // 标记是否已创建默认泳道
  _defaultLaneCreated: boolean = false

  constructor(data: NodeConfig<IGroupNodeProperties>, graphModel: GraphModel) {
    super(data, graphModel)
    if (!data.properties?.children?.length && !this._defaultLaneCreated) {
      // 如果初始化没有子泳道，且是初次创建默认泳道，就创建默认泳道（确保只调用一次）
      this._createDefaultLane()
      this._defaultLaneCreated = true
    }
  }

  initNodeData(data: LogicFlow.NodeConfig<IGroupNodeProperties>) {
    super.initNodeData(data)
    // 泳池基础配置
    this.width = data.properties?.width || POOL_CONFIG.defaultWidth
    this.height = data.properties?.height || POOL_CONFIG.defaultHeight
    // this.zIndex = data.zIndex || -1 // 设置泳池基础层级为1，确保泳池在最底层
    this.direction =
      (data.properties?.direction as direction) || POOL_CONFIG.direction

    this.isHorizontal = this.direction === 'horizontal'

    // 子泳道
    this.defaultLaneWidth = data.properties?.width || POOL_CONFIG.laneHeight
    this.defaultLaneHeight = data.properties?.height || POOL_CONFIG.laneWidth

    // 动态分组配置
    this.collapsible = false
    this.autoResize = true
    this.isRestrict = true
    this.transformWithContainer = true
    this.resizable = true

    // 允许文本编辑
    this.text.editable = true
    this.text.value = this.text.value || '泳池示例'

    // 初始化文本位置
    this._initializeTextPosition()
    this.addEventListeners()
  }

  // 增加监听事件
  addEventListeners() {
    this.graphModel.eventCenter.on('node:resize', ({ data }) => {
      // 如果resize的是泳池本身
      if (data.id === this.id) {
        // 遍历子泳道，按照泳池的新尺寸让子泳道平均填充
        const lanes = this.getLaneChildren()
        if (lanes.length === 0) return

        // 计算每个泳道的新宽度或高度
        const newLaneWidth = this.isHorizontal
          ? this.width - POOL_CONFIG.titleSize
          : this.width / lanes.length
        const newLaneHeight = this.isHorizontal
          ? this.height / lanes.length
          : this.height - POOL_CONFIG.titleSize

        // 计算泳道的起始位置
        const startX = this.isHorizontal
          ? this.x - this.width / 2 + POOL_CONFIG.titleSize
          : this.x - this.width / 2
        const startY = this.isHorizontal
          ? this.y - this.height / 2
          : this.y - this.height / 2 + POOL_CONFIG.titleSize

        // 遍历所有泳道进行位置和尺寸调整
        lanes.forEach((lane, index) => {
          lane.width = newLaneWidth
          lane.height = newLaneHeight

          if (this.isHorizontal) {
            // 横向布局：泳道垂直排列，x坐标固定，y坐标根据索引变化
            lane.x = startX + newLaneWidth / 2
            lane.y = startY + newLaneHeight * index + newLaneHeight / 2
          } else {
            // 纵向布局：泳道水平排列，y坐标固定，x坐标根据索引变化
            lane.x = startX + newLaneWidth * index + newLaneWidth / 2
            lane.y = startY + newLaneHeight / 2
          }
        })
      }
      // 如果resize的是子泳道
      if (this.children.has(data.id)) {
        // 检查是否为泳道节点的尺寸变化
        const resizedNode = this.graphModel.getNodeModelById(data.id)
        if (!resizedNode || !resizedNode.type || resizedNode.type !== 'lane') {
          return
        }

        // 获取所有子泳道
        const lanes = this.getLaneChildren()
        if (lanes.length === 0) return

        // 更新泳池宽高
        let newWidth: number
        let newHeight: number
        if (this.isHorizontal) {
          // 横向布局：
          // 泳池宽度 = 最大泳道宽度 + 标题区域
          // 泳池高度 = 所有泳道高度之和
          const maxLaneWidth = Math.max(...lanes.map((lane) => lane.width))
          const totalLaneHeight = lanes.reduce(
            (sum, lane) => sum + lane.height,
            0,
          )
          newWidth = maxLaneWidth + POOL_CONFIG.titleSize
          newHeight = totalLaneHeight
        } else {
          // 竖向布局：
          // 泳池高度 = 最大泳道高度 + 标题区域
          // 泳池宽度 = 所有泳道宽度之和
          const maxLaneHeight = Math.max(...lanes.map((lane) => lane.height))
          const totalLaneWidth = lanes.reduce(
            (sum, lane) => sum + lane.width,
            0,
          )
          newWidth = totalLaneWidth
          newHeight = maxLaneHeight + POOL_CONFIG.titleSize
        }
        this.width = newWidth
        this.height = newHeight
      }
      // 更新泳池文本位置
      this._initializeTextPosition()
      // 重新布局泳道以适应新的泳池尺寸
      this.resizeChildren()
    })
  }

  /**
   * 获取需要移动的节点
   * @param groupModel
   */
  getNodesInGroup(groupModel: DynamicGroupNodeModel): string[] {
    const nodeIds: string[] = []
    if (groupModel.isGroup) {
      forEach(Array.from(groupModel.children), (nodeId: string) => {
        const nodeModel = this.graphModel.getNodeModelById(nodeId)
        // 拖拽泳道时会触发泳池的getNodesInGroup，这时泳池再触发移动的子泳道里就需要剔除当前正在拖拽的泳道
        if (nodeModel && !nodeModel.isDragging) {
          nodeIds.push(nodeId)
        }
      })
    }
    return nodeIds
  }
  /**
   * 初始化文本位置 - 根据布局方向设置文本位置
   */
  private _initializeTextPosition() {
    if (this.isHorizontal) {
      // 横向泳池：文本显示在左侧标题区域
      this.text.x = this.x - this.width / 2 + POOL_CONFIG.textOffset
      this.text.y = this.y
    } else {
      // 纵向泳池：文本显示在顶部标题区域
      this.text.x = this.x
      this.text.y = this.y - this.height / 2 + POOL_CONFIG.textOffset
    }
  }

  /**
   * 折叠/展开泳池 - 重写DynamicGroup的折叠逻辑
   */
  toggleCollapse(collapse?: boolean) {
    const isFolded = collapse ?? !this.isCollapsed

    if (isFolded) {
      // 折叠操作
      this.unfoldedWidth = this.width
      this.unfoldedHeight = this.height

      // 调整位置到中心
      this.x = this.x - this.width / 2 + this.collapsedWidth / 2
      this.y = this.y - this.height / 2 + this.collapsedHeight / 2

      // 调整文本位置 - 根据布局方向处理
      if (this.isHorizontal) {
        // 横向泳池：文本在左侧
        this.text.x = this.x - this.collapsedWidth / 2 + POOL_CONFIG.textOffset
        this.text.y = this.y
      } else {
        // 纵向泳池：文本在顶部
        this.text.x = this.x
        this.text.y = this.y - this.collapsedHeight / 2 + POOL_CONFIG.textOffset
      }

      this.width = this.collapsedWidth
      this.height = this.collapsedHeight
    } else {
      // 展开操作
      this.width = this.unfoldedWidth
      this.height = this.unfoldedHeight

      // 恢复位置
      this.x = this.x + this.width / 2 - this.collapsedWidth / 2
      this.y = this.y + this.height / 2 - this.collapsedHeight / 2

      // 恢复文本位置 - 根据布局方向处理
      this._initializeTextPosition()
    }

    // 设置折叠状态
    this.isCollapsed = isFolded
    this.setProperties({ isCollapsed: isFolded })

    // 处理子节点可见性和边
    this._handleChildrenVisibility(isFolded)
  }

  /**
   * 处理子节点可见性
   */
  private _handleChildrenVisibility(isFolded: boolean) {
    const allRelatedEdges = [...this.incoming.edges, ...this.outgoing.edges]

    // 处理所有子节点
    Array.from(this.children).forEach((childId) => {
      const childModel = this.graphModel.getNodeModelById(childId)
      if (childModel) {
        childModel.visible = !isFolded

        // 收集相关边
        if (childModel.BaseType === 'node') {
          allRelatedEdges.push(
            ...childModel.incoming.edges,
            ...childModel.outgoing.edges,
          )
        }
      }
    })

    // 处理边折叠
    this.collapseEdge(isFolded, allRelatedEdges)
  }

  /**
   * 根据子泳道自动调整泳池尺寸
   */
  resizePool() {
    const lanes = this.getLaneChildren()
    if (lanes.length === 0) return

    if (this.isHorizontal) {
      // 横向布局：计算所有泳道的边界
      let minX = Infinity,
        maxX = -Infinity,
        minY = Infinity,
        maxY = -Infinity

      lanes.forEach((lane) => {
        const laneWidth = lane.width
        const laneHeight = lane.height

        const laneMinX = lane.x - laneWidth / 2
        const laneMaxX = lane.x + laneWidth / 2
        const laneMinY = lane.y - laneHeight / 2
        const laneMaxY = lane.y + laneHeight / 2

        minX = Math.min(minX, laneMinX)
        maxX = Math.max(maxX, laneMaxX)
        minY = Math.min(minY, laneMinY)
        maxY = Math.max(maxY, laneMaxY)
      })

      // 计算新尺寸（横向布局：宽度包含标题区域）
      const contentWidth = maxX - minX
      const newWidth = contentWidth + POOL_CONFIG.titleSize
      const newHeight = maxY - minY

      // 调整泳池位置（考虑标题区域偏移）
      this.x = minX + contentWidth / 2 + POOL_CONFIG.titleSize / 2
      this.y = minY + (maxY - minY) / 2

      this.width = newWidth
      this.height = newHeight
      this.unfoldedWidth = newWidth
      this.unfoldedHeight = newHeight
    } else {
      // 纵向布局：计算所有泳道的边界
      let minX = Infinity,
        maxX = -Infinity,
        minY = Infinity,
        maxY = -Infinity

      lanes.forEach((lane) => {
        const laneWidth = lane.width
        const laneHeight = lane.height

        const laneMinX = lane.x - laneWidth / 2
        const laneMaxX = lane.x + laneWidth / 2
        const laneMinY = lane.y - laneHeight / 2
        const laneMaxY = lane.y + laneHeight / 2

        minX = Math.min(minX, laneMinX)
        maxX = Math.max(maxX, laneMaxX)
        minY = Math.min(minY, laneMinY)
        maxY = Math.max(maxY, laneMaxY)
      })

      // 计算新尺寸（纵向布局：高度包含标题区域）
      const newWidth = maxX - minX
      const contentHeight = maxY - minY
      const newHeight = contentHeight + POOL_CONFIG.titleSize

      // 调整泳池位置（考虑标题区域偏移）
      this.x = minX + (maxX - minX) / 2
      this.y = minY + contentHeight / 2 + POOL_CONFIG.titleSize / 2

      this.width = Math.max(newWidth, 120) // 确保最小宽度
      this.height = Math.max(newHeight, POOL_CONFIG.laneMinHeight) // 确保最小高度
      this.unfoldedWidth = this.width
      this.unfoldedHeight = this.height
    }

    // 更新文本位置
    this._initializeTextPosition()
  }

  /**
   * 根据泳道缩放比例同步调整泳池尺寸
   * @param scaleX 水平缩放比例
   * @param scaleY 垂直缩放比例
   * @param resizingLaneId 正在缩放的泳道ID
   * @param direction 缩放方向
   */
  syncScaleWithLane(
    resizingLaneId: string,
    scaleX: number,
    scaleY: number,
    direction?: string,
  ) {
    const lanes = this.getLaneChildren()
    if (lanes.length === 0) return

    // 找到正在缩放的泳道
    const resizingLane = lanes.find((lane) => lane.id === resizingLaneId)
    if (!resizingLane) return

    // 保存所有泳道的原始位置和尺寸
    const originalLanePositions = lanes.map((lane) => ({
      id: lane.id,
      x: lane.x,
      y: lane.y,
      width: lane.width,
      height: lane.height,
    }))

    // 根据布局方向和缩放方向调整泳池尺寸
    if (this.isHorizontal) {
      // 横向布局：调整泳池高度
      if (Math.abs(scaleY - 1) > 0.001) {
        // 计算所有泳道的高度总和，考虑正在缩放的泳道的新高度
        const newHeight = Math.max(
          lanes.reduce((sum, lane) => {
            // 如果是正在缩放的泳道，使用缩放后的高度
            if (lane.id === resizingLaneId) {
              return sum + Math.max(lane.height, POOL_CONFIG.laneMinHeight)
            }
            return sum + lane.height
          }, 0),
          POOL_CONFIG.laneMinHeight,
        )

        // 更新泳池高度
        this.height = newHeight
        this.unfoldedHeight = this.height
      }
    } else {
      // 纵向布局：调整泳池宽度
      if (Math.abs(scaleX - 1) > 0.001) {
        // 计算所有泳道的宽度总和，考虑正在缩放的泳道的新宽度
        const newWidth = Math.max(
          lanes.reduce((sum, lane) => {
            // 如果是正在缩放的泳道，使用缩放后的宽度
            if (lane.id === resizingLaneId) {
              return sum + Math.max(lane.width, 120)
            }
            return sum + lane.width
          }, 0),
          120,
        )

        // 更新泳池宽度
        this.width = newWidth
        this.unfoldedWidth = this.width
      }
    }

    // 重新布局所有泳道
    this.resizeChildrenWithScale(
      scaleX,
      scaleY,
      this.isHorizontal,
      resizingLaneId,
      direction,
      originalLanePositions,
    )
  }

  /**
   * 重新调整所有泳道布局（带缩放支持）
   * @param scaleX 水平缩放比例
   * @param scaleY 垂直缩放比例
   * @param isHorizontal 是否为横向布局
   * @param resizingLaneId 正在缩放的泳道ID
   * @param direction 缩放方向
   * @param originalPositions 原始泳道位置信息
   */
  resizeChildrenWithScale(
    scaleX: number,
    scaleY: number,
    isHorizontal: boolean,
    resizingLaneId?: string,
    direction?: string,
    originalPositions?: Array<{
      id: string
      x: number
      y: number
      width: number
      height: number
    }>,
  ) {
    const lanes = this.getLaneChildren()
    if (lanes.length === 0) return

    // 是否保持其他泳道位置不变
    const keepOriginalPositions = !!resizingLaneId && !!originalPositions

    if (isHorizontal) {
      // 横向布局：泳道垂直排列
      const sortedLanes = lanes.sort(
        (preLane: any, nextLane: any) => preLane.y - nextLane.y,
      )

      // 统一泳道宽度
      const laneWidth = this.width - POOL_CONFIG.titleSize

      // 计算总的泳道高度
      let totalLaneHeight = 0

      if (keepOriginalPositions) {
        // 在 resizeChildrenWithScale 方法中，修改以下部分：
        if (keepOriginalPositions) {
          // 保持原始位置模式：只调整正在缩放的泳道
          sortedLanes.forEach((lane: any) => {
            // 确保不低于最小高度/宽度
            lane.height = Math.max(lane.height, POOL_CONFIG.laneMinHeight)
            lane.width = Math.max(lane.width, 120)

            // 如果不是正在缩放的泳道，恢复原始位置和尺寸
            if (lane.id !== resizingLaneId && originalPositions) {
              const originalPos = originalPositions.find(
                (pos) => pos.id === lane.id,
              )
              if (originalPos) {
                lane.x = originalPos.x
                lane.y = originalPos.y
                lane.width = originalPos.width
                lane.height = originalPos.height
              }
            }

            // 更新泳道模型
            this.graphModel.updateNodeModel(lane.id, {
              x: lane.x,
              y: lane.y,
              width: lane.width,
              height: lane.height,
            })
          })
        }
      } else {
        // 标准模式：重新计算所有泳道位置
        totalLaneHeight = sortedLanes.reduce((sum: number, lane: any) => {
          return sum + Math.max(lane.height, POOL_CONFIG.laneMinHeight)
        }, 0)

        // 如果只有一个泳道，让它居中；多个泳道时均匀分布
        let currentY: number
        if (sortedLanes.length === 1) {
          // 单个泳道居中
          currentY = this.y
        } else {
          // 多个泳道从内容区域顶部开始分布
          currentY = this.y - totalLaneHeight / 2 + sortedLanes[0].height / 2
        }

        sortedLanes.forEach((lane: any, index: number) => {
          // 确保不低于最小高度
          lane.height = Math.max(lane.height, POOL_CONFIG.laneMinHeight)

          // 设置泳道位置和尺寸
          lane.moveTo(
            this.x - this.width / 2 + POOL_CONFIG.titleSize + laneWidth / 2,
            sortedLanes.length === 1 ? currentY : currentY,
            true,
          )
          lane.width = laneWidth

          // 更新泳道文本位置
          lane.text = {
            ...lane.text,
            x: lane.x - laneWidth / 2 + 11,
            y: lane.y,
          }

          // 为下一个泳道计算Y坐标
          if (index < sortedLanes.length - 1) {
            currentY += lane.height
          }
        })
      }

      // 更新泳池高度
      this.height = Math.max(totalLaneHeight, POOL_CONFIG.laneMinHeight)
      this.unfoldedHeight = this.height
    } else {
      // 纵向布局：泳道水平排列
      const sortedLanes = lanes.sort(
        (preLane: any, nextLane: any) => preLane.x - nextLane.x,
      )

      // 统一泳道高度
      const laneHeight = this.height - POOL_CONFIG.titleSize

      // 计算总的泳道宽度
      let totalLaneWidth = 0

      if (keepOriginalPositions) {
        // 保持原始位置模式：只调整正在缩放的泳道
        sortedLanes.forEach((lane: any) => {
          // 确保不低于最小宽度
          lane.width = Math.max(lane.width, 120)

          // 如果不是正在缩放的泳道，恢复原始位置和尺寸
          if (lane.id !== resizingLaneId && originalPositions) {
            const originalPos = originalPositions.find(
              (pos) => pos.id === lane.id,
            )
            if (originalPos) {
              lane.x = originalPos.x
              lane.y = originalPos.y
              lane.width = originalPos.width
              lane.height = originalPos.height
            }
          }

          // 统一泳道高度
          lane.height = laneHeight

          // 更新泳道文本位置
          lane.text = {
            ...lane.text,
            x: lane.x - lane.width / 2 + 11,
            y: lane.y,
          }

          totalLaneWidth += lane.width
        })
      } else {
        // 标准模式：重新计算所有泳道位置
        totalLaneWidth = sortedLanes.reduce((sum: number, lane: any) => {
          return sum + Math.max(lane.width, 120)
        }, 0)

        // 修复：计算起始位置
        let currentX: number
        if (sortedLanes.length === 1) {
          // 单个泳道居中
          currentX = this.x

          const lane = sortedLanes[0]
          lane.width = Math.max(lane.width, 120)

          // 设置泳道位置和尺寸 - 水平居中
          lane.moveTo(
            currentX,
            this.y - this.height / 2 + POOL_CONFIG.titleSize + laneHeight / 2,
            true,
          )
          lane.height = laneHeight

          // 更新泳道文本位置
          lane.text = {
            ...lane.text,
            x: lane.x - lane.width / 2 + 11,
            y: lane.y,
          }
        } else {
          // 多个泳道时，从左边界开始排列
          currentX = this.x - totalLaneWidth / 2 + sortedLanes[0].width / 2

          sortedLanes.forEach((lane: any, index: number) => {
            // 确保不低于最小宽度
            lane.width = Math.max(lane.width, 120)

            // 设置泳道位置和尺寸
            lane.moveTo(
              currentX,
              this.y - this.height / 2 + POOL_CONFIG.titleSize + laneHeight / 2,
              true,
            )
            lane.height = laneHeight

            // 更新泳道文本位置
            lane.text = {
              ...lane.text,
              x: lane.x - lane.width / 2 + 11,
              y: lane.y,
            }

            // 为下一个泳道计算X坐标
            if (index < sortedLanes.length - 1) {
              currentX += lane.width
            }
          })
        }
      }

      // 更新泳池宽度
      this.width = Math.max(totalLaneWidth, 120)
      this.unfoldedWidth = this.width
    }

    // 更新文本位置
    this._initializeTextPosition()
  }

  /**
   * 重新调整所有泳道布局
   * @param addPosition 添加位置（可选）：'above'|'below'|'left'|'right'
   * @param newLaneId 新添加的泳道ID（可选）
   */
  resizeChildren(
    addPosition?: 'above' | 'below' | 'left' | 'right' | 'between',
    newLaneId?: string,
  ) {
    const lanes = this.getLaneChildren()
    if (lanes.length === 0) return

    // 如果是新添加泳道的情况，保持泳道的相对位置
    const isAddingNewLane = addPosition && newLaneId

    if (this.isHorizontal) {
      // 横向布局：泳道垂直排列
      let orderedLanes = lanes

      // 只在非添加新泳道时或没有指定位置时才进行排序
      if (!isAddingNewLane) {
        orderedLanes = lanes.sort(
          (preLane: any, nextLane: any) => preLane.y - nextLane.y,
        )
      } else {
        // 添加新泳道时，根据添加位置调整顺序
        const newLane = lanes.find((lane) => lane.id === newLaneId)
        if (newLane) {
          if (addPosition === 'above') {
            orderedLanes = [
              newLane,
              ...lanes.filter((lane) => lane.id !== newLaneId),
            ]
          } else if (addPosition === 'below') {
            orderedLanes = [
              ...lanes.filter((lane) => lane.id !== newLaneId),
              newLane,
            ]
          } else if (addPosition === 'between') {
            const others = lanes
              .filter((lane) => lane.id !== newLaneId)
              .sort((a: any, b: any) => a.y - b.y)
            const refId = (newLane as any).properties?.referenceLaneId
            const refIndex = refId
              ? others.findIndex((l: any) => l.id === refId)
              : Math.floor(others.length / 2)
            const insertIndex =
              refIndex >= 0 ? Math.min(refIndex + 1, others.length) : 0
            others.splice(insertIndex, 0, newLane)
            orderedLanes = others
          }
        }
      }

      // 统一泳道宽度
      const laneWidth = this.width - POOL_CONFIG.titleSize

      // 计算泳道在内容区域内的分布
      const totalLaneHeight = orderedLanes.reduce((sum: number, lane: any) => {
        return sum + Math.max(lane.height, POOL_CONFIG.laneMinHeight)
      }, 0)

      // 如果只有一个泳道，让它居中；多个泳道时均匀分布
      let currentY: number
      if (orderedLanes.length === 1) {
        // 单个泳道居中
        currentY = this.y
      } else {
        // 多个泳道从内容区域顶部开始分布
        currentY = this.y - totalLaneHeight / 2 + orderedLanes[0].height / 2
      }

      orderedLanes.forEach((lane: any, index: number) => {
        // 确保不低于最小高度
        lane.height = Math.max(lane.height, POOL_CONFIG.laneMinHeight)

        // 设置泳道位置和尺寸
        lane.moveTo(
          this.x - this.width / 2 + POOL_CONFIG.titleSize + laneWidth / 2,
          orderedLanes.length === 1 ? currentY : currentY,
          true,
        )
        lane.width = laneWidth

        // 更新泳道文本位置
        lane.text = {
          ...lane.text,
          x: lane.x - laneWidth / 2 + 11,
          y: lane.y,
        }

        // 为下一个泳道计算Y坐标
        if (index < orderedLanes.length - 1) {
          currentY += lane.height
        }
      })

      // 更新泳池高度
      const totalHeight = totalLaneHeight
      this.height = totalHeight
      this.unfoldedHeight = totalHeight
    } else {
      // 纵向布局：泳道水平排列
      let orderedLanes = lanes

      // 只在非添加新泳道时或没有指定位置时才进行排序
      if (!isAddingNewLane) {
        orderedLanes = lanes.sort(
          (preLane: any, nextLane: any) => preLane.x - nextLane.x,
        )
      } else {
        // 添加新泳道时，根据添加位置调整顺序
        const newLane = lanes.find((lane) => lane.id === newLaneId)
        if (newLane) {
          if (addPosition === 'left') {
            orderedLanes = [
              newLane,
              ...lanes.filter((lane) => lane.id !== newLaneId),
            ]
          } else if (addPosition === 'right') {
            orderedLanes = [
              ...lanes.filter((lane) => lane.id !== newLaneId),
              newLane,
            ]
          } else if (addPosition === 'between') {
            const others = lanes
              .filter((lane) => lane.id !== newLaneId)
              .sort((a: any, b: any) => a.x - b.x)
            const refId = (newLane as any).properties?.referenceLaneId
            const refIndex = refId
              ? others.findIndex((l: any) => l.id === refId)
              : Math.floor(others.length / 2)
            const insertIndex =
              refIndex >= 0 ? Math.min(refIndex + 1, others.length) : 0
            others.splice(insertIndex, 0, newLane)
            orderedLanes = others
          }
        }
      }

      // 统一泳道高度
      const laneHeight = this.height - POOL_CONFIG.titleSize

      // 计算总宽度
      const totalLaneWidth = orderedLanes.reduce((sum: number, lane: any) => {
        return sum + Math.max(lane.width, 120)
      }, 0)

      // 修复：计算起始位置
      let currentX: number
      if (orderedLanes.length === 1) {
        // 单个泳道居中
        currentX = this.x

        const lane = orderedLanes[0]
        lane.width = Math.max(lane.width, 120)

        // 设置泳道位置和尺寸 - 水平居中
        lane.moveTo(
          currentX,
          this.y - this.height / 2 + POOL_CONFIG.titleSize + laneHeight / 2,
          true,
        )
        lane.height = laneHeight

        // 更新泳道文本位置
        lane.text = {
          ...lane.text,
          x: lane.x - lane.width / 2 + 11,
          y: lane.y,
        }
      } else {
        // 多个泳道时，从左边界开始排列
        currentX = this.x - totalLaneWidth / 2 + orderedLanes[0].width / 2

        orderedLanes.forEach((lane: any, index: number) => {
          // 确保不低于最小宽度
          lane.width = Math.max(lane.width, 120)

          // 设置泳道位置和尺寸
          lane.moveTo(
            currentX,
            this.y - this.height / 2 + POOL_CONFIG.titleSize + laneHeight / 2,
            true,
          )
          lane.height = laneHeight

          // 更新泳道文本位置
          lane.text = {
            ...lane.text,
            x: lane.x - lane.width / 2 + 11,
            y: lane.y,
          }

          // 为下一个泳道计算X坐标
          if (index < orderedLanes.length - 1) {
            currentX += lane.width
          }
        })
      }

      // 更新泳池宽度
      this.width = totalLaneWidth
      this.unfoldedWidth = totalLaneWidth
    }

    // 更新文本位置
    this._initializeTextPosition()
  }

  /**
   * 获取泳道子节点
   */
  getLaneChildren() {
    const children: any[] = []
    Array.from(this.children).forEach((childId) => {
      const childModel = this.graphModel.getNodeModelById(childId)
      if (childModel && String(childModel.type) === 'lane') {
        children.push(childModel)
      }
    })
    return children
  }

  /**
   * 添加泳道的公共方法
   * @param position 添加位置：'above'|'below'|'left'|'right'
   * @param laneData 泳道数据
   */
  _addLane(
    position: 'above' | 'below' | 'left' | 'right' | 'between',
    laneData?: any,
  ) {
    const lanes = this.getLaneChildren()
    if (lanes.length === 0) {
      return this._addFirstLane(laneData)
    }

    // 创建新泳道（临时位置，resizeChildren会重新计算）
    const laneWidth = this.isHorizontal
      ? this.width - POOL_CONFIG.titleSize
      : this.defaultLaneWidth
    const laneHeight = this.isHorizontal
      ? this.defaultLaneHeight
      : this.height - POOL_CONFIG.titleSize

    // 计算初始位置
    let initialX = this.x
    let initialY = this.y

    // 参考泳道（用于定位）
    let referenceLane = lanes[0]

    if (this.isHorizontal && (position === 'above' || position === 'below')) {
      // 横向布局，添加上下泳道
      if (position === 'above') {
        // 找最上方的泳道
        referenceLane = lanes.reduce(
          (top, lane) => (lane.y < top.y ? lane : top),
          lanes[0],
        )
        initialY = referenceLane.y - referenceLane.height // 上方
      } else {
        // 找最下方的泳道
        referenceLane = lanes.reduce(
          (bottom, lane) => (lane.y > bottom.y ? lane : bottom),
          lanes[0],
        )
        initialY = referenceLane.y + referenceLane.height // 下方
      }
    } else if (
      !this.isHorizontal &&
      (position === 'left' || position === 'right')
    ) {
      // 纵向布局，添加左右泳道
      if (position === 'left') {
        // 找最左侧的泳道
        referenceLane = lanes.reduce(
          (left, lane) => (lane.x < left.x ? lane : left),
          lanes[0],
        )
        initialX = referenceLane.x - referenceLane.width // 左侧
      } else {
        // 找最右侧的泳道
        referenceLane = lanes.reduce(
          (right, lane) => (lane.x > right.x ? lane : right),
          lanes[0],
        )
        initialX = referenceLane.x + referenceLane.width // 右侧
      }
    } else if (position === 'between') {
      // 中间插入：若提供 referenceLaneId 则以其为参考，否则选中位
      const refId = laneData?.referenceLaneId
      if (refId) {
        referenceLane = lanes.find((l) => l.id === refId) || null
      }
      if (!referenceLane) {
        if (this.isHorizontal) {
          const ordered = lanes.slice().sort((a: any, b: any) => a.y - b.y)
          referenceLane = ordered[Math.floor(ordered.length / 2)]
        } else {
          const ordered = lanes.slice().sort((a: any, b: any) => a.x - b.x)
          referenceLane = ordered[Math.floor(ordered.length / 2)]
        }
      }
      if (referenceLane) {
        initialX = referenceLane.x
        initialY = referenceLane.y
      }
    }
    const newLane = this.graphModel.addNode({
      type: 'lane',
      x: initialX,
      y: initialY,
      width: laneWidth,
      height: laneHeight,
      text: { value: '新泳道' },
      properties: {
        parent: this.id,

        position: position, // 记录添加位置，供resizeChildren使用
        referenceLaneId: referenceLane?.id, // 记录参考泳道ID
      },
      zIndex: this.zIndex,
      ...laneData,
    })
    this.setZIndex(this.zIndex - 1)
    this.addChild(newLane.id)

    // 调用优化后的resizeChildren，它会处理所有位置计算和泳池尺寸调整
    this.resizeChildren(position, newLane.id)
    return newLane
  }

  /**
   * 在上方添加泳道
   */
  addChildAbove(laneData?: any) {
    return this._addLane('above', laneData)
  }

  /**
   * 在下方添加泳道
   */
  addChildBelow(laneData?: any) {
    return this._addLane('below', laneData)
  }

  /**
   * 在左侧添加泳道
   */
  addChildLeft(laneData?: any) {
    return this._addLane('left', laneData)
  }

  /**
   * 在右侧添加泳道（纵向布局专用）
   */
  addChildRight(laneData?: any) {
    return this._addLane('right', laneData)
  }
  /**
   * 在中间插入泳道
   */
  addChildBetween(laneData?: any) {
    return this._addLane('between', laneData)
  }

  /**
   * 创建默认泳道
   */
  private _createDefaultLane() {
    // 只在没有子节点时创建默认泳道
    console.log('_createDefaultLane', this.children.size)
    if (this.children.size === 0) {
      // 使用setTimeout延迟执行，确保泳池节点已经完全初始化完成
      setTimeout(() => {
        this._addFirstLane()
      }, 0)
    }
  }

  /**
   * 添加第一个泳道
   */
  private _addFirstLane(laneData?: any) {
    if (this.isHorizontal) {
      // 横向泳池：泳道垂直排列
      const laneWidth = this.width - POOL_CONFIG.titleSize
      const laneHeight = this.defaultLaneHeight
      // 修复：让泳道在泳池内容区域垂直居中
      const contentAreaCenterY = this.y
      const newLane = this.graphModel.addNode({
        type: 'lane',
        x: this.x - this.width / 2 + POOL_CONFIG.titleSize + laneWidth / 2,
        y: contentAreaCenterY,
        width: laneWidth,
        height: laneHeight,
        properties: {
          parent: this.id,
        },
        zIndex: this.zIndex,
        ...laneData,
      })

      this.addChild(newLane.id)
      this.resizeChildren()
      return newLane
    } else {
      // 纵向泳池：泳道水平排列
      // 修复：初始泳道在泳池中心位置，与resizeChildren逻辑保持一致
      const laneWidth = this.defaultLaneWidth
      const laneHeight = this.height - POOL_CONFIG.titleSize
      const newLane = this.graphModel.addNode({
        type: 'lane',
        x: this.x,
        y:
          this.y -
          this.height / 2 +
          POOL_CONFIG.titleSize +
          (this.height - POOL_CONFIG.titleSize) / 2,
        width: laneWidth,
        height: laneHeight,
        properties: {
          parent: this.id,
        },
        zIndex: this.zIndex,
        ...laneData,
      })
      this.setZIndex(this.zIndex - 1)
      this.addChild(newLane.id)
      this.resizeChildren()
      return newLane
    }
  }

  /**
   * 删除泳道
   */
  deleteChild(childId: string) {
    const lanes = this.getLaneChildren()
    if (lanes.length <= 1) return

    const laneToDelete = lanes.find((lane) => lane.id === childId)
    if (!laneToDelete) return

    // 移除子节点
    this.removeChild(childId)
    this.graphModel.deleteNode(childId)

    // 重新调整泳池
    this.resizePool()
    this.resizeChildren()
  }

  getNodeStyle() {
    const style = super.getNodeStyle()
    style.strokeWidth = 2
    return style
  }

  /**
   * 获取文本样式
   */
  getTextStyle() {
    const style = super.getTextStyle()
    style.overflowMode = 'autoWrap'
    style.strokeWidth = 2
    style.textWidth = this.isHorizontal ? 16 : this.width
    return style
  }
}

export class PoolView extends DynamicGroupNode {
  componentDidMount(): void {
    const { graphModel, model } = this.props
    const index = graphModel.nodes.findIndex((node) => node.id === model.id)
    const poolCount = graphModel.nodes.filter(
      (node) => String(node.type) === 'pool',
    ).length
    console.log('index', model, index)
    // 设置一个足够低的z-index，确保泳池在所有节点的最底层
    model.setZIndex(-((poolCount - index) * 100))
  }
  // componentDidUpdate(): void {
  //   const { model } = this.props
  //   const lanes = model.getLaneChildren()
  //   lanes.forEach((lane: LaneModel) => {
  //     lane.setZIndex(model.zIndex)
  //   })
  // }
  /**
   * 将泳池及其所有子泳道置顶
   * 实现选中泳池时，自动将泳池和所有泳道置顶的功能
   */
  // toFront() {
  //   const { model, graphModel } = this.props
  //   try {
  //     // 先将泳池置顶
  //     graphModel.toFront(model.id)

  //     // 获取所有泳道
  //     const lanes = model.getLaneChildren()

  //     // 将所有泳道置顶，确保泳道始终在泳池之上
  //     lanes.forEach((lane: LaneModel) => {
  //       // 确保泳道的zIndex比泳池高
  //       const laneZIndex = Math.max(model.zIndex, lane.zIndex)
  //       lane.zIndex = laneZIndex

  //       // 同步选中泳道
  //       // graphModel.selectElementById(lane.id, true)
  //     })
  //   } catch (error) {
  //     console.error('Error in pool bringToFront:', error)
  //     // 出错时至少确保当前泳池置顶
  //     graphModel.toFront(model.id)
  //   }
  // }

  /**
   * 渲染泳池形状 - 根据布局方向分为标题区域和内容区域
   */
  getShape() {
    const { model } = this.props
    const {
      x,
      y,
      width,
      height,
      isHorizontal,
      properties: { textStyle: customTextStyle = {}, style: customStyle = {} },
    } = model
    const style = model.getNodeStyle()
    const titleStyle = model.getTextStyle()
    const base = { fill: '#ffffff', stroke: '#000000', strokeWidth: 1 }
    const left = x - width / 2
    const top = y - height / 2
    if (isHorizontal) {
      const titleRect = {
        ...base,
        ...titleStyle,
        x: left,
        y: top,
        width: POOL_CONFIG.titleSize,
        height,
        ...customTextStyle,
      }
      const contentRect = {
        ...base,
        ...style,
        x: left + POOL_CONFIG.titleSize,
        y: top,
        width: width - POOL_CONFIG.titleSize,
        height,
        ...customStyle,
      }
      return h('g', {}, [h('rect', titleRect), h('rect', contentRect)])
    }
    const titleRect = {
      ...base,
      ...style,
      x: left,
      y: top,
      width,
      height: POOL_CONFIG.titleSize,
    }
    const contentRect = {
      ...base,
      ...style,
      x: left,
      y: top + POOL_CONFIG.titleSize,
      width,
      height: height - POOL_CONFIG.titleSize,
    }
    return h('g', {}, [h('rect', titleRect), h('rect', contentRect, [])])
  }

  /**
   * 获取调整控制点 - 只在展开状态下显示
   */
  getResizeControl() {
    const { resizable, isCollapsed } = this.props.model
    const showResizeControl = resizable && !isCollapsed
    return showResizeControl ? super.getResizeControl() : null
  }
}

export const PoolNode = {
  type: 'pool',
  view: PoolView,
  model: PoolModel,
}

export default PoolNode
