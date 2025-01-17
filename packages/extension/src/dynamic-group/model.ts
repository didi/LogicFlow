import LogicFlow, {
  observable,
  BaseEdgeModel,
  ElementType,
  GraphModel,
  IRectNodeProperties,
  RectNodeModel,
} from '@logicflow/core'
import { forEach } from 'lodash-es'

import NodeData = LogicFlow.NodeData
import NodeConfig = LogicFlow.NodeConfig
import EdgeConfig = LogicFlow.EdgeConfig

export type IGroupNodeProperties = {
  /**
   * 当前分组中的节点 id
   */
  children?: string[]
  /**
   * 分组节点是否可以折叠
   */
  collapsible?: boolean
  /**
   * 分组节点折叠状态
   */
  isCollapsed?: boolean
  /**
   * 子节点是否限制移动范围
   * 默认为 false，允许拖拽移除分组
   */
  isRestrict?: boolean
  /**
   * isRestrict 模式启用时，
   * 如果同时设置 autoResize 为 true，
   * 那么子节点在父节点中移动时，父节点会自动调整大小
   */
  autoResize?: boolean

  /**
   * 分组节点的收起状态宽高
   */
  collapsedWidth?: number
  collapsedHeight?: number
  // 默认宽高作为 group 的展开宽高
  // /**
  //  * 分组节点的展开状态宽高
  //  */
  // expandWidth?: number
  // expandHeight?: number

  /**
   * 缩放或旋转容器时，是否缩放或旋转组内节点
   */
  transformWithContainer?: boolean

  /**
   * 当前分组元素的 zIndex
   */
  zIndex?: number
  /**
   * 分组节点是否自动置顶
   */
  autoToFront?: boolean

  // 节点是否允许添加到分组中，是否可以通过 properties 的方式传入
  // TODO: 函数类型的 properties 该如何传入
  isAllowAppendIn?: (_nodeData) => boolean
} & IRectNodeProperties

// 分组节点默认展开时的大小
const DEFAULT_GROUP_EXPAND_WIDTH = 400
const DEFAULT_GROUP_EXPAND_HEIGHT = 230
// 分组节点默认收起时的大小
const DEFAULT_GROUP_COLLAPSE_WIDTH = 80
const DEFAULT_GROUP_COLLAPSE_HEIGHT = 60

const DEFAULT_BOTTOM_Z_INDEX = -10000

export class DynamicGroupNodeModel extends RectNodeModel<IGroupNodeProperties> {
  readonly isGroup = true

  // 保存组内的节点
  children!: Set<string>
  // 是否限制组内节点的移动范围。默认不限制 TODO: 完善该功能
  isRestrict: boolean = false
  // isRestrict 模式启用时，如果同时设置 autoResize 为 true，那么子节点在父节点中移动时，父节点会自动调整大小
  autoResize: boolean = false
  // 分组节点是否可以折叠
  collapsible: boolean = true

  // 分组节点 初始化尺寸(默认展开)，后续支持从 properties 中传入 width 和 height 设置
  expandWidth!: number
  expandHeight!: number
  // 折叠后
  collapsedWidth!: number
  collapsedHeight!: number

  // 当前组是否收起状态
  @observable isCollapsed: boolean = false
  // 当前分组是否在可添加状态 - 实时状态
  @observable groupAddable: boolean = false
  // 缩放或旋转容器时，是否缩放或旋转组内节点
  @observable transformWithContainer: boolean = false
  childrenLastCollapseStateDict: Map<string, boolean> = new Map()

  constructor(data: NodeConfig<IGroupNodeProperties>, graphModel: GraphModel) {
    super(data, graphModel)
    this.childrenLastCollapseStateDict = new Map()

    this.initNodeData(data)
    this.setAttributes()
  }

  initNodeData(data: LogicFlow.NodeConfig<IGroupNodeProperties>) {
    super.initNodeData(data)

    const {
      children,
      width,
      height,
      collapsedWidth,
      collapsedHeight,

      collapsible,
      isCollapsed,
      zIndex,
      isRestrict,
      autoResize,
      autoToFront,
      transformWithContainer,
    } = data.properties ?? {}

    this.children = children ? new Set(children) : new Set()
    this.zIndex = zIndex ?? DEFAULT_BOTTOM_Z_INDEX
    this.isCollapsed = isCollapsed ?? false

    const expandWidth = width ?? DEFAULT_GROUP_EXPAND_WIDTH
    const expandHeight = height ?? DEFAULT_GROUP_EXPAND_HEIGHT

    // 初始化分组节点的宽高数据
    this.width = expandWidth
    this.height = expandHeight
    this.expandWidth = expandWidth
    this.expandHeight = expandHeight
    this.collapsedWidth = collapsedWidth ?? DEFAULT_GROUP_COLLAPSE_WIDTH
    this.collapsedHeight = collapsedHeight ?? DEFAULT_GROUP_COLLAPSE_HEIGHT

    this.isRestrict = isRestrict ?? false
    this.transformWithContainer = transformWithContainer ?? false
    this.autoResize = autoResize ?? false
    this.collapsible = collapsible ?? true
    this.autoToFront = autoToFront ?? false

    // 禁用掉 Group 节点的文本编辑能力
    this.text.editable = false
    this.text.draggable = false
  }

  setAttributes() {
    super.setAttributes()
  }

  getData(): NodeData {
    const data = super.getData()
    const children: string[] = []

    forEach(Array.from(this.children), (childId) => {
      const model = this.graphModel.getNodeModelById(childId)
      if (model && !model.virtual) {
        children.push(childId)
      }
    })
    data.children = children

    if (data.properties) {
      data.properties.children = children
      data.properties.isCollapsed = this.isCollapsed
    }

    return data
  }

  /**
   * 获取分组内的节点
   * @param groupModel
   */
  getNodesInGroup(groupModel: DynamicGroupNodeModel): string[] {
    const nodeIds: string[] = []
    if (groupModel.isGroup) {
      forEach(Array.from(groupModel.children), (nodeId: string) => {
        nodeIds.push(nodeId)
      })
    }
    return nodeIds
  }

  getMoveDistance(
    deltaX: number,
    deltaY: number,
    isIgnoreRule = false,
  ): [number, number] {
    const [moveDeltaX, moveDeltaY] = super.getMoveDistance(
      deltaX,
      deltaY,
      isIgnoreRule,
    )
    const nodeIds = this.getNodesInGroup(this)
    this.graphModel.moveNodes(nodeIds, deltaX, deltaY, isIgnoreRule)
    return [moveDeltaX, moveDeltaY]
  }

  /**
   * 重写 getHistoryData 方法
   */
  getHistoryData(): NodeData {
    const data = super.getHistoryData()
    data.children = Array.from(this.children)
    data.isGroup = true

    const {
      x,
      y,
      collapsedWidth,
      collapsedHeight,
      expandWidth,
      expandHeight,
      isCollapsed,
    } = this
    if (isCollapsed) {
      // 如果当前是折叠模式
      // 存入history的时候，将坐标恢复到未折叠前的坐标数据
      // 因为拿出history数据的时候，会触发collapse()进行坐标的折叠计算
      data.x = x + expandWidth / 2 - collapsedWidth / 2
      data.y = y + expandHeight / 2 - collapsedHeight / 2
      if (data.text) {
        data.text.x = data.text.x + expandWidth / 2 - collapsedWidth / 2
        data.text.y = data.text.y + expandHeight / 2 - collapsedHeight / 2
      }
    }
    return data
  }

  /**
   * 触发分组节点的「折叠 or 展开」动作
   * 1. 折叠分组的宽高
   * 2. 处理分组子节点
   * 3. 处理连线
   * @param collapse {boolean} true -> 折叠；false -> 展开
   */
  toggleCollapse(collapse?: boolean) {
    const nextCollapseState = !!collapse
    this.isCollapsed = nextCollapseState
    // step 1
    if (nextCollapseState) {
      this.collapse()
    } else {
      this.expand()
    }

    // step 2
    let allRelatedEdges = [...this.incoming.edges, ...this.outgoing.edges]
    const childrenArr = Array.from(this.children)

    forEach(childrenArr, (elementId) => {
      // FIX: 当使用 graphModel.getElement 获取元素时，会因为
      // const model = this.graphModel.getElement(elementId)
      const model = this.graphModel.elementsModelMap.get(elementId)

      if (model) {
        // TODO: ??? 普通节点有这个属性吗？确认这个代码的意义
        const collapseStatus = model.isCollapsed
        // FIX: https://github.com/didi/LogicFlow/issues/1007
        // 下面代码片段，针对 Group 节点执行
        if (model.isGroup) {
          const groupModel = model as DynamicGroupNodeModel

          if (!groupModel.isCollapsed) {
            // 正常情况下，parent 折叠后，children 也应该折叠
            // 因此当前 parent 准备展开时，children 的目前状态肯定是折叠状态，也就是 model.isCollapsed 为 true，这个代码块不会触发
            // 只有当 parent 准备折叠时，children 目前状态才有可能是展开
            // 即 model.isCollapsed 为 false，这个代码块触发, 此时 isCollapse 为 true，触发 children 也进行折叠
            groupModel.toggleCollapse(collapse)
          }

          if (!collapse) {
            // 当 parent 准备展开时，children 的值应该恢复到折叠前的状态
            const lastCollapseStatus =
              this.childrenLastCollapseStateDict?.get(elementId)
            if (
              lastCollapseStatus !== undefined &&
              lastCollapseStatus !== model.isCollapsed
            ) {
              // https://github.com/didi/LogicFlow/issues/1145
              // 当parent准备展开时，children的值肯定是折叠，也就是nodeModel.isCollapsed=true
              // 当parent准备展开时，如果children之前的状态是展开，则恢复展开状态
              groupModel.toggleCollapse(lastCollapseStatus)
            }
          }
        }

        this.childrenLastCollapseStateDict?.set(elementId, !!collapseStatus)
        model.visible = !collapse

        // 判断，如果是节点时，才去读取节点的 incoming 和 outgoing
        if (model.BaseType === ElementType.NODE) {
          const incomingEdges = model.incoming.edges
          const outgoingEdges = model.outgoing.edges

          allRelatedEdges = [
            ...allRelatedEdges,
            ...incomingEdges,
            ...outgoingEdges,
          ]
        }
      }
    })
    // step 3
    this.collapseEdge(nextCollapseState, allRelatedEdges)
  }

  // 折叠操作
  private collapse() {
    const { x, y, text, width, height, collapsedWidth, collapsedHeight } = this
    this.x = x - width / 2 + collapsedWidth / 2
    this.y = y - height / 2 + collapsedHeight / 2

    this.text.x = text.x - width / 2 + collapsedWidth / 2
    this.text.y = text.y - height / 2 + collapsedHeight / 2

    // 记录折叠前的节点大小，并将其记录到 expandWidth 中
    this.expandWidth = width
    this.expandHeight = height

    this.width = collapsedWidth
    this.height = collapsedHeight
  }

  // 展开操作
  private expand() {
    const {
      x,
      y,
      text,
      expandWidth,
      expandHeight,
      collapsedWidth,
      collapsedHeight,
    } = this
    this.width = expandWidth
    this.height = expandHeight

    // 重新计算节点及文本的坐标
    this.x = x + this.width / 2 - collapsedWidth / 2
    this.y = y + this.height / 2 - collapsedHeight / 2

    this.text.x = text.x + this.width / 2 - collapsedWidth / 2
    this.text.y = text.y + this.height / 2 - collapsedHeight / 2
  }

  createVirtualEdge(edgeConfig: EdgeConfig) {
    edgeConfig.pointsList = undefined

    const virtualEdge = this.graphModel.addEdge(edgeConfig)
    virtualEdge.virtual = true

    // TODO: 强制不保存 group 连线数据？？？-> 为什么注释掉？是不是不能强制设置为 null，会导致无法回填
    // virtualEdge.getData = () => null
    virtualEdge.text.editable = false
    virtualEdge.isCollapsedEdge = true // 这一行干啥的,TODO: 项目中没搜到应用的地方，是否应该移除
  }

  /**
   * 折叠分组的时候，需要处理分组自身的连线和分组内部子节点上的连线
   * 边的分类：
   *  - 虚拟边：分组被收起时，标识分组本身与外部节点关系的边
   *  - 真实边：分组本身或者分组内部节点与外部节点（非收起分组）关系的边
   * 如果一个分组，本身与外部节点有 M 条连线，且内部 N 个子节点与外部节点有连线，那么这个分组收起时会生成 M+N 条连线
   * 折叠分组时：
   *  - 原有的虚拟边删除
   *  - 创建一个虚拟边
   *  - 真实边则隐藏
   * 展开分组时：
   *  - 当前的虚拟边删除
   *  - 如果外部节点是收起的分组，则创建虚拟边
   *  - 如果外部节点是普通节点，则显示真实边
   *
   * @param collapse
   * @param edges
   */
  collapseEdge(collapse: boolean, edges: BaseEdgeModel[]) {
    const { graphModel } = this
    forEach(edges, (edge, idx) => {
      const edgeData = edge.getData()
      const { targetNodeId, sourceNodeId } = edgeData

      const edgeConfig: EdgeConfig = {
        ...edgeData,
        id: `${edgeData.id}__${idx}`,
        text: edgeData.text?.value,
      }

      if (edge.virtual) {
        graphModel.deleteEdgeById(edge.id)
      }
      // 考虑目标节点也属于分组的情况
      let targetNodeGroup =
        graphModel.dynamicGroup.getGroupByNodeId(targetNodeId)
      if (!targetNodeGroup) {
        targetNodeGroup = graphModel.getNodeModelById(targetNodeId)
      }

      // 考虑源节点也属于分组的情况
      let sourceNodeGroup =
        graphModel.dynamicGroup.getGroupByNodeId(sourceNodeId)
      if (!sourceNodeGroup) {
        sourceNodeGroup = graphModel.getNodeModelById(sourceNodeId)
      }

      // 折叠时，处理未被隐藏的边的逻辑 -> collapse
      if (collapse && edge.visible) {
        // 需要确认此分组节点是新连线的起点还是终点
        // 创建一个虚拟边，虚拟边相对于真实边，起点或者终点从一起分组节点的中心点开始 TODO：??? 确认什么意思
        // 如果需要被隐藏的边的起点在需要折叠的分组中，那么设置虚拟边的开始节点为此分组
        if (this.children.has(sourceNodeId) || this.id === sourceNodeId) {
          edgeConfig.startPoint = undefined
          edgeConfig.sourceNodeId = this.id
        } else {
          edgeConfig.endPoint = undefined
          edgeConfig.targetNodeId = this.id
        }

        // 如果边的起点和终点都在分组内部，则不创建新的虚拟边
        if (targetNodeGroup.id !== this.id || sourceNodeGroup.id !== this.id) {
          this.createVirtualEdge(edgeConfig)
        }
        edge.visible = false
      }

      // 展开时，处理被隐藏的边的逻辑 -> expand
      if (!collapse && !edge.visible) {
        // 展开分组时：判断真实边的起点和中带你是否有任一节点在已折叠分组中，如果不是，则显示真实边
        // 如果是，则修改这个边的对应目标节点 id 来创建虚拟边
        if (
          targetNodeGroup &&
          targetNodeGroup.isGroup &&
          targetNodeGroup.isCollapsed
        ) {
          edgeConfig.targetNodeId = targetNodeGroup.id
          edgeConfig.endPoint = undefined
          this.createVirtualEdge(edgeConfig)
        } else if (
          sourceNodeGroup &&
          sourceNodeGroup.isGroup &&
          sourceNodeGroup.isCollapsed
        ) {
          edgeConfig.sourceNodeId = sourceNodeGroup.id
          edgeConfig.startPoint = undefined
          this.createVirtualEdge(edgeConfig)
        } else {
          edge.visible = true
        }
      }
    })
  }

  /**
   * 是否允许此节点添加到该分组
   * TODO: 如何重写该方法呢？
   * @param _nodeData
   */
  // eslint-disable-next-line
  isAllowAppendIn(_nodeData: NodeData) {
    // TODO: 此处使用 this.properties.groupAddable 还是 this.groupAddable
    // this.groupAddable 是否存在更新不及时的问题
    return true
  }

  /**
   * 更新分组节点是否允许添加节点的属性
   * @param isAllow
   */
  setAllowAppendChild(isAllow: boolean) {
    // this.setProperty('groupAddable', isAllow)
    this.groupAddable = isAllow
  }

  /**
   * 添加节点至分组中
   * @param id
   */
  addChild(id: string) {
    this.children.add(id)
    const groupData = this.getData()
    this.graphModel.eventCenter.emit('group:add-node', {
      data: groupData,
      childId: id,
    })
  }

  /**
   * 从分组中移除某节点
   * @param id
   */
  removeChild(id: string) {
    this.children.delete(id)
    const groupData = this.getData()
    this.graphModel.eventCenter.emit('group:remove-node', { data: groupData })
  }

  /**
   * 当 groupA 被添加到 groupB 中时，将 groupB 及 groupB 所属的 group zIndex 减 1
   */
  toBack() {
    this.zIndex--
  }

  /**
   * 重写 Group 节点的 Resize Outline
   */
  getResizeOutlineStyle(): LogicFlow.CommonTheme {
    const style = super.getResizeOutlineStyle()
    style.stroke = 'none'
    return style
  }

  // TODO: 是否是设置 group 节点没有锚点，而不是设置成透明？？？
  getAnchorStyle() {
    const style = super.getAnchorStyle()
    style.stroke = 'transparent'
    style.fill = 'transparent'
    if (style.hover) {
      style.hover.fill = 'transparent'
      style.hover.stroke = 'transparent'
    }
    return style
  }

  /**
   * 设置分组节点 drop 区域的样式
   */
  getAddableOutlineStyle() {
    return {
      stroke: '#feb663',
      strokeWidth: 2,
      strokeDasharray: '4 4',
      fill: 'transparent',
    }
  }
}

export default DynamicGroupNodeModel
