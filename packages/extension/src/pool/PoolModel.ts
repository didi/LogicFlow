/**
 * 基于DynamicGroup重新实现的泳池节点组件
 * 充分利用DynamicGroup的分组管理能力，实现完整的泳道功能
 */
import LogicFlow, { GraphModel } from '@logicflow/core'
import { computed } from 'mobx'
import { forEach, merge, cloneDeep } from 'lodash-es'
import {
  DynamicGroupNodeModel,
  IGroupNodeProperties,
} from '../dynamic-group/model'
import { poolConfig, laneConfig } from './constant'

// import { LaneModel } from './NewLane'

import NodeConfig = LogicFlow.NodeConfig

export class PoolModel extends DynamicGroupNodeModel {
  // 泳池特定属性
  // 标题区域大小：如果是垂直方向，指代的就是标题区的宽度，如果是水平方向，指代的就是标题区的高度
  titleSize: number = poolConfig.titleSize
  poolConfig: typeof poolConfig = poolConfig

  // 标记是否已创建默认泳道
  _defaultLaneCreated: boolean = false
  constructor(data: NodeConfig<IGroupNodeProperties>, graphModel: GraphModel) {
    super(data, graphModel)
    if (!data.properties?.children?.length && !this._defaultLaneCreated) {
      // 如果初始化没有子泳道，且是初次创建默认泳道，就创建默认泳道（确保只调用一次）
      setTimeout(() => {
        this.createDefaultLane(data.properties?.laneConfig)
        this._defaultLaneCreated = true
      }, 0)
    }
  }

  @computed get isHorizontal() {
    return this.properties?.direction === 'horizontal'
  }

  initNodeData(data: LogicFlow.NodeConfig<IGroupNodeProperties>) {
    super.initNodeData(data)
    if (data.properties) {
      // 泳池基础配置
      this.width = data.properties?.width || poolConfig.defaultWidth
      this.height = data.properties?.height || poolConfig.defaultHeight
    }

    // 动态分组配置
    this.autoResize = true
    this.isRestrict = false
    this.transformWithContainer = false
    this.resizable = false
    this.autoToFront = false

    // 允许文本编辑
    this.text.editable = true

    // 初始化文本位置
    this.updateTextPosition()
    this.addEventListeners()
  }

  // 增加监听事件
  addEventListeners() {
    this.graphModel.eventCenter.on('node:resize', ({ data, index }) => {
      // 如果resize的是泳池本身
      if (data.id === this.id) {
        // 遍历子泳道，按照泳池的新尺寸让子泳道平均填充
        const lanes = this.getLaneChildren()
        if (lanes.length === 0) return

        // 计算每个泳道的新宽度或高度
        // 泳池resize时泳道宽高均分变化
        const newLaneWidth = this.isHorizontal
          ? this.width - poolConfig.titleSize
          : this.width / lanes.length
        const newLaneHeight = this.isHorizontal
          ? this.height / lanes.length
          : this.height - poolConfig.titleSize

        // 计算泳道的起始位置
        const startX = this.isHorizontal
          ? this.x - this.width / 2 + poolConfig.titleSize
          : this.x - this.width / 2
        const startY = this.isHorizontal
          ? this.y - this.height / 2
          : this.y - this.height / 2 + poolConfig.titleSize

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

        // 更新泳池宽高
        let newWidth: number
        let newHeight: number
        let deltaX: number = 0
        let deltaY: number = 0
        if (this.isHorizontal) {
          // 横向布局：
          // 泳池宽度 = 最大泳道宽度 + 标题区域
          // 泳池高度 = 所有泳道高度之和
          const totalLaneHeight = lanes.reduce(
            (sum, lane) => sum + lane.height,
            0,
          )
          newWidth = resizedNode.width + poolConfig.titleSize
          newHeight = totalLaneHeight
        } else {
          // 竖向布局：
          // 泳池高度 = 最大泳道高度 + 标题区域
          // 泳池宽度 = 所有泳道宽度之和
          const totalLaneWidth = lanes.reduce(
            (sum, lane) => sum + lane.width,
            0,
          )
          newWidth = totalLaneWidth
          newHeight = resizedNode.height + poolConfig.titleSize
        }
        // 根据拖拽控制点方向计算位移方向
        // ResizeControlIndex: 0-左上, 1-右上, 2-右下, 3-左下
        const resizeIndex = typeof index === 'number' ? index : 2
        const isLeft = resizeIndex === 0 || resizeIndex === 3
        const isTop = resizeIndex === 0 || resizeIndex === 1
        const signX = isLeft ? -1 : 1
        const signY = isTop ? -1 : 1
        deltaX = signX * (newWidth - this.width)
        deltaY = signY * (newHeight - this.height)
        this.width = newWidth
        this.height = newHeight
        this.move(deltaX / 2, deltaY / 2)
      }
      // 重新布局泳道以适应新的泳池尺寸
      this.resizeChildren()
      // 更新泳池文本位置
      this.updateTextPosition()
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
  private updateTextPosition() {
    if (this.isHorizontal) {
      // 横向泳池：文本显示在左侧标题区域
      this.text.x = this.x - this.width / 2 + poolConfig.titleSize / 2
      this.text.y = this.y
    } else {
      // 纵向泳池：文本显示在顶部标题区域
      this.text.x = this.x
      this.text.y = this.y - this.height / 2 + poolConfig.titleSize / 2
    }
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
      const newWidth = contentWidth + poolConfig.titleSize
      const newHeight = maxY - minY

      // 调整泳池位置（考虑标题区域偏移）
      this.x = minX + contentWidth / 2 + poolConfig.titleSize / 2
      this.y = minY + (maxY - minY) / 2

      this.width = newWidth
      this.height = newHeight
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
      const newHeight = contentHeight + poolConfig.titleSize

      // 调整泳池位置（考虑标题区域偏移）
      this.x = minX + (maxX - minX) / 2
      this.y = minY + contentHeight / 2 + poolConfig.titleSize / 2

      this.width = Math.max(newWidth, poolConfig.poolMinSize) // 确保最小宽度
      this.height = Math.max(newHeight, poolConfig.poolMinSize) // 确保最小高度
    }

    // 更新文本位置
    this.updateTextPosition()
  }

  /**
   * 重新调整所有泳道布局
   * @param newLanePosition 添加位置（可选）：'above'|'below'|'left'|'right'
   * @param newLaneId 新添加的泳道ID（可选）
   */
  resizeChildrenWithNewLane(
    newLanePosition?: 'above' | 'below' | 'left' | 'right',
    newLaneId?: string,
  ) {
    const lanes = this.getLaneChildren()
    const isAddingNewLane = newLanePosition && newLaneId
    if (!isAddingNewLane || lanes.length === 0) return
    if (this.isHorizontal) {
      let orderedLanes = [] as any[]
      // 找到新创建的泳道
      const newLane = lanes.find((lane) => lane.id === newLaneId)
      if (newLane) {
        // 先找到触发新增泳道的泳道的index
        const others = lanes
          .filter((lane) => lane.id !== newLaneId)
          .slice()
          .sort((a: any, b: any) => a.y - b.y)
        const refId = (newLane as any).properties?.referenceLaneId
        const refIndex = refId
          ? others.findIndex((l: any) => l.id === refId)
          : 0
        const insertIndex =
          newLanePosition === 'above'
            ? Math.max(refIndex, 0)
            : Math.min(refIndex + 1, others.length)
        // 按顺序插入新泳道
        others.splice(insertIndex, 0, newLane)
        orderedLanes = others
      }
      // 统一泳道宽度
      const laneWidth = this.width - poolConfig.titleSize
      // 计算泳道在内容区域内的分布
      this.height = orderedLanes.reduce((sum: number, lane: any) => {
        return sum + lane.height
      }, 0)
      let laneTopDistance: number = this.y - this.height / 2
      orderedLanes.forEach((lane: any, index: number) => {
        // 确保不低于最小高度
        // lane.height = Math.max(lane.height, poolConfig.laneMinHeight)
        // 设置泳道位置和尺寸
        lane.moveTo(lane.x, laneTopDistance + lane.height / 2, true)
        // 更新泳道文本位置
        lane.text = {
          ...lane.text,
          x: this.isHorizontal
            ? lane.x - laneWidth / 2 + laneConfig.titleSize / 2
            : lane.x,
          y: this.isHorizontal
            ? lane.y
            : lane.y - lane.height / 2 + laneConfig.titleSize / 2,
        }

        // 为下一个泳道计算Y坐标
        if (index < orderedLanes.length - 1) {
          laneTopDistance += lane.height
        }
      })
    } else {
      let orderedLanes = [] as any[]
      const newLane = lanes.find((lane) => lane.id === newLaneId)
      if (newLane) {
        const others = lanes
          .filter((lane) => lane.id !== newLaneId)
          .slice()
          .sort((a: any, b: any) => a.x - b.x)
        const refId = (newLane as any).properties?.referenceLaneId
        const refIndex = refId
          ? others.findIndex((l: any) => l.id === refId)
          : 0
        const insertIndex =
          newLanePosition === 'left'
            ? Math.max(refIndex, 0)
            : Math.min(refIndex + 1, others.length)
        // 按顺序插入新泳道
        others.splice(insertIndex, 0, newLane)
        orderedLanes = others
      }
      this.width = orderedLanes.reduce((sum: number, lane: any) => {
        return sum + lane.width
      }, 0)
      let laneLeftDistance: number = this.x - this.width / 2
      // 遍历所有泳道，设置它们的位置
      orderedLanes.forEach((lane: any, index: number) => {
        // 确保不低于最小宽度
        // lane.width = Math.max(lane.width, 120)
        // 设置泳道位置和尺寸
        lane.moveTo(laneLeftDistance + lane.width / 2, lane.y, true)
        // 更新泳道文本位置
        lane.text = {
          ...lane.text,
          x: this.isHorizontal
            ? lane.x - lane.width / 2 + laneConfig.titleSize / 2
            : lane.x,
          y: this.isHorizontal
            ? lane.y
            : lane.y - lane.height / 2 + laneConfig.titleSize / 2,
        }

        // 为下一个泳道计算X坐标
        if (index < orderedLanes.length - 1) {
          laneLeftDistance += lane.width
        }
      })
    }

    // 更新文本位置
    this.updateTextPosition()
  }

  /**
   * 重新调整所有泳道布局
   * @param newLanePosition 添加位置（可选）：'above'|'below'|'left'|'right'
   * @param newLaneId 新添加的泳道ID（可选）
   */
  resizeChildren() {
    // 遍历所有泳道，horizontal泳道按Y轴排序，vertical泳道按X轴排序并调整位置
    const lanes = this.getLaneChildren()
    if (lanes.length === 0) return

    if (this.isHorizontal) {
      this.height = lanes.reduce((sum: number, lane: any) => {
        return sum + lane.height
      }, 0)
      // 遍历所有泳道，产出它们在y轴从上到下的顺序
      const orderedLanes = lanes.slice().sort((a: any, b: any) => a.y - b.y)
      lanes.forEach((lane: any) => {
        lane.width = this.width - poolConfig.titleSize
        const laneIndex = orderedLanes.findIndex(
          (orderedLane: any) => orderedLane.id === lane.id,
        )
        // 遍历orderedLanes，计算出lane相比泳池顶部的距离
        const laneTopDistance = orderedLanes.reduce(
          (sum: number, orderedLane: any, index: number) => {
            if (index < laneIndex && orderedLane.id !== lane.id) {
              return sum + orderedLane.height
            }
            return sum
          },
          this.y - this.height / 2,
        )
        lane.moveTo(
          this.x - this.width / 2 + poolConfig.titleSize + lane.width / 2,
          laneTopDistance + lane.height / 2,
          true,
        )
        // 更新泳道文本位置
        lane.text = {
          ...lane.text,
          x: this.isHorizontal
            ? lane.x - lane.width / 2 + laneConfig.titleSize / 2
            : lane.x,
          y: this.isHorizontal
            ? lane.y
            : lane.y - lane.height / 2 + laneConfig.titleSize / 2,
        }
      })
    } else {
      this.width = lanes.reduce((sum: number, lane: any) => {
        return sum + lane.width
      }, 0)
      // 垂直泳道按X轴排序
      const orderedLanes = cloneDeep(lanes).sort((a: any, b: any) => a.x - b.x)
      lanes.forEach((lane: any) => {
        lane.height = this.height - poolConfig.titleSize
        const laneIndex = orderedLanes.findIndex(
          (orderedLane: any) => orderedLane.id === lane.id,
        )
        // 遍历orderedLanes，计算出lane相比泳池顶部的距离
        const laneLeftDistance = orderedLanes.reduce(
          (sum: number, orderedLane: any, index: number) => {
            if (index < laneIndex && orderedLane.id !== lane.id) {
              return sum + orderedLane.width
            }
            return sum
          },
          this.x - this.width / 2,
        )
        lane.moveTo(
          laneLeftDistance + lane.width / 2,
          this.y - this.height / 2 + poolConfig.titleSize + lane.height / 2,
          true,
        )
        // 更新泳道文本位置
        lane.text = {
          ...lane.text,
          x: this.isHorizontal
            ? lane.x - lane.width / 2 + laneConfig.titleSize / 2
            : lane.x,
          y: this.isHorizontal
            ? lane.y
            : lane.y - lane.height / 2 + laneConfig.titleSize / 2,
        }
      })
    }
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
  addLane(position: 'above' | 'below' | 'left' | 'right', laneData?: any) {
    const lanes = this.getLaneChildren()
    if (lanes.length === 0) {
      return this._addFirstLane(laneData)
    }

    // 计算初始位置
    let initialX = this.x
    let initialY = this.y
    // 参考泳道（用于定位）
    const referenceLane = lanes.find((lane) => lane.id === laneData?.id)
    console.log('laneData', laneData, referenceLane.width, referenceLane.height)
    const laneWidth = referenceLane.width
    const laneHeight = referenceLane.height

    if (this.isHorizontal && ['above', 'below'].includes(position)) {
      if (referenceLane) {
        initialY =
          position === 'above'
            ? referenceLane.y - referenceLane.height / 2 - laneHeight / 2
            : referenceLane.y + referenceLane.height / 2 + laneHeight / 2
        initialX = referenceLane.x
      }
    }
    if (!this.isHorizontal && ['left', 'right'].includes(position)) {
      if (referenceLane) {
        initialX =
          position === 'left'
            ? referenceLane.x - referenceLane.width / 2 - laneWidth / 2
            : referenceLane.x + referenceLane.width / 2 + laneWidth / 2
        initialY = referenceLane.y
      }
    }
    const newLane = this.graphModel.addNode(
      merge(
        laneData,
        {
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
        },
        this.properties.laneConfig,
      ),
    )
    this.setZIndex(this.zIndex - 1)
    this.addChild(newLane.id)

    // 调用优化后的resizeChildren，它会处理所有位置计算和泳池尺寸调整
    this.resizeChildrenWithNewLane(position, newLane.id)
    return newLane
  }

  /**
   * 在上方添加泳道
   */
  addChildAbove(laneData?: any) {
    return this.addLane('above', laneData)
  }

  /**
   * 在下方添加泳道
   */
  addChildBelow(laneData?: any) {
    return this.addLane('below', laneData)
  }

  /**
   * 在左侧添加泳道
   */
  addChildLeft(laneData?: any) {
    return this.addLane('left', laneData)
  }

  /**
   * 在右侧添加泳道（纵向布局专用）
   */
  addChildRight(laneData?: any) {
    return this.addLane('right', laneData)
  }

  /**
   * 创建默认泳道
   */
  createDefaultLane(laneConfig?: any) {
    let newLane: any = null
    // 只在没有子节点时创建默认泳道
    if (this.isHorizontal) {
      // 横向泳池：泳道垂直排列
      const laneWidth = this.width - poolConfig.titleSize
      const laneHeight = this.height
      newLane = this.graphModel.addNode(
        merge(
          {
            type: 'lane',
            x: this.x - this.width / 2 + poolConfig.titleSize + laneWidth / 2,
            y: this.y,
            width: laneWidth,
            height: laneHeight,
            text: {
              x: this.x - this.width / 2 + poolConfig.titleSize / 2,
              y: this.y,
              value: '泳道1',
            },
            properties: {
              parent: this.id,
            },
            zIndex: this.zIndex,
          },
          laneConfig,
        ),
      )
    } else {
      // 纵向泳池：泳道水平排列
      // 修复：初始泳道在泳池中心位置，与resizeChildren逻辑保持一致
      const laneWidth = this.width
      const laneHeight = this.height - poolConfig.titleSize
      newLane = this.graphModel.addNode(
        merge(
          {
            type: 'lane',
            x: this.x,
            y:
              this.y -
              this.height / 2 +
              poolConfig.titleSize +
              (this.height - poolConfig.titleSize) / 2,
            width: laneWidth,
            height: laneHeight,
            text: {
              x: this.x,
              y: this.y - this.height / 2 + poolConfig.titleSize / 2,
              value: '泳道1',
            },
            properties: {
              parent: this.id,
            },
            zIndex: this.zIndex,
          },
          laneConfig,
        ),
      )
    }
    this.setZIndex(this.zIndex - 1)
    this.addChild(newLane.id)
    this.resizeChildren()
    this.updateTextPosition()
    return newLane
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
    this.updateTextPosition()
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
    style.overflowMode = 'ellipsis'
    style.strokeWidth = 2
    style.textWidth = this.isHorizontal ? this.height : this.width
    style.textHeight = this.isHorizontal ? this.width : this.height
    if (this.isHorizontal) {
      style.transform = 'rotate(-90deg)'
      style.textAlign = 'center'
    }
    return style
  }
}

export default {
  PoolModel,
}
