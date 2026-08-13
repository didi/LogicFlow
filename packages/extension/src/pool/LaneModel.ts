/**
 * 基于DynamicGroup重新实现的泳道节点组件
 * 继承DynamicGroupNodeModel和DynamicGroupNode，提供泳道特定功能
 */
import LogicFlow, { observable } from '@logicflow/core'
import { DynamicGroupNodeModel } from '../dynamic-group'
import { forEach } from 'lodash-es'
import { laneConfig, TitlePosition } from './constant'
import { getTitleLayout, resolveLaneTitlePosition } from './utils'

export type LaneChildRelativePositions = Record<
  string,
  { dx: number; dy: number }
>

/**
 * 将源 Lane 子节点的相对位置快照映射到复制后的子节点 id。
 *
 * @param sourcePositions 源 Lane 的子节点相对位置。
 * @param nodeIdMap 源子节点 id 到复制子节点 id 的映射。
 * @returns 使用复制后子节点 id 的相对位置快照。
 */
export function mapLaneChildRelativePositions(
  sourcePositions: LaneChildRelativePositions,
  nodeIdMap: Record<string, string>,
): LaneChildRelativePositions {
  return Object.entries(sourcePositions).reduce(
    (positions, [sourceChildId, offset]) => {
      const copiedChildId = nodeIdMap[sourceChildId]
      if (copiedChildId) positions[copiedChildId] = offset
      return positions
    },
    {} as LaneChildRelativePositions,
  )
}

export class LaneModel extends DynamicGroupNodeModel {
  readonly isLane: boolean = true
  titleSize: number = laneConfig.titleSize
  defaultZIndex: number = -1
  @observable isLaneReordering: boolean = false
  @observable isLaneReturning: boolean = false

  initNodeData(data: LogicFlow.NodeConfig) {
    super.initNodeData(data)
    // 泳道特定配置
    this.width = data.width || laneConfig.defaultWidth
    this.height = data.height || laneConfig.defaultHeight
    this.draggable = true // 允许拖拽（实际拖拽逻辑由泳池控制）
    this.resizable = true // 允许调整大小
    this.rotatable = false // 禁止旋转

    // 设置泳道层级
    // 如果传入了zIndex，使用传入的值，否则默认为2
    // 泳道层级应该比所属泳池高，确保显示在泳池上方
    this.defaultZIndex = data.zIndex || -1
    this.setZIndex(this.defaultZIndex)
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

    // 折叠态数据需要保留展开尺寸，序列化后重新渲染才能正确恢复。
    this.collapsedWidth = data.properties?.collapsedWidth ?? this.width
    this.collapsedHeight = data.properties?.collapsedHeight ?? this.height
    this.expandWidth = data.properties?.expandWidth ?? this.width
    this.expandHeight = data.properties?.expandHeight ?? this.height
  }

  setAttributes(): void {
    super.setAttributes()
    this.updateTextPosition()
  }

  /**
   * 解析 Lane 最终使用的标题边，优先使用 Lane 配置并兼容 Pool 方向。
   *
   * @returns Lane 标题所在的边。
   */
  getResolvedTitlePosition(): TitlePosition {
    return resolveLaneTitlePosition(
      this.properties,
      this.getPoolModel()?.properties ?? {
        direction: this.properties?.direction,
      },
    )
  }

  /**
   * 获取 Lane 标题区域的几何盒。
   *
   * @returns 当前展开或折叠状态下的标题区域。
   */
  getTitleTextBox(): { x: number; y: number; width: number; height: number } {
    if (this.isCollapsed) {
      return { x: this.x, y: this.y, width: this.width, height: this.height }
    }
    return getTitleLayout(
      { x: this.x, y: this.y, width: this.width, height: this.height },
      this.getResolvedTitlePosition(),
      this.titleSize,
    ).titleBox
  }

  /**
   * 判断标题文本是否沿垂直方向居中。
   *
   * @returns Lane 标题始终垂直居中时返回 true。
   */
  isTitleTextVerticallyCentered(): boolean {
    return true
  }

  /** 折叠 Lane 已经是完整标题块，文字不再沿展开态标题边旋转。 */
  getTitleRenderPosition(): TitlePosition {
    if (!this.isCollapsed) return this.getResolvedTitlePosition()
    return this.getPoolModel()?.isHorizontal ? 'top' : 'left'
  }

  /**
   * Lane 默认压在普通节点下方；拖拽/选中抬层时允许临时超过默认层级。
   *
   * @param zIndex 期望设置的渲染层级。
   * @returns {void}
   */
  setZIndex(zIndex: number): void {
    if (zIndex > this.defaultZIndex) {
      this.zIndex = zIndex
      return
    }
    this.zIndex = Math.min(zIndex, this.defaultZIndex) || this.defaultZIndex
  }

  getOuterGAttributes() {
    const attributes = super.getOuterGAttributes()
    return {
      ...attributes,
      // 仅在排序预览或非法投放归位期间启用过渡，正常移动不能带动画滞后。
      className:
        this.isLaneReordering || this.isLaneReturning
          ? 'lf-lane-reordering'
          : '',
    }
  }

  /**
   * 切换 Lane 折叠状态。
   *
   * Lane 只负责更新自身标题块尺寸，所属 Pool 再统一收口重排，避免容器尺寸被单条 Lane 抢先写回。
   *
   * @param collapse 指定折叠状态；不传时切换当前状态。
   * @returns {void}
   */
  toggleCollapse(collapse?: boolean): void {
    const plugin = this.graphModel.dynamicGroup as any
    if (
      typeof plugin?.isCollapseAllowed === 'function' &&
      !plugin.isCollapseAllowed(this)
    ) {
      this.isCollapsed = false
      this.setProperties({ ...this.properties, isCollapsed: false })
      return
    }

    const next = typeof collapse === 'boolean' ? collapse : !this.isCollapsed
    if (next === this.isCollapsed) return

    if (next) {
      this.setCollapsedSizeForDirection(this.width, this.height)
    }

    super.toggleCollapse(next)
    const pool = this.getPoolModel()
    if (!pool?.isSyncingPoolCollapse) {
      pool?.layoutLanesByOrder?.({ reason: 'collapse' })
    }
  }

  /**
   * 刷新已折叠 Lane 的标题块尺寸。
   *
   * 标题边变更不改变折叠轴，仍按所属 Pool 的排列方向保留标题块。
   *
   * @returns {void}
   */
  refreshCollapsedTitleBounds(): void {
    if (!this.isCollapsed) return

    this.setCollapsedSizeForDirection(this.expandWidth, this.expandHeight)
    this.width = this.collapsedWidth
    this.height = this.collapsedHeight
    this.updateTextPosition()
  }

  private setCollapsedSizeForDirection(
    expandedWidth: number,
    expandedHeight: number,
  ) {
    // 横向 Pool 的 Lane 垂直堆叠，折叠后保留整行宽度；纵向 Pool 同理保留整列高度。
    const isHorizontalPool =
      this.getPoolModel()?.isHorizontal ??
      this.properties?.direction === 'horizontal'
    this.collapsedWidth = isHorizontalPool ? expandedWidth : this.titleSize
    this.collapsedHeight = isHorizontalPool ? this.titleSize : expandedHeight
  }

  /**
   * 获取所属 Pool 的 id。
   */
  getPoolId(): string | null {
    try {
      if (!this.graphModel) {
        console.warn('GraphModel is not available')
        return null
      }

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
   * 获取所属 Pool 模型。
   */
  getPoolModel(): any {
    try {
      const poolId = this.getPoolId()
      if (!poolId) {
        return null
      }

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
   * 动态修改 Lane 的尺寸或坐标。
   *
   * @param attributes 需要覆盖的尺寸或坐标字段。
   * @returns {void}
   */
  changeAttribute({ width, height, x, y }: any): void {
    if (width) this.width = width // 更新宽度
    if (height) this.height = height // 更新高度
    if (x) this.x = x // 更新X坐标
    if (y) this.y = y // 更新Y坐标
  }

  /**
   * 序列化 Lane 数据时补充展开/折叠尺寸和方向信息。
   */
  getData(): LogicFlow.NodeData {
    const data = super.getData()
    // const poolModel = this.getPoolModel()
    return {
      ...data,
      properties: {
        ...data.properties,
        width: this.width,
        height: this.height,
        expandWidth: this.expandWidth,
        expandHeight: this.expandHeight,
        collapsedWidth: this.collapsedWidth,
        collapsedHeight: this.collapsedHeight,
        processRef: this.properties.processRef,
        direction: this.properties.direction,
      },
    }
  }
  /**
   * 禁止 Lane 嵌套到 Lane 内。
   */
  isAllowAppendIn(nodeData: LogicFlow.NodeData): boolean {
    return String(nodeData.type) !== 'lane'
  }

  /**
   * 获取会跟随 Lane 一起移动的子节点 id。
   *
   * 嵌套 Lane 或正在被 core 单独拖拽的节点不能再被重复移动。
   *
   * @returns 可随当前 Lane 移动的直接子节点 id 列表。
   */
  getMovableChildIds(): string[] {
    return Array.from(this.children).filter((nodeId: string) => {
      const nodeModel = this.graphModel.getNodeModelById(nodeId)
      return (
        nodeModel && !nodeModel.isDragging && String(nodeModel.type) !== 'lane'
      )
    }) as string[]
  }

  /**
   * 记录子节点相对 Lane 中心的偏移，后续 Pool 重排后用它恢复视觉位置。
   */
  captureChildrenRelativePositions(
    childIds: string[] = this.getMovableChildIds(),
  ): LaneChildRelativePositions {
    return childIds.reduce((positions, childId) => {
      const child = this.graphModel.getNodeModelById(childId)
      if (child) {
        positions[childId] = {
          dx: child.x - this.x,
          dy: child.y - this.y,
        }
      }
      return positions
    }, {} as LaneChildRelativePositions)
  }

  /**
   * 按 Lane 中心恢复子节点的相对位置。
   *
   * Pool 重排、复制粘贴、非法 drop 归位都会移动 Lane；这里保证 Lane 内节点视觉位置不被二次偏移。
   */
  restoreChildrenRelativePositions(positions: LaneChildRelativePositions) {
    // 多数情况下所有子节点拥有相同 delta，可以批量 moveNodes；不同 delta 时再逐个归位。
    const moves = Object.entries(positions)
      .map(([childId, offset]) => {
        const child = this.graphModel.getNodeModelById(childId)
        if (!child) return undefined
        const targetX = this.x + offset.dx
        const targetY = this.y + offset.dy
        return {
          childId,
          targetX,
          targetY,
          deltaX: targetX - child.x,
          deltaY: targetY - child.y,
        }
      })
      .filter(Boolean) as Array<{
      childId: string
      targetX: number
      targetY: number
      deltaX: number
      deltaY: number
    }>
    const moved = moves.filter(({ deltaX, deltaY }) => deltaX || deltaY)
    if (moved.length === 0) return

    const [first] = moved
    const hasSameDelta = moved.every(
      ({ deltaX, deltaY }) =>
        deltaX === first.deltaX && deltaY === first.deltaY,
    )
    if (hasSameDelta) {
      this.graphModel.moveNodes(
        moved.map(({ childId }) => childId),
        first.deltaX,
        first.deltaY,
        true,
      )
      return
    }

    moved.forEach(({ childId, targetX, targetY }) => {
      this.graphModel.moveNode2Coordinate(childId, targetX, targetY, true)
    })
  }

  /**
   * 获取需要跟随 group 一起移动的节点 id。
   *
   * @param groupModel 当前触发分组移动查询的容器模型。
   * @returns 未处于拖拽状态且不是 Lane 的直接子节点 id 列表。
   */
  getNodesInGroup(groupModel: DynamicGroupNodeModel): string[] {
    const nodeIds: string[] = []
    forEach(Array.from(groupModel.children), (nodeId: string) => {
      const nodeModel = this.graphModel.getNodeModelById(nodeId)
      // 只有非 Lane 类型的节点才会被带动
      if (
        nodeModel &&
        !nodeModel.isDragging &&
        String(nodeModel.type) !== 'lane'
      ) {
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
   * 获取 Lane 标题文本样式。
   */
  getTextStyle() {
    const style = super.getTextStyle()
    const titleLayout = getTitleLayout(
      { x: this.x, y: this.y, width: this.width, height: this.height },
      this.getResolvedTitlePosition(),
      this.titleSize,
    )
    const titlePosition = this.getTitleRenderPosition()
    const isVerticalTitle =
      titlePosition === 'left' || titlePosition === 'right'

    style.overflowMode = 'ellipsis'
    style.strokeWidth = 2
    style.textWidth = isVerticalTitle
      ? titleLayout.titleBox.height
      : titleLayout.titleBox.width
    style.textHeight = isVerticalTitle
      ? titleLayout.titleBox.width
      : titleLayout.titleBox.height
    if (isVerticalTitle) {
      style.transform = 'rotate(-90deg)'
    } else if ('transform' in style) {
      delete style.transform
    }
    style.textAlign = 'center'
    return style
  }

  /**
   * 获取当前 Lane 的子节点模型。
   */
  getSubNodes() {
    const children: any[] = []
    Array.from(this.children).forEach((childId) => {
      const childModel = this.graphModel.getNodeModelById(childId)
      if (childModel) {
        children.push(childModel)
      }
    })
    return children
  }

  /**
   * Lane 文本跟随解析后的标题边，避免仅靠旧 isHorizontal 分支导致四边标题错位。
   */
  setTextPosition() {
    if (!this.text) return

    const titleSize = this.titleSize || laneConfig.titleSize
    const titleBox = this.getTitleTextBox()
    const textAnchor = this.isCollapsed
      ? { x: titleBox.x, y: titleBox.y }
      : getTitleLayout(
          { x: this.x, y: this.y, width: this.width, height: this.height },
          this.getResolvedTitlePosition(),
          titleSize,
        ).textAnchor

    if (this.text.x !== textAnchor.x || this.text.y !== textAnchor.y) {
      this.text = {
        ...this.text,
        x: textAnchor.x,
        y: textAnchor.y,
      }
    }
  }

  updateTextPosition() {
    this.setTextPosition()
  }
}

export default null
