/**
 * 基于DynamicGroup重新实现的泳道节点组件
 * 继承DynamicGroupNodeModel和DynamicGroupNode，提供泳道特定功能
 */
import LogicFlow from '@logicflow/core'
import { computed } from 'mobx'
import { DynamicGroupNodeModel } from '../dynamic-group'
import { forEach } from 'lodash-es'
import { laneConfig } from './constant'

export class LaneModel extends DynamicGroupNodeModel {
  initNodeData(data: LogicFlow.NodeConfig) {
    super.initNodeData(data)
    // 泳道特定配置
    this.width = data.width || laneConfig.defaultWidth
    this.height = data.height || laneConfig.defaultHeight
    this.draggable = true // 禁止拖拽（由泳池控制）
    this.resizable = true // 允许调整大小
    this.rotatable = false // 禁止旋转

    // 设置泳道层级
    // 如果传入了zIndex，使用传入的值，否则默认为2
    // 泳道层级应该比所属泳池高，确保显示在泳池上方
    this.zIndex = data.zIndex || -1
    this.autoToFront = true

    this.text.editable = true
    this.style.stroke = '#000'
    this.style.strokeWidth = 1

    // 泳道属性配置
    this.properties = {
      ...this.properties,
      processRef: '', // 流程引用标识
      panels: ['processRef'], // 可配置面板
      direction: data.properties?.direction || 'vertical',
    }

    // 设置折叠尺寸（泳道不支持折叠，设置为与正常尺寸相同）
    this.collapsedWidth = this.width
    this.collapsedHeight = this.height
    this.expandWidth = this.width
    this.expandHeight = this.height
    this.updateTextPosition()
  }

  @computed get isHorizontal() {
    const poolModel = this.getPoolModel()
    return poolModel?.isHorizontal
  }

  setZIndex(zIndex: number) {
    this.zIndex = Math.min(zIndex, -1)
  }

  /**
   * 重写折叠方法 - 泳道不支持折叠
   */
  toggleCollapse() {
    // 泳道不支持折叠功能，保持展开状态
    this.isCollapsed = false
    this.setProperties({ isCollapsed: false })
  }

  /**
   * 获取所属泳池ID
   */
  getPoolId(): string | null {
    try {
      // 检查graphModel是否存在
      if (!this.graphModel) {
        console.warn('GraphModel is not available')
        return null
      }

      // 安全地获取泳池ID
      const poolModel = this.graphModel.nodes.find((node) => {
        return node.children && node.children.has(this.id)
      })
      return poolModel?.id || null
    } catch (error) {
      console.error('Error getting pool ID:', error)
      return null
    }
  }

  /**
   * 获取所属泳池模型
   */
  getPoolModel(): any {
    try {
      const poolId = this.getPoolId()
      if (!poolId) {
        return null
      }

      // 检查graphModel是否存在
      if (!this.graphModel) {
        console.warn('GraphModel is not available for getting pool model')
        return null
      }

      const poolModel = this.graphModel.getNodeModelById(poolId)
      return poolModel || null
    } catch (error) {
      console.error('Error getting pool model:', error)
      return null
    }
  }

  /**
   * 动态修改泳道属性
   */
  changeAttribute({ width, height, x, y }: any) {
    if (width) this.width = width // 更新宽度
    if (height) this.height = height // 更新高度
    if (x) this.x = x // 更新X坐标
    if (y) this.y = y // 更新Y坐标
  }

  /**
   * 重写获取数据方法，添加泳道特定属性
   */
  getData(): LogicFlow.NodeData {
    const data = super.getData()
    return {
      ...data,
      properties: {
        ...data.properties,
        processRef: this.properties.processRef,
        direction: this.properties.direction,
      },
    }
  }
  /**
   * 获取需要移动的节点
   * @param groupModel
   */
  getNodesInGroup(groupModel: DynamicGroupNodeModel): string[] {
    const nodeIds: string[] = []
    const {
      properties: { parent },
      isDragging,
    } = groupModel
    if (isDragging && parent) {
      nodeIds.push(parent as string)
    }
    forEach(Array.from(groupModel.children), (nodeId: string) => {
      const nodeModel = this.graphModel.getNodeModelById(nodeId)
      if (nodeModel && !nodeModel.isDragging) {
        nodeIds.push(nodeId)
      }
    })
    return nodeIds
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
  /**
   * 初始化文本位置 - 根据布局方向设置文本位置
   */
  private updateTextPosition() {
    console.log('updateTextPosition', this.text)
    if (this.isHorizontal) {
      // 横向泳池：文本显示在左侧标题区域
      this.text.x = this.x - this.width / 2 + laneConfig.titleSize / 2
      this.text.y = this.y
    } else {
      // 纵向泳池：文本显示在顶部标题区域
      this.text.x = this.x
      this.text.y = this.y - this.height / 2 + laneConfig.titleSize / 2
    }
  }
}

export default null
