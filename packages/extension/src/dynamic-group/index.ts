import LogicFlow, {
  BaseEdgeModel,
  BaseNodeModel,
  EventType,
  CallbackArgs,
  Model,
  transformNodeData,
  transformEdgeData,
} from '@logicflow/core'
import { assign, cloneDeep, filter, forEach, has, map, sortBy } from 'lodash-es'
import { DynamicGroupNode } from './node'
import { DynamicGroupNodeModel } from './model'
import { isAllowMoveTo, isBoundsInGroup } from './utils'

import GraphConfigData = LogicFlow.GraphConfigData
import GraphElements = LogicFlow.GraphElements
import EdgeConfig = LogicFlow.EdgeConfig
import EdgeData = LogicFlow.EdgeData
import NodeData = LogicFlow.NodeData
import BoxBoundsPoint = Model.BoxBoundsPoint
import ElementsInfoInGroup = DynamicGroup.ElementsInfoInGroup

export * from './node'
export * from './model'

export const dynamicGroup = {
  type: 'dynamic-group',
  view: DynamicGroupNode,
  model: DynamicGroupNodeModel,
}

const DEFAULT_TOP_Z_INDEX = -1000
const DEFAULT_BOTTOM_Z_INDEX = -10000

export class DynamicGroup {
  static pluginName = 'dynamicGroup'

  private lf: LogicFlow
  topGroupZIndex: number = DEFAULT_BOTTOM_Z_INDEX
  // 激活态的 group 节点
  activeGroup?: DynamicGroupNodeModel
  // 存储节点与 group 的映射关系
  nodeGroupMap: Map<string, string> = new Map()

  constructor({ lf, options }: LogicFlow.IExtensionProps) {
    lf.register(dynamicGroup)
    this.lf = lf
    assign(this, options)
    // 初始化插件，从监听事件开始及设置规则开始
    this.init()
  }

  /**
   * 获取节点所属的分组
   * @param nodeId
   */
  getGroupByNodeId(nodeId: string) {
    const groupId = this.nodeGroupMap.get(nodeId)
    if (groupId) {
      return this.lf.getNodeModelById(groupId)
    }
  }

  /**
   * 获取自定位置及其所属分组
   * 当分组重合时，优先返回最上层的分组
   * @param bounds
   * @param nodeData
   */
  getGroupByBounds(
    bounds: BoxBoundsPoint,
    nodeData: NodeData,
  ): DynamicGroupNodeModel | undefined {
    const { nodes } = this.lf.graphModel
    const groups = filter(nodes, (node) => {
      return (
        !!node.isGroup &&
        isBoundsInGroup(bounds, node) &&
        node.id !== nodeData.id
      )
    })

    const count = groups.length
    if (count <= 1) {
      return groups[0] as DynamicGroupNodeModel
    } else {
      let topZIndexGroup = groups[count - 1]
      for (let i = count - 2; i >= 0; i--) {
        if (groups[i].zIndex > topZIndexGroup.zIndex) {
          topZIndexGroup = groups[i]
        }
      }
      return topZIndexGroup as DynamicGroupNodeModel
    }
  }

  /**
   * 提高元素的层级，如果是 group，同时提高其子元素的层级
   * @param model
   */
  sendNodeToFront(model?: BaseNodeModel) {
    if (!model || !model.isGroup) return

    this.topGroupZIndex++
    model.setZIndex(this.topGroupZIndex)
    if (model.children) {
      const { children } = model as DynamicGroupNodeModel
      forEach(Array.from(children), (nodeId) => {
        const node = this.lf.getNodeModelById(nodeId)
        this.sendNodeToFront(node)
      })
    }
  }

  /**
   * 递归计算某个分组内最高的 zIndex 值
   * TODO: 这块儿有点疑问❓如果 node 不是 group，这块儿返回的 maxZIndex 是最小值，但 node 的 zIndex 不一定是这个值
   * @param node
   */
  getMaxZIndex(node: BaseNodeModel) {
    let maxZIndex = DEFAULT_BOTTOM_Z_INDEX
    if (node.isGroup) {
      maxZIndex = Math.max(maxZIndex, node.zIndex)
    }
    if (node.children) {
      const { children } = node as DynamicGroupNodeModel
      forEach(Array.from(children), (childId) => {
        const child = this.lf.getNodeModelById(childId)
        if (child?.isGroup) {
          const childMaxZIndex = this.getMaxZIndex(child)
          maxZIndex = Math.max(maxZIndex, childMaxZIndex)
        }
      })
    }
    return maxZIndex
  }

  /**
   * 校准当前 topGroupZIndex 的值
   * @param nodes
   */
  calibrateTopGroupZIndex(nodes: NodeData[]) {
    // 初始化时 or 增加新节点时，找出所有 nodes 的最大 zIndex
    let maxZIndex = DEFAULT_BOTTOM_Z_INDEX
    forEach(nodes, (node) => {
      const nodeModel = this.lf.getNodeModelById(node.id)
      if (nodeModel) {
        const currNodeMaxZIndex = this.getMaxZIndex(nodeModel)
        if (currNodeMaxZIndex > maxZIndex) {
          maxZIndex = currNodeMaxZIndex
        }
      }
    })

    // TODO: 不是很理解这块儿的代码逻辑，需要整理一下
    if (this.topGroupZIndex >= maxZIndex) {
      // 一般是初始化时/增加新节点时发生，因为外部强行设置了一个很大的 zIndex
      // 删除节点不会影响目前最高 zIndex 的赋值
      return
    }

    // 新增 nodes 中如果存在 zIndex 比 this.topGroupZIndex 大
    // 说明 this.topGroupZIndex 已经失去意义，代表不了目前最高 zIndex 的 group，需要重新校准

    // https://github.com/didi/LogicFlow/issues/1535
    // 当外部直接设置多个 BaseNode.zIndex = 1 时
    // 当点击某一个 node 时，由于这个 this.topGroupZIndex 是从 -10000 开始计算的，
    // this.topGroupZIndex + 1 也就是-9999，这就造成当前点击的 node 的 zIndex 远远
    // 比其它 node 的 zIndex 小，因此造成 zIndex 错乱的问题
    // TODO: 这儿的 nodes 能否直接用传参进来的 nodes 呢？？？
    const allNodes = this.lf.graphModel.nodes
    const allGroups = filter(allNodes, (node) => !!node.isGroup)

    let max = this.topGroupZIndex
    forEach(allGroups, (group) => {
      if (group.zIndex > max) max = group.zIndex
    })
    this.topGroupZIndex = max
  }

  // 监听 LogicFlow 的相关事件，做对应的处理
  addNodeToGroup = ({ data: node }: CallbackArgs<'node:add'>) => {
    // 1. 如果该节点之前已经在 group 中了，则将其从之前的 group 移除
    const preGroupId = this.nodeGroupMap.get(node.id)

    if (preGroupId) {
      const group = this.lf.getNodeModelById(
        preGroupId,
      ) as DynamicGroupNodeModel

      group.removeChild(node.id)
      this.nodeGroupMap.delete(node.id)
      group.setAllowAppendChild(false)
    }

    // 2. 然后再判断这个节点是否在某个 group 范围内，如果是，则将其添加到对应的 group 中
    const nodeModel = this.lf.getNodeModelById(node.id)
    const bounds = nodeModel?.getBounds()

    if (nodeModel && bounds) {
      // TODO: 确认下面的注释内容
      // https://github.com/didi/LogicFlow/issues/1261
      // 当使用 SelectionSelect 框选后触发 lf.addNode(Group)
      // 会触发 appendNodeToGroup() 的执行
      // 由于 this.getGroup() 会判断 node.id !== nodeData.id
      // 因此当 addNode 是 Group 类型时，this.getGroup() 会一直返回空
      // 导致了下面这段代码无法执行，也就是无法将当前添加的 Group 添加到 this.nodeGroupMap 中
      // 这导致了折叠分组时触发的 foldEdge() 无法正确通过 getNodeGroup() 拿到正确的 groupId
      // 从而导致折叠分组时一直都会创建一个虚拟边
      // 而初始化分组时由于正确设置了nodeGroupMap的数据，因此不会产生虚拟边的错误情况
      if (nodeModel.isGroup) {
        const group = nodeModel as DynamicGroupNodeModel
        forEach(Array.from(group.children), (childId) => {
          this.nodeGroupMap.set(childId, node.id)
        })
        // 新增 node 时进行 this.topGroupZIndex 的校准更新
        this.calibrateTopGroupZIndex([node])
        this.onNodeSelect({
          data: node,
          isSelected: false,
          isMultiple: false,
        })
      }

      // TODO: 找到这个范围内的 groupModel, 并加 node 添加到该 group
      const group = this.getGroupByBounds(bounds, node)
      if (group) {
        const isAllowAppendIn = group.isAllowAppendIn(node)
        console.log('isAllowAppendIn', isAllowAppendIn)
        if (isAllowAppendIn) {
          group.addChild(node.id)
          // 建立节点与 group 的映射关系放在了 group.addChild 触发的事件中，与直接调用 addChild 的行为保持一致
          // TODO 下面这个是干什么的，是否需要一起移动到事件的逻辑中？
          group.setAllowAppendChild(true)
        } else {
          // 抛出不允许插入的事件
          this.lf.emit('group:not-allowed', {
            group: group.getData(),
            node,
          })
        }
      }
    }
  }

  onGroupAddNode = ({
    data: groupData,
    childId,
  }: CallbackArgs<'group:add-node'>) => {
    console.log('group:add-node', groupData)
    this.nodeGroupMap.set(childId, groupData.id)
  }

  removeNodeFromGroup = ({
    data: node,
    model,
  }: CallbackArgs<'node:delete'>) => {
    if (model.isGroup && node.children) {
      forEach(
        Array.from((node as DynamicGroupNodeModel).children),
        (childId) => {
          this.nodeGroupMap.delete(childId)
          this.lf.deleteNode(childId)
        },
      )
    }

    const groupId = this.nodeGroupMap.get(node.id)
    if (groupId) {
      const group = this.lf.getNodeModelById(groupId)
      group && (group as DynamicGroupNodeModel).removeChild(node.id)
      this.nodeGroupMap.delete(node.id)
    }
  }

  setActiveGroup = ({ data: node }: CallbackArgs<'node:drag'>) => {
    const nodeModel = this.lf.getNodeModelById(node.id)
    const bounds = nodeModel?.getBounds()

    if (nodeModel && bounds) {
      const targetGroup = this.getGroupByBounds(bounds, node)
      if (this.activeGroup) {
        this.activeGroup.setAllowAppendChild(false)
      }

      if (!targetGroup || (nodeModel.isGroup && targetGroup.id === node.id)) {
        return
      }

      const isAllowAppendIn = targetGroup.isAllowAppendIn(node)
      if (!isAllowAppendIn) return

      this.activeGroup = targetGroup
      console.log('this.activeGroup', this.activeGroup)
      this.activeGroup.setAllowAppendChild(true)
    }
  }

  /**
   * 1. 分组节点默认在普通节点下面
   * 2. 分组节点被选中后，会将分组节点以及其内部的其它分组节点放到其余分组节点的上面
   * 3. 分组节点取消选中后，不会将分组节点重置为原来的高度
   * 4. 由于 LogicFlow 核心目标是支持用户手动绘制流程图，所以暂时不支持一张流程图超过 1000 个分组节点的情况
   * @param node
   * @param isMultiple
   * @param isSelected
   */
  onNodeSelect = ({
    data: node,
    isMultiple,
    isSelected,
  }: Omit<CallbackArgs<'node:click'>, 'e' | 'position'>) => {
    const nodeModel = this.lf.getNodeModelById(node.id)
    this.sendNodeToFront(nodeModel)

    // 重置所有 group 的 zIndex，防止 group 节点 zIndex 增长为正数（目的是保持 group 节点在最底层）
    if (this.topGroupZIndex > DEFAULT_TOP_Z_INDEX) {
      const { nodes } = this.lf.graphModel
      this.topGroupZIndex = DEFAULT_BOTTOM_Z_INDEX
      const groups = sortBy(
        filter(nodes, (node) => !!node.isGroup),
        'zIndex',
      )

      let preZIndex = 0
      forEach(groups, (group) => {
        if (group.zIndex !== preZIndex) {
          this.topGroupZIndex++
          preZIndex = group.zIndex
        }
        group.setZIndex(this.topGroupZIndex)
      })
    }

    // FIX #1004
    // 如果节点被多选，
    // 这个节点是分组，则将分组的所有子节点取消选中
    // 这个节点是分组的子节点，且其所属分组节点已选，则取消选中
    if (isMultiple && isSelected) {
      if (nodeModel?.isGroup) {
        const { children } = nodeModel as DynamicGroupNodeModel
        forEach(Array.from(children), (childId) => {
          const childModel = this.lf.getNodeModelById(childId)
          childModel?.setSelected(false)
        })
      } else {
        const groupId = this.nodeGroupMap.get(node.id)
        if (groupId) {
          const graphModel = this.lf.getNodeModelById(groupId)
          graphModel?.isSelected && nodeModel?.setSelected(false)
        }
      }
    }
  }

  onNodeMove = ({
    deltaX,
    deltaY,
    data,
  }: Omit<CallbackArgs<'node:mousemove'>, 'e' | 'position'>) => {
    const { id, x, y, properties } = data
    if (!properties) {
      return
    }
    const { width, height } = properties
    const groupId = this.nodeGroupMap.get(id)
    if (!groupId) {
      return
    }
    const groupModel = this.lf.getNodeModelById(
      groupId,
    ) as DynamicGroupNodeModel

    if (!groupModel || !groupModel.isRestrict || !groupModel.autoResize) {
      return
    }
    // 当父节点isRestrict=true & autoResize=true
    // 子节点在父节点中移动时，父节点会自动调整大小

    // step1: 计算出当前child的bounds
    const newX = x + deltaX / 2
    const newY = y + deltaY / 2
    const minX = newX - width! / 2
    const minY = newY - height! / 2
    const maxX = newX + width! / 2
    const maxY = newY + height! / 2
    // step2：比较当前child.bounds与parent.bounds的差异，比如child.minX<parent.minX，那么parent.minX=child.minX
    let hasChange = false
    const groupBounds = groupModel.getBounds()
    const newGroupBounds = Object.assign({}, groupBounds)
    if (minX < newGroupBounds.minX) {
      newGroupBounds.minX = minX
      hasChange = true
    }
    if (minY < newGroupBounds.minY) {
      newGroupBounds.minY = minY
      hasChange = true
    }
    if (maxX > newGroupBounds.maxX) {
      newGroupBounds.maxX = maxX
      hasChange = true
    }
    if (maxY > newGroupBounds.maxY) {
      newGroupBounds.maxY = maxY
      hasChange = true
    }
    if (!hasChange) {
      return
    }
    // step3: 根据当前parent.bounds去计算出最新的x、y、width、height
    const newGroupX =
      newGroupBounds.minX + (newGroupBounds.maxX - newGroupBounds.minX) / 2
    const newGroupY =
      newGroupBounds.minY + (newGroupBounds.maxY - newGroupBounds.minY) / 2
    const newGroupWidth = newGroupBounds.maxX - newGroupBounds.minX
    const newGroupHeight = newGroupBounds.maxY - newGroupBounds.minY
    groupModel.moveTo(newGroupX, newGroupY)
    groupModel.width = newGroupWidth
    groupModel.height = newGroupHeight
  }

  onGraphRendered = ({ data }: CallbackArgs<'graph:rendered'>) => {
    console.log('data', data)
    forEach(data.nodes, (node) => {
      if (node.children) {
        forEach(node.children, (childId) => {
          this.nodeGroupMap.set(childId, node.id)
        })
      }
    })

    // TODO: 确认一下下面方法的必要性及合理性
    // 初始化 nodes 时进行 this.topGroupZIndex 的校准更新
    this.calibrateTopGroupZIndex(data.nodes)
  }

  removeChildrenInGroupNodeData<
    T extends LogicFlow.NodeData | LogicFlow.NodeConfig,
  >(nodeData: T) {
    const newNodeData = cloneDeep(nodeData)
    delete newNodeData.children
    if (newNodeData.properties?.children) {
      delete newNodeData.properties.children
    }
    return newNodeData
  }

  /**
   * 创建一个 Group 类型节点内部所有子节点的副本
   * 并且在遍历所有 nodes 的过程中，顺便拿到所有 edges (只在 Group 范围的 edges)
   */
  initGroupChildNodes(
    nodeIdMap: Record<string, string>,
    children: Set<string>,
    curGroup: DynamicGroupNodeModel,
    distance: number,
  ): ElementsInfoInGroup {
    // Group 中所有子节点
    const allChildNodes: BaseNodeModel[] = []
    // 属于 Group 内部边的 EdgeData
    const edgesDataArr: EdgeData[] = []
    // 所有有关联的连线
    const allRelatedEdges: BaseEdgeModel[] = []

    forEach(Array.from(children), (childId: string) => {
      const childNode = this.lf.getNodeModelById(childId)
      if (childNode) {
        const childNodeChildren = childNode.children
        const childNodeData = childNode.getData()
        const eventType = EventType.NODE_GROUP_COPY || 'node:group-copy-add'

        const newNodeConfig = transformNodeData(
          this.removeChildrenInGroupNodeData(childNodeData),
          distance,
        )
        const tempChildNode = this.lf.addNode(newNodeConfig, eventType)
        curGroup.addChild(tempChildNode.id)

        nodeIdMap[childId] = tempChildNode.id // id 同 childId，做映射存储
        allChildNodes.push(tempChildNode)

        // 1. 存储 children 内部节点相关的输入边（incoming）
        allRelatedEdges.push(
          ...[...tempChildNode.incoming.edges, ...tempChildNode.outgoing.edges],
        )

        if (childNodeChildren instanceof Set) {
          const { childNodes, edgesData } = this.initGroupChildNodes(
            nodeIdMap,
            childNodeChildren,
            tempChildNode as DynamicGroupNodeModel,
            distance,
          )

          allChildNodes.push(...childNodes)
          edgesDataArr.push(...edgesData)
        }
      }
    })

    // TODO: 确认，递归的方式，是否将所有嵌套的边数据都有返回
    console.log('allRelatedEdges -->>', allRelatedEdges)

    // 1. 判断每一条边的开始节点、目标节点是否在 Group 中
    const edgesInnerGroup = filter(allRelatedEdges, (edge) => {
      return (
        has(nodeIdMap, edge.sourceNodeId) && has(nodeIdMap, edge.targetNodeId)
      )
    })
    // 2. 为「每一条 Group 的内部边」构建出 EdgeData 数据，得到 EdgeConfig，生成新的线
    const edgesDataInnerGroup = map(edgesInnerGroup, (edge) => {
      return edge.getData()
    })

    return {
      childNodes: allChildNodes,
      edgesData: edgesDataArr.concat(edgesDataInnerGroup),
    }
  }

  /**
   * 根据参数 edge 选择是新建边还是基于已有边，复制一条边出来
   * @param edge
   * @param nodeIdMap
   * @param distance
   */
  createEdge(
    edge: EdgeConfig | EdgeData,
    nodeIdMap: Record<string, string>,
    distance: number,
  ) {
    const { sourceNodeId, targetNodeId } = edge
    const sourceId = nodeIdMap[sourceNodeId] ?? sourceNodeId
    const targetId = nodeIdMap[targetNodeId] ?? targetNodeId

    // 如果是有 id 且 text 是对象的边，需要重新计算位置，否则直接用 edgeConfig 生成边
    let newEdgeConfig = cloneDeep(edge)
    if (edge.id && typeof edge.text === 'object' && edge.text !== null) {
      newEdgeConfig = transformEdgeData(edge as EdgeData, distance)
    }

    return this.lf.graphModel.addEdge({
      ...newEdgeConfig,
      sourceNodeId: sourceId,
      targetNodeId: targetId,
    })
  }

  /**
   * 检测group:resize后的bounds是否会小于children的bounds
   * 限制group进行resize时不能小于内部的占地面积
   * @param groupModel
   * @param deltaX
   * @param deltaY
   * @param newWidth
   * @param newHeight
   */
  checkGroupBoundsWithChildren(
    groupModel: DynamicGroupNodeModel,
    deltaX: number,
    deltaY: number,
    newWidth: number,
    newHeight: number,
  ) {
    if (groupModel.children) {
      const { children, x, y } = groupModel
      // 根据deltaX和deltaY计算出当前model的bounds
      const newX = x + deltaX / 2
      const newY = y + deltaY / 2
      const groupMinX = newX - newWidth / 2
      const groupMinY = newY - newHeight / 2
      const groupMaxX = newX + newWidth / 2
      const groupMaxY = newY + newHeight / 2

      const childrenArray = Array.from(children)
      for (let i = 0; i < childrenArray.length; i++) {
        const childId = childrenArray[i]
        const child = this.lf.getNodeModelById(childId)
        if (!child) {
          continue
        }
        const childBounds = child.getBounds()
        const { minX, minY, maxX, maxY } = childBounds
        // parent:resize后的bounds不能小于child:bounds，否则阻止其resize
        const canResize =
          groupMinX <= minX &&
          groupMinY <= minY &&
          groupMaxX >= maxX &&
          groupMaxY >= maxY
        if (!canResize) {
          return false
        }
      }
    }

    return true
  }

  /**
   * Group 插件的初始化方法
   * TODO：1. 待讨论，可能之前插件分类是有意义的 components, material, tools
   * 区别是：1. 有些插件就是自定义节点，可能会有初始化方法 init，但不必要有 render （比如 Group）
   * 2. 有些插件是渲染一些部件（比如 MiniMap、Control、Menu 等）必须要有 render
   * 3. 工具类的，init 、 render
   * 该如何分类呢？并如何完善插件的类型
   *
   * TODO: 2. 插件的 destroy 方法该做些什么，是否应该加 destroy 方法
   * TODO: 3. 是否应该定义一个 Extension 的基类，所有插件基于这个基类来开发，这样在初始化的时候就可以确认执行什么方法
   */
  init() {
    const { lf } = this
    const { graphModel } = lf
    // 添加分组节点移动规则
    // 1. 移动分组节点时，同时移动分组内所有节点
    // 2. 移动子节点时，判断是否有限制规则（isRestrict）
    graphModel.addNodeMoveRules((model, deltaX, deltaY) => {
      // 判断如果是 group，移动时需要同时移动组内的所有节点
      if (model.isGroup) {
        // https://github.com/didi/LogicFlow/issues/1826
        // 这里不应该触发移动子节点的逻辑，这里是判断是否可以移动，而不是触发移动逻辑
        // 而且这里触发移动，会导致resize操作的this.x变动也会触发子item的this.x变动
        // resize时的deltaX跟正常移动的deltaX是不同的

        // const nodeIds = this.getNodesInGroup(model as DynamicGroupNodeModel)
        // graphModel.moveNodes(nodeIds, deltaX, deltaY, true)
        return true
      }

      const groupId = this.nodeGroupMap.get(model.id)!
      const groupModel = this.lf.getNodeModelById(
        groupId,
      ) as DynamicGroupNodeModel

      if (groupModel && groupModel.isRestrict) {
        if (groupModel.autoResize) {
          // 子节点在父节点中移动时，父节点会自动调整大小
          // 在node:mousemove中进行父节点的调整
          return true
        } else {
          // 如果移动的节点存在于某个分组中，且这个分组禁止子节点移出去
          const groupBounds = groupModel.getBounds()
          return isAllowMoveTo(groupBounds, model, deltaX, deltaY)
        }
      }

      return true
    })

    // https://github.com/didi/LogicFlow/issues/1442
    // https://github.com/didi/LogicFlow/issues/937
    // 添加分组节点resize规则
    // isRestrict限制模式下，当前model resize时不能小于children的占地面积
    // 并且在isRestrict限制模式下，transformWidthContainer即使设置为true，也无效
    graphModel.addNodeResizeRules((model, deltaX, deltaY, width, height) => {
      if (model.isGroup && model.isRestrict) {
        return this.checkGroupBoundsWithChildren(
          model as DynamicGroupNodeModel,
          deltaX,
          deltaY,
          width,
          height,
        )
      }
      return true
    })

    graphModel.dynamicGroup = this

    lf.on('node:add,node:drop,node:dnd-add', this.addNodeToGroup)
    lf.on('node:delete', this.removeNodeFromGroup)
    lf.on('node:drag,node:dnd-drag', this.setActiveGroup)
    lf.on('node:click', this.onNodeSelect)
    lf.on('node:mousemove', this.onNodeMove)
    lf.on('graph:rendered', this.onGraphRendered)

    lf.on('graph:updated', ({ data }) => console.log('data', data))

    lf.on('group:add-node', this.onGroupAddNode)

    // https://github.com/didi/LogicFlow/issues/1346
    // 重写 addElements() 方法，在 addElements() 原有基础上增加对 group 内部所有 nodes 和 edges 的复制功能
    // 使用场景：addElements api 项目内部目前只在快捷键粘贴时使用（此处解决的也应该是粘贴场景的问题）
    lf.addElements = (
      { nodes: selectedNodes, edges: selectedEdges }: GraphConfigData,
      distance = 40,
    ): GraphElements => {
      // oldNodeId -> newNodeId 映射 Map
      const nodeIdMap: Record<string, string> = {}
      // 本次添加的所有节点和边
      const elements: GraphElements = {
        nodes: [],
        edges: [],
      }
      // 所有属于分组内的边 -> sourceNodeId 和 targetNodeId 都在 Group 内
      const edgesInnerGroup: EdgeData[] = []

      forEach(selectedNodes, (node) => {
        const originId = node.id
        const children = node.properties?.children ?? node.children

        const model = lf.addNode(this.removeChildrenInGroupNodeData(node))

        if (originId) nodeIdMap[originId] = model.id
        elements.nodes.push(model) // 此时为 group 的 nodeModel

        // TODO: 递归创建 group 的 nodeModel 的 children
        if (model.isGroup) {
          const { edgesData } = this.initGroupChildNodes(
            nodeIdMap,
            children,
            model as DynamicGroupNodeModel,
            distance,
          )
          edgesInnerGroup.push(...edgesData)
        }
      })

      forEach(edgesInnerGroup, (edge) => {
        this.createEdge(edge, nodeIdMap, distance)
      })

      console.log('selectedEdges --->>>', selectedEdges)
      forEach(selectedEdges, (edge) => {
        elements.edges.push(this.createEdge(edge, nodeIdMap, distance))
      })

      // 返回 elements 进行选中效果，即触发 element.selectElementById()
      // shortcut.ts 也会对最外层的 nodes 和 edges 进行偏移，即 translationNodeData()
      return elements
    }

    this.render()
  }

  render() {}

  destroy() {
    // 销毁监听的事件，并移除渲染的 dom 内容
    this.lf.off('node:add,node:drop,node:dnd-add', this.addNodeToGroup)
    this.lf.off('node:delete', this.removeNodeFromGroup)
    this.lf.off('node:drag,node:dnd-drag', this.setActiveGroup)
    this.lf.off('node:click', this.onNodeSelect)
    this.lf.off('node:mousemove', this.onNodeMove)
    this.lf.off('graph:rendered', this.onGraphRendered)
    this.lf.off('group:add-node', this.onGroupAddNode)

    // 还原 lf.addElements 方法？
    // 移除 graphModel 上重写的 addNodeMoveRules 方法？
    // TODO: 讨论一下插件该具体做些什么
  }
}

export namespace DynamicGroup {
  export type ElementsInfoInGroup = {
    childNodes: BaseNodeModel[] // 分组节点的所有子节点 model
    edgesData: EdgeData[] // 属于分组内的线的 EdgeData (即开始节点和结束节点都在 Group 内)
  }

  export type DynamicGroupOptions = Partial<{
    isCollapsed: boolean
  }>
}

export default DynamicGroup
