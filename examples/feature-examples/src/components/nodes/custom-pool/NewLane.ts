/**
 * 基于DynamicGroup重新实现的泳道节点组件
 * 继承DynamicGroupNodeModel和DynamicGroupNode，提供泳道特定功能
 */
import LogicFlow, { h } from '@logicflow/core'
import { DynamicGroupNodeModel, DynamicGroupNode } from '@logicflow/extension'
import { forEach } from 'lodash-es'

// 泳道配置常量
const LANE_CONFIG = {
  DEFAULT_WIDTH: 240,
  DEFAULT_HEIGHT: 120,
  TITLE_AREA_WIDTH: 20,
  TITLE_AREA_HEIGHT: 20,
  ICON_SIZE: 20,
  ICON_SPACING: 15,
} as const

export class LaneModel extends DynamicGroupNodeModel {
  initNodeData(data: LogicFlow.NodeConfig) {
    super.initNodeData(data)
    // 泳道特定配置
    this.width = data.width || LANE_CONFIG.DEFAULT_WIDTH
    this.height = data.height || LANE_CONFIG.DEFAULT_HEIGHT
    this.draggable = true // 禁止拖拽（由泳池控制）
    this.resizable = true // 允许调整大小
    this.rotatable = false // 禁止旋转

    // 设置泳道层级
    // 如果传入了zIndex，使用传入的值，否则默认为2
    // 泳道层级应该比所属泳池高，确保显示在泳池上方
    this.zIndex = data.zIndex || -1

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
   * 重写resize方法，支持泳道resize时通知泳池
   * 实现固定对角线角点，保持矩形结构的缩放逻辑
   */
  resize(resizeInfo: any): any {
    try {
      // 记录原始尺寸用于计算缩放比例
      const originalWidth = this.width
      const originalHeight = this.height

      // 调用父类的resize方法获取基本的缩放结果
      const result = super.resize(resizeInfo)

      // 应用最小尺寸限制
      const minWidth = 120
      const minHeight = 60

      if (this.width < minWidth) {
        this.width = minWidth
      }

      if (this.height < minHeight) {
        this.height = minHeight
      }

      // 计算缩放比例，避免除零错误
      const scaleX = originalWidth > 0 ? this.width / originalWidth : 1
      const scaleY = originalHeight > 0 ? this.height / originalHeight : 1

      // 通知泳池进行同步缩放
      this.notifyPoolSyncScale(scaleX, scaleY, resizeInfo?.direction)

      return result
    } catch (error) {
      console.error('Error in lane resize:', error)
      // 即使出错也要执行基础的resize操作
      return super.resize(resizeInfo)
    }
  }

  /**
   * 通知泳池节点进行resize
   */
  notifyPoolResize() {
    try {
      const poolId = this.getPoolId()
      if (poolId) {
        const poolModel = this.graphModel.getNodeModelById(poolId)
        if (poolModel && typeof poolModel.resizeLanes === 'function') {
          poolModel.resizeLanes()
        }
      }
    } catch (error) {
      console.warn('Failed to notify pool resize:', error)
    }
  }

  /**
   * 通知泳池进行同步缩放
   * @param scaleX 水平缩放比例
   * @param scaleY 垂直缩放比例
   * @param direction 缩放方向
   */
  notifyPoolSyncScale(scaleX: number, scaleY: number, direction?: string) {
    try {
      // 基础安全检查
      if (!this.graphModel || !this.id) {
        console.warn('notifyPoolSyncScale: Basic properties not available')
        return
      }

      // 检查缩放比例是否有效
      if (
        !isFinite(scaleX) ||
        !isFinite(scaleY) ||
        scaleX <= 0 ||
        scaleY <= 0
      ) {
        console.warn('notifyPoolSyncScale: Invalid scale values', {
          scaleX,
          scaleY,
        })
        return
      }

      const poolId = this.getPoolId()
      if (!poolId) {
        console.warn('notifyPoolSyncScale: No pool ID found')
        return
      }

      const poolModel = this.graphModel.getNodeModelById(poolId)
      if (!poolModel) {
        console.warn(
          'notifyPoolSyncScale: Pool model not found for ID:',
          poolId,
        )
        return
      }

      if (typeof poolModel.syncScaleWithLane === 'function') {
        // 只有当缩放比例不为1时才通知泳池同步缩放
        if (Math.abs(scaleX - 1) > 0.001 || Math.abs(scaleY - 1) > 0.001) {
          poolModel.syncScaleWithLane(this.id, scaleX, scaleY, direction)
        }
      } else {
        console.warn('Pool model does not support syncScaleWithLane method')
      }
    } catch (error) {
      console.error('Failed to notify pool sync scale:', error)
      // 不重新抛出错误，避免影响主流程
    }
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
}

export class LaneView extends DynamicGroupNode {
  // componentWillUpdate(nextProps: any): void {
  //   const { model } = nextProps
  //   if (model.isHovered) {
  //     this.toFront()
  //     return
  //   }
  //   model.setZIndex(0)
  //   const poolModel = model.getPoolModel()
  //   poolModel.setZIndex(0)
  // }
  /**
   * 将泳道及其兄弟泳道和所属泳池置顶
   * 实现选中泳道时，自动将泳道、兄弟泳道和所属泳池置顶的功能
   */
  // toFront() {
  //   const { model, graphModel } = this.props
  //   try {
  //     // 获取所属泳池
  //     const poolId = model.getPoolId()
  //     if (!poolId) {
  //       // 如果找不到所属泳池，只将当前泳道置顶
  //       graphModel.toFront(model.id)
  //       return
  //     }

  //     const poolModel = graphModel.getNodeModelById(poolId)
  //     if (!poolModel) {
  //       // 如果找不到泳池模型，只将当前泳道置顶
  //       graphModel.toFront(model.id)
  //       return
  //     }

  //     graphModel.toFront(model.id)

  //     // 先将泳池置顶
  //     // graphModel.toFront(poolId)
  //     poolModel.setZIndex(model.zIndex - poolModel.children.size)

  //     // 获取所有兄弟泳道
  //     const siblingLanes = poolModel.getLaneChildren?.() || []

  //     // 将所有泳道置顶，确保泳道始终在泳池之上
  //     siblingLanes.forEach((lane: LaneModel, index: number) => {
  //       // 确保泳道的zIndex比泳池高
  //       lane.setZIndex(model.zIndex - index)

  //       // 将泳道置顶
  //       // graphModel.toFront(lane.id)
  //       console.log(
  //         'lane zIndex',
  //         graphModel.nodes.map((node) => {
  //           return `${node.id}-${node.zIndex}`
  //         }),
  //       )
  //     })
  //   } catch (error) {
  //     console.error('Error in lane bringToFront:', error)
  //     // 出错时至少确保当前泳道置顶
  //     graphModel.toFront(model.id)
  //   }
  // }
  resetZIndex() {
    const { model } = this.props
    model.setZIndex()
  }
  getShape() {
    const { model } = this.props
    const { x, y, width, height } = model
    const style = model.getNodeStyle()
    // 获取泳池布局方向（从所属泳池获取）
    // const poolModel = (model as LaneModel).getPoolModel()
    // const direction = poolModel?.isHorizontal ? 'horizontal' : 'vertical'
    // 泳道主体
    const rectAttrs = {
      x: x - width / 2,
      y: y - height / 2,
      width,
      height,
      stroke: '#000000',
      strokeWidth: 2,
      fill: 'transparent',
      ...style,
    }

    // 操作图标区域
    const icons = this.getOperateIcons()

    return h('g', {}, [h('rect', { ...rectAttrs }), ...icons])
  }

  /**
   * 获取操作图标
   */
  getOperateIcons() {
    const { model } = this.props
    const { isSelected } = model
    if (!isSelected) {
      return []
    }

    const poolModel = (model as LaneModel).getPoolModel()
    if (!poolModel) {
      return []
    }

    const { isHorizontal } = poolModel

    return [
      this.addBeforeLaneIcon(isHorizontal, () =>
        isHorizontal ? poolModel.addChildAbove?.() : poolModel.addChildLeft?.(),
      ),
      this.addAfterLaneIcon(isHorizontal, () =>
        isHorizontal
          ? poolModel.addChildBelow?.()
          : poolModel.addChildRight?.(),
      ),
      this.addBetweenLaneIcon(isHorizontal, () =>
        poolModel.addChildBetween?.(),
      ),
      this.deleteLaneIcon(() => poolModel.removeChild?.()),
      // this.createIcon(
      //   'below',
      //   x,
      //   y + LANE_CONFIG.ICON_SIZE + 5,
      //   width,
      //   height,
      //   poolModel,
      //   direction,
      // ),
      // this.createIcon(
      //   'both',
      //   x,
      //   y + (LANE_CONFIG.ICON_SIZE + 5) * 2,
      //   width,
      //   height,
      //   poolModel,
      //   direction,
      // ),
      // this.createIcon('delete', x, y, width, height, poolModel, direction),
    ]
  }

  addBeforeLaneIcon(isHorizontal: boolean, callback: () => void) {
    const { x, y, width, height } = this.props.model
    // 图标与泳道之间加固定的间距
    const positionX = x + width / 2 + LANE_CONFIG.ICON_SPACING
    const positionY = y - height / 2
    const baseAttr = {
      width: LANE_CONFIG.ICON_SIZE / 2,
      height: LANE_CONFIG.ICON_SIZE,
      strokeWidth: 1,
      fill: '#fff',
      stroke: '#000',
      x: positionX,
      y: positionY,
    }
    let iconView: h.JSX.Element[] = [
      h('rect', {
        ...baseAttr,
        x: positionX + LANE_CONFIG.ICON_SIZE / 2,
        strokeDasharray: '2 2',
      }),
      h('rect', baseAttr),
    ]
    if (isHorizontal) {
      iconView = [
        h('rect', {
          ...baseAttr,
          width: LANE_CONFIG.ICON_SIZE,
          height: LANE_CONFIG.ICON_SIZE / 2,
          strokeDasharray: '2 2',
        }),
        h('rect', {
          ...baseAttr,
          width: LANE_CONFIG.ICON_SIZE,
          height: LANE_CONFIG.ICON_SIZE / 2,
          y: positionY + LANE_CONFIG.ICON_SIZE / 2,
        }),
      ]
    }
    return h('g', { cursor: 'pointer', onClick: callback }, iconView)
  }
  addAfterLaneIcon(isHorizontal: boolean, callback: () => void) {
    const { x, y, width, height } = this.props.model
    const positionX = x + width / 2 + LANE_CONFIG.ICON_SPACING
    const positionY =
      y - height / 2 + LANE_CONFIG.ICON_SIZE + LANE_CONFIG.ICON_SPACING
    const baseAttr = {
      width: LANE_CONFIG.ICON_SIZE / 2,
      height: LANE_CONFIG.ICON_SIZE,
      strokeWidth: 1,
      fill: '#fff',
      stroke: '#000',
      x: positionX,
      y: positionY,
    }
    let iconView: h.JSX.Element[] = [
      h('rect', {
        ...baseAttr,
        x: positionX + LANE_CONFIG.ICON_SIZE / 2,
      }),
      h('rect', {
        ...baseAttr,
        strokeDasharray: '2 2',
      }),
    ]
    if (isHorizontal) {
      iconView = [
        h('rect', {
          ...baseAttr,
          width: LANE_CONFIG.ICON_SIZE,
          height: LANE_CONFIG.ICON_SIZE / 2,
        }),
        h('rect', {
          ...baseAttr,
          width: LANE_CONFIG.ICON_SIZE,
          height: LANE_CONFIG.ICON_SIZE / 2,
          y: positionY + LANE_CONFIG.ICON_SIZE / 2,
          strokeDasharray: '2 2',
        }),
      ]
    }
    return h('g', { cursor: 'pointer', onClick: callback }, iconView)
  }
  addBetweenLaneIcon(isHorizontal: boolean, callback: () => void) {
    const { x, y, width, height } = this.props.model
    const positionX = x + width / 2 + LANE_CONFIG.ICON_SPACING
    const positionY =
      y - height / 2 + (LANE_CONFIG.ICON_SIZE + LANE_CONFIG.ICON_SPACING) * 2
    const baseAttr = {
      width: LANE_CONFIG.ICON_SIZE,
      height: LANE_CONFIG.ICON_SIZE,
      strokeWidth: 1,
      fill: '#fff',
      stroke: '#000',
      x: positionX,
      y: positionY,
    }
    let iconView: h.JSX.Element[] = [
      h('rect', baseAttr),
      h('rect', {
        ...baseAttr,
        width: LANE_CONFIG.ICON_SIZE / 3,
        strokeDasharray: '2 2',
        x: positionX + LANE_CONFIG.ICON_SIZE / 3,
      }),
    ]
    if (isHorizontal) {
      iconView = [
        h('rect', baseAttr),
        h('rect', {
          ...baseAttr,
          height: LANE_CONFIG.ICON_SIZE / 3,
          fill: 'transparent',
          strokeDasharray: '2 2',
          y: positionY + LANE_CONFIG.ICON_SIZE / 3,
        }),
      ]
    }
    return h('g', { cursor: 'pointer', onClick: callback }, iconView)
  }

  deleteLaneIcon(callback: () => void) {
    const { x, y, width, height } = this.props.model
    const positionX = x + width / 2 + LANE_CONFIG.ICON_SPACING
    const positionY =
      y - height / 2 + (LANE_CONFIG.ICON_SIZE + LANE_CONFIG.ICON_SPACING) * 3
    return h(
      'g',
      {
        cursor: 'pointer',
        onClick: callback,
        width: LANE_CONFIG.ICON_SIZE,
        height: LANE_CONFIG.ICON_SIZE,
        transform: `translate(${positionX}, ${positionY})`,
      },
      [
        h('rect', {
          width: LANE_CONFIG.ICON_SIZE,
          height: LANE_CONFIG.ICON_SIZE,
          fill: 'transparent',
        }),
        h('path', {
          transform: `translate(2, 1) scale(${LANE_CONFIG.ICON_SIZE / 18})`,
          fill: '#000',
          d: 'M1.6361705,0.07275847000000002L1.6362224,0.07267305000000002L5.1435161,2.2034403L6.3516493,1.28341734Q7.2009554,0.63665058,8.0902505,1.22722644L10.1215935,2.5762291Q11.006711,3.1640306,10.745867,4.1940317L10.4062386,5.5351257L13.625054,7.5778356L13.625001,7.5779204Q13.678322,7.6117587,13.721552,7.6577945Q13.764784,7.7038307,13.795207,7.7591715Q13.82563,7.8145118,13.841336,7.87568Q13.857041,7.9368477,13.857041,8Q13.85704,8.0492353,13.847435,8.0975251Q13.83783,8.145814900000001,13.818987,8.191302799999999Q13.800144,8.2367907,13.772791,8.2777286Q13.745438,8.318666499999999,13.710623,8.3534818Q13.675808,8.3882966,13.63487,8.4156504Q13.593931,8.4430046,13.548444,8.461846399999999Q13.502956,8.4806881,13.454666,8.4902935Q13.406377,8.4998994,13.357141,8.499899899999999Q13.211908,8.499899899999999,13.089283,8.4220805L13.08923,8.4221654L4.9074116,3.229857L1.1170242400000001,0.92732695L1.1170761599999999,0.92724147Q1.06204063,0.8938076500000001,1.0172748,0.84751782Q0.97250897,0.80122799,0.9409355500000001,0.74510445Q0.9093622,0.68898091,0.89304277,0.626688Q0.87672335,0.564395107,0.87672332,0.5Q0.8767232899999999,0.450764146,0.88632876,0.402474351Q0.8959341599999999,0.35418455,0.91477591,0.30869657Q0.93361765,0.26320857,0.9609716500000001,0.22227046Q0.9883256,0.18133234999999998,1.02314061,0.14651734Q1.05795562,0.11170232000000002,1.0988937,0.08434838Q1.13983184,0.056994409999999995,1.18531984,0.038152660000000005Q1.2308077800000001,0.019310890000000025,1.27909762,0.009705450000000004Q1.32738745,0.00010001999999997846,1.3766233300000001,0.00009998999999999425Q1.516567,0.00009998999999999425,1.6361705,0.07275847000000002ZM9.5175018,4.9711194L9.7764683,3.9485345Q9.8634167,3.6052005,9.5683784,3.4092672L7.537035,2.0602646Q7.240603,1.8634058,6.9575009,2.0789949L6.0496349,2.7703574L9.5175018,4.9711194ZM11.227273,14.5L11.227273,9.7307692L11.227173,9.7307692Q11.227173,9.6815329,11.217567,9.6332426Q11.207962,9.5849533,11.189119,9.539465Q11.170278,9.4939766,11.142924,9.4530392Q11.11557,9.4121017,11.080755,9.3772869Q11.04594,9.3424721,11.005002,9.3151178Q10.964064,9.2877636,10.918575,9.2689209Q10.873087,9.2500801,10.824797,9.2404747Q10.776508,9.2308693,10.727273,9.2308693Q10.678036,9.2308693,10.629745,9.2404747Q10.581455,9.2500801,10.535968,9.2689209Q10.4904804,9.2877636,10.449542,9.3151178Q10.4086046,9.3424721,10.3737898,9.377286Q10.338975,9.4121008,10.3116207,9.4530382Q10.2842674,9.4939766,10.2654257,9.539465Q10.2465839,9.5849533,10.2369785,9.6332426Q10.2273731,9.6815329,10.2273731,9.7307692L10.2272739,9.7307692L10.2272739,14.5Q10.2272739,15,9.727273,15L7.7207794,15L7.7207789,8.2500091L7.7206788,8.2500091Q7.7206783,8.2007728,7.7110729,8.152483Q7.7014675,8.104193200000001,7.6826253,8.0587053Q7.6637836,8.013217000000001,7.6364298,7.9722791Q7.6090755,7.9313412,7.5742612,7.8965263Q7.5394459,7.861711,7.4985075,7.8343568Q7.4575696,7.807003,7.4120817,7.7881613Q7.3665934,7.7693195,7.3183041,7.7597141Q7.2700143,7.7501092,7.2207789,7.7501092Q7.1715426,7.7501092,7.1232524,7.7597141Q7.0749626,7.7693195,7.0294747,7.7881613Q6.9839869,7.807003,6.943049,7.8343573Q6.9021111,7.861711,6.8672962,7.8965263Q6.8324809,7.9313412,6.8051271,7.9722791Q6.7777729,8.013217000000001,6.7589312,8.0587053Q6.7400894,8.1041937,6.7304845,8.1524839Q6.7208786,8.2007732,6.7208791,8.2500095L6.7207789,8.2500091L6.7207794,15L4.2142854,15L4.2142854,6.2692308L4.2141855,6.2692308Q4.2141852,6.2199945,4.204579799999999,6.1717048Q4.1949743999999995,6.123415,4.1761324,6.0779266Q4.1572905,6.0324383,4.1299367,5.9915004Q4.1025827,5.9505625,4.0677679,5.9157476Q4.0329528,5.8809328,3.9920146,5.8535786Q3.9510765,5.8262248,3.9055884,5.8073831Q3.8601003,5.7885418,3.811811,5.7789364Q3.7635212,5.769331,3.7142854,5.769331Q3.6650493,5.769331,3.6167595,5.7789364Q3.5684695,5.7885418,3.5229816,5.8073831Q3.4774938,5.8262248,3.4365554,5.8535786Q3.3956175,5.8809328,3.3608027,5.9157476Q3.3259873,5.9505625,3.2986333,5.9915004Q3.2712793,6.0324383,3.2524376,6.0779266Q3.2335958,6.123415,3.2239904,6.1717048Q3.214385,6.2199945,3.2143853,6.2692308L3.2142854,6.2692308L3.2142854,15L1.5000002,15Q1.0000001200000002,15,1.0000001200000002,14.5L1,5.4150848Q1,5.0384622,1.3766233300000001,5.0384622L1.3766233300000001,5.0383615Q1.42585915,5.0383615,1.47414887,5.0287557Q1.5224386,5.0191503,1.5679266,5.0003085Q1.6134146,4.9814663,1.6543528,4.954113Q1.695291,4.9267588,1.730106,4.8919439Q1.7649209,4.8571291,1.792275,4.8161907Q1.8196288,4.7752523,1.8384706,4.7297645Q1.8573124,4.6842766,1.8669178,4.6359868Q1.8765233,4.587697,1.8765234,4.5384617Q1.8765233,4.4892254000000005,1.8669178,4.4409355999999995Q1.8573124,4.3926458,1.8384707,4.3471577Q1.819629,4.3016696,1.792275,4.2607315Q1.7649209,4.2197936,1.730106,4.1849787Q1.695291,4.1501637,1.6543529,4.1228096Q1.6134148,4.0954556,1.5679268,4.0766139Q1.5224388,4.0577724,1.4741489300000001,4.048166999999999Q1.42585915,4.0385615999999995,1.3766233300000001,4.0385615999999995L1.3766233300000001,4.0384617Q0.8064074800000001,4.0384617,0.403203636,4.4416654Q0,4.8448691,0,5.4150848L9.000000000813912e-8,14.5Q2.9999999984209325e-8,15.121321,0.439339694,15.56066Q0.8786805,16.000002000000002,1.5000002,16.000002000000002L9.727273,16.000002000000002Q10.3485928,16.000002000000002,10.787933,15.56066Q11.227273,15.121321,11.227273,14.5Z',
        }),
      ],
    )
  }

  createIcon(
    type: 'above' | 'below' | 'both' | 'delete',
    x: number,
    y: number,
    width: number,
    height: number,
    poolModel: any,
    direction: string,
  ) {
    const rightX = x + width / 2 + LANE_CONFIG.ICON_SPACING
    const leftX = x - width / 2
    const topY = y - height / 2
    if (type === 'above') {
      const onClick =
        direction === 'horizontal'
          ? () => poolModel.addChildAbove?.()
          : () => poolModel.addChildLeft?.()
      const rects =
        direction === 'horizontal'
          ? [
              h('rect', {
                height: LANE_CONFIG.ICON_SIZE / 2,
                width: LANE_CONFIG.ICON_SIZE,
                strokeWidth: 1,
                fill: '#fff',
                stroke: '#000',
                strokeDasharray: '2 2',
                x: rightX,
                y: topY,
              }),
              h('rect', {
                height: LANE_CONFIG.ICON_SIZE / 2,
                width: LANE_CONFIG.ICON_SIZE,
                strokeWidth: 1,
                fill: '#fff',
                stroke: '#000',
                x: rightX,
                y: topY + LANE_CONFIG.ICON_SIZE / 2,
              }),
            ]
          : [
              h('rect', {
                width: LANE_CONFIG.ICON_SIZE / 2,
                height: LANE_CONFIG.ICON_SIZE,
                strokeWidth: 1,
                fill: '#fff',
                stroke: '#000',
                strokeDasharray: '2 2',
                x: leftX + 3,
                y: topY + LANE_CONFIG.ICON_SPACING,
              }),
              h('rect', {
                width: LANE_CONFIG.ICON_SIZE / 2,
                height: LANE_CONFIG.ICON_SIZE,
                strokeWidth: 1,
                fill: '#fff',
                stroke: '#000',
                x: leftX + 10,
                y: topY + LANE_CONFIG.ICON_SPACING,
              }),
            ]
      return h('g', { cursor: 'pointer', onClick }, rects)
    }
    if (type === 'below') {
      const onClick =
        direction === 'horizontal'
          ? () => poolModel.addChildBelow?.()
          : () => poolModel.addChildRight?.()
      const rects =
        direction === 'horizontal'
          ? [
              h('rect', {
                height: LANE_CONFIG.ICON_SIZE / 2,
                width: LANE_CONFIG.ICON_SIZE,
                strokeWidth: 1,
                fill: '#fff',
                stroke: '#000',
                strokeDasharray: '2 2',
                x: rightX,
                y: topY,
              }),
              h('rect', {
                height: LANE_CONFIG.ICON_SIZE / 2,
                width: LANE_CONFIG.ICON_SIZE,
                strokeWidth: 1,
                fill: '#fff',
                stroke: '#000',
                x: rightX,
                y: topY + LANE_CONFIG.ICON_SIZE / 2,
              }),
            ]
          : [
              h('rect', {
                width: LANE_CONFIG.ICON_SIZE / 2,
                height: LANE_CONFIG.ICON_SIZE,
                strokeWidth: 1,
                fill: '#fff',
                stroke: '#000',
                strokeDasharray: '2 2',
                x: x + width / 2 - 10,
                y: topY,
              }),
              h('rect', {
                width: LANE_CONFIG.ICON_SIZE / 2,
                height: LANE_CONFIG.ICON_SIZE,
                strokeWidth: 1,
                fill: '#fff',
                stroke: '#000',
                x: x + width / 2 - 20,
                y: topY,
              }),
            ]
      return h('g', { cursor: 'pointer', onClick }, rects)
    }
    if (type === 'both') {
      const onClick =
        direction === 'horizontal'
          ? () => {
              poolModel.addChildAbove?.()
              poolModel.addChildBelow?.()
            }
          : () => poolModel.addChildRight?.()
      const rects =
        direction === 'horizontal'
          ? [
              h('rect', {
                height: LANE_CONFIG.ICON_SIZE,
                width: LANE_CONFIG.ICON_SIZE,
                strokeWidth: 1,
                fill: '#fff',
                stroke: '#000',
                x: rightX,
                y: topY + LANE_CONFIG.ICON_SPACING,
              }),
              h('rect', {
                height: LANE_CONFIG.ICON_SIZE / 3,
                width: LANE_CONFIG.ICON_SIZE,
                strokeWidth: 1,
                fill: 'transparent',
                stroke: '#000',
                strokeDasharray: '2 2',
                x: rightX,
                y: topY + LANE_CONFIG.ICON_SIZE / 3 + LANE_CONFIG.ICON_SPACING,
              }),
            ]
          : [
              h('rect', {
                width: LANE_CONFIG.ICON_SIZE,
                height: LANE_CONFIG.ICON_SIZE,
                strokeWidth: 1,
                fill: '#fff',
                stroke: '#000',
                x: x + width / 2,
                y: topY + LANE_CONFIG.ICON_SPACING,
              }),
              h('rect', {
                width: LANE_CONFIG.ICON_SIZE / 3,
                height: LANE_CONFIG.ICON_SIZE,
                strokeWidth: 1,
                fill: '#fff',
                stroke: '#000',
                strokeDasharray: '2 2',
                x:
                  x +
                  width / 2 +
                  LANE_CONFIG.ICON_SIZE / 3 +
                  LANE_CONFIG.ICON_SPACING,
                y: topY + LANE_CONFIG.ICON_SPACING,
              }),
            ]
      return h('g', { cursor: 'pointer', onClick }, rects)
    }
    const onClick = () => poolModel.deleteChild?.(this.props.model.id)
    const rect =
      direction === 'horizontal'
        ? h('rect', {
            width: 10,
            height: 10,
            strokeWidth: 1,
            fill: '#fff',
            stroke: '#000',
            x: x + width / 2 + 5,
            y: y + height / 2 - 15,
          })
        : h('rect', {
            width: 10,
            height: 10,
            strokeWidth: 1,
            fill: '#fff',
            stroke: '#000',
            x: x + width / 2 - 15,
            y: topY + 5,
          })
    const cross =
      direction === 'horizontal'
        ? h('path', {
            d: 'M 3 3 L 7 7 M 7 3 L 3 7',
            stroke: '#000',
            strokeWidth: 1,
            transform: `translate(${x + width / 2 + 10}, ${y + height / 2 - 10})`,
          })
        : h('path', {
            d: 'M 3 3 L 7 7 M 7 3 L 3 7',
            stroke: '#000',
            strokeWidth: 1,
            transform: `translate(${x + width / 2 - 10}, ${topY + 10})`,
          })
    return h('g', { cursor: 'pointer', onClick }, [rect, cross])
  }
}

export const LaneNode = {
  type: 'lane',
  view: LaneView,
  model: LaneModel,
}

export default LaneNode
