import LogicFlow, { h, BaseEdgeModel } from '@logicflow/core'
import { isArray } from 'lodash-es'
import { RectResizeModel, RectResizeView } from '../../NodeResize'

import Point = LogicFlow.Point
import NodeData = LogicFlow.NodeData
import EdgeConfig = LogicFlow.EdgeConfig
import GraphElements = LogicFlow.GraphElements

const defaultWidth = 500
const defaultHeight = 300
const DEFAULT_BOTTOM_Z_INDEX = -10000

export class GroupNodeModel extends RectResizeModel {
  readonly isGroup = true
  /**
   * 此分组的子节点Id
   */
  children!: Set<string>
  /**
   * 其子节点是否被禁止通过拖拽移出分组。 默认false，允许拖拽移除分组。
   */
  isRestrict?: boolean
  /**
   * 分组节点是否允许折叠
   */
  foldable?: boolean
  /**
   * 折叠后的宽度
   */
  foldedWidth!: number
  /**
   * 折叠后的高度
   */
  foldedHeight!: number
  /**
   * 分组折叠状态
   */
  isFolded: boolean = false
  unfoldedWidth = defaultWidth
  unfoldedHeight = defaultHeight
  /**
   * children元素上一次折叠的状态缓存
   */
  childrenLastFoldStatus: Record<string, boolean> = {}

  initNodeData(data: any): void {
    super.initNodeData(data)
    let children: any = []
    if (isArray(data.children)) {
      children = data.children
    }
    // 初始化组的子节点
    this.children = new Set(children)
    this.width = defaultWidth
    this.height = defaultHeight
    this.foldedWidth = 80
    this.foldedHeight = 60
    this.zIndex = DEFAULT_BOTTOM_Z_INDEX
    this.radius = 0

    this.text.editable = false
    this.text.draggable = false

    this.isRestrict = false
    this.resizable = false
    this.autoToFront = false
    this.foldable = false
    if (this.properties.isFolded === undefined) {
      this.properties.isFolded = false
    }
    this.isFolded = !!this.properties.isFolded
    // fixme: 虽然默认保存的分组不会收起，但是如果重写保存数据分组了，
    // 此处代码会导致多一个history记录
    setTimeout(() => {
      this.isFolded && this.foldGroup(this.isFolded)
    })
    // this.foldGroup(this.isFolded);
  }

  getResizeOutlineStyle() {
    const style = super.getResizeOutlineStyle()
    style.stroke = 'none'
    return style
  }

  /**
   * 折叠分组
   * 1. 折叠分组的宽高
   * 2. 处理分组子节点
   * 3. 处理连线
   */
  foldGroup(isFolded: boolean) {
    if (isFolded === this.isFolded) {
      // 防止多次调用同样的状态设置
      // 如果this.isFolded=false，同时触发foldGroup(false)，会导致下面的childrenLastFoldStatus状态错乱
      return
    }
    this.setProperty('isFolded', isFolded)
    this.isFolded = isFolded
    // step 1
    if (isFolded) {
      this.x = this.x - this.width / 2 + this.foldedWidth / 2
      this.y = this.y - this.height / 2 + this.foldedHeight / 2
      this.unfoldedWidth = this.width
      this.unfoldedHeight = this.height
      this.width = this.foldedWidth
      this.height = this.foldedHeight
    } else {
      this.width = this.unfoldedWidth
      this.height = this.unfoldedHeight
      this.x = this.x + this.width / 2 - this.foldedWidth / 2
      this.y = this.y + this.height / 2 - this.foldedHeight / 2
    }
    // step 2
    let allEdges = [...this.incoming.edges, ...this.outgoing.edges]
    this.children.forEach((elementId) => {
      const nodeModel = this.graphModel.getElement(elementId)
      if (nodeModel) {
        const foldStatus = nodeModel.isFolded
        // FIX: https://github.com/didi/LogicFlow/issues/1007
        if (nodeModel.isGroup && !nodeModel.isFolded) {
          // 正常情况下，parent折叠后，children应该折叠
          // 因此当parent准备展开时，children的值目前肯定是折叠状态，也就是nodeModel.isFolded=true，这个代码块不会触发
          // 只有当parent准备折叠时，children目前状态才有可能是展开,
          // 即nodeModel.isFolded=false，这个代码块触发，此时isFolded=true，触发children也进行折叠
          ;(nodeModel as GroupNodeModel).foldGroup(isFolded)
        }

        if (nodeModel.isGroup && !isFolded) {
          // 当parent准备展开时，children的值应该恢复到折叠前的状态
          const lastFoldStatus = this.childrenLastFoldStatus[elementId]
          if (
            lastFoldStatus !== undefined &&
            lastFoldStatus !== nodeModel.isFolded
          ) {
            // https://github.com/didi/LogicFlow/issues/1145
            // 当parent准备展开时，children的值肯定是折叠，也就是nodeModel.isFolded=true
            // 当parent准备展开时，如果children之前的状态是展开，则恢复展开状态
            ;(nodeModel as GroupNodeModel).foldGroup(lastFoldStatus)
          }
        }
        // 存储parent触发children改变折叠状态前的状态
        this.childrenLastFoldStatus[elementId] = !!foldStatus
        nodeModel.visible = !isFolded

        const incomingEdges = (nodeModel.incoming as GraphElements).edges
        const outgoingEdges = (nodeModel.outgoing as GraphElements).edges

        allEdges = [...allEdges, ...incomingEdges, ...outgoingEdges]
      }
    })
    // step 3
    this.foldEdge(isFolded, allEdges)
  }

  getAnchorStyle(anchorInfo?: Point) {
    const style = super.getAnchorStyle(anchorInfo)
    style.stroke = 'transparent'
    style.fill = 'transparent'
    style.hover!.fill = 'transparent' // TODO: 确认这种情况如何解决，style.hover 为 undefined 时该如何处理
    style.hover!.stroke = 'transparent'
    return style
  }

  /**
   * 折叠分组的时候，处理分组自身的连线和分组内部子节点上的连线
   * 边的分类：
   *   - 虚拟边：分组被收起时，表示分组本身与外部节点关系的边。
   *   - 真实边：分组本身或者分组内部节点与外部节点节点（非收起分组）关系的边。
   * 如果一个分组，本身与外部节点有M条连线，且内部N个子节点与外部节点有连线，那么这个分组收起时会生成M+N条连线。
   * 折叠分组时：
   *   - 原有的虚拟边删除；
   *   - 创建一个虚拟边；
   *   - 真实边则隐藏；
   * 展开分组是：
   *   - 原有的虚拟边删除；
   *   - 如果目外部点是收起的分组，则创建虚拟边；
   *   - 如果外部节点是普通节点，则显示真实边；
   */
  foldEdge(isFolded: boolean, allEdges: BaseEdgeModel[]) {
    allEdges.forEach((edgeModel, index) => {
      const {
        id,
        sourceNodeId,
        targetNodeId,
        startPoint,
        endPoint,
        type,
        text,
      } = edgeModel
      const properties = edgeModel.getProperties()
      const data: EdgeConfig = {
        id: `${id}__${index}`,
        sourceNodeId,
        targetNodeId,
        startPoint,
        endPoint,
        type,
        properties,
        text: text?.value,
      }
      if (edgeModel.virtual) {
        this.graphModel.deleteEdgeById(edgeModel.id)
      }
      let targetNodeIdGroup = this.graphModel.group.getNodeGroup(targetNodeId)
      // 考虑目标节点本来就是分组的情况
      if (!targetNodeIdGroup) {
        targetNodeIdGroup = this.graphModel.getNodeModelById(targetNodeId)
      }
      let sourceNodeIdGroup = this.graphModel.group.getNodeGroup(sourceNodeId)
      if (!sourceNodeIdGroup) {
        sourceNodeIdGroup = this.graphModel.getNodeModelById(sourceNodeId)
      }
      // 折叠时，处理未被隐藏的边的逻辑
      if (isFolded && edgeModel.visible !== false) {
        // 需要确认此分组节点是新连线的起点还是终点
        // 创建一个虚拟边，虚拟边相对真实边，起点或者终点从一起分组内部的节点成为了分组，
        // 如果需要被隐藏的边的起点在需要折叠的分组中，那么设置虚拟边的开始节点为此分组
        if (this.children.has(sourceNodeId) || this.id === sourceNodeId) {
          data.startPoint = undefined
          data.sourceNodeId = this.id
        } else {
          data.endPoint = undefined
          data.targetNodeId = this.id
        }
        // 如果边的起点和终点都在分组内部，则不创建新的虚拟边
        if (
          targetNodeIdGroup.id !== this.id ||
          sourceNodeIdGroup.id !== this.id
        ) {
          this.createVirtualEdge(data)
        }
        edgeModel.visible = false
      }
      // 展开时，处理被隐藏的边的逻辑
      if (!isFolded && edgeModel.visible === false) {
        // 展开分组时：判断真实边的起点和终点是否有任一节点在已折叠分组中，如果不是，则显示真实边。如果是，这修改这个边的对应目标节点id来创建虚拟边。
        if (
          targetNodeIdGroup &&
          targetNodeIdGroup.isGroup &&
          targetNodeIdGroup.isFolded
        ) {
          data.targetNodeId = targetNodeIdGroup.id
          data.endPoint = undefined
          this.createVirtualEdge(data)
        } else if (
          sourceNodeIdGroup &&
          sourceNodeIdGroup.isGroup &&
          sourceNodeIdGroup.isFolded
        ) {
          data.sourceNodeId = sourceNodeIdGroup.id
          data.startPoint = undefined
          this.createVirtualEdge(data)
        } else {
          edgeModel.visible = true
        }
      }
    })
  }

  createVirtualEdge(edgeData) {
    edgeData.pointsList = undefined
    const model = this.graphModel.addEdge(edgeData)
    model.virtual = true
    // 强制不保存group连线数据
    // model.getData = () => null;
    model.text.editable = false
    model.isFoldedEdge = true
  }

  isInRange({ minX, minY, maxX, maxY }) {
    return (
      minX >= this.x - this.width / 2 &&
      maxX <= this.x + this.width / 2 &&
      minY >= this.y - this.height / 2 &&
      maxY <= this.y + this.height / 2
    )
  }

  isAllowMoveTo({ minX, minY, maxX, maxY }) {
    return {
      x: minX >= this.x - this.width / 2 && maxX <= this.x + this.width / 2,
      y: minY >= this.y - this.height / 2 && maxY <= this.y + this.height / 2,
    }
  }

  setAllowAppendChild(isAllow) {
    this.setProperty('groupAddable', isAllow)
  }

  /**
   * 添加分组子节点
   * @param id 节点id
   */
  addChild(id: string) {
    this.children.add(id)
    this.graphModel.eventCenter.emit('group:add-node', { data: this.getData() })
  }

  /**
   * 删除分组子节点
   * @param id 节点id
   */
  removeChild(id: string) {
    this.children.delete(id)
    this.graphModel.eventCenter.emit('group:remove-node', {
      data: this.getData(),
    })
  }

  getAddableOutlineStyle() {
    return {
      stroke: '#FEB663',
      strokeWidth: 2,
      strokeDasharray: '4 4',
      fill: 'transparent',
    }
  }

  getData() {
    const data = super.getData()
    data.children = []
    console.log('this.children', this.children)
    this.children.forEach((childId) => {
      const model = this.graphModel.getNodeModelById(childId)
      if (model && !model.virtual) {
        ;(data.children as string[]).push(childId)
      }
    })
    const { properties } = data
    delete properties?.groupAddable
    delete properties?.isFolded
    return data
  }

  getHistoryData() {
    const data = super.getData()
    data.children = [...this.children]
    data.isGroup = true
    const { properties } = data
    delete properties?.groupAddable
    if (properties?.isFolded) {
      // 如果分组被折叠
      data.x = data.x + this.unfoldedWidth / 2 - this.foldedWidth / 2
      data.y = data.y + this.unfoldedHeight / 2 - this.foldedHeight / 2
    }
    return data
  }

  /**
   * 是否允许此节点添加到此分组中
   */
  isAllowAppendIn(_nodeData: NodeData) {
    console.info('_nodeData', _nodeData)
    return true
  }

  /**
   * 当groupA被添加到groupB中时，将groupB及groupB所属的group的zIndex减1
   */
  toBack() {
    this.zIndex--
  }
}

export class GroupNode extends RectResizeView {
  getControlGroup(): h.JSX.Element | null {
    const { resizable, properties } = this.props.model
    return resizable && !properties.isFolded ? super.getControlGroup() : null
  }

  getAddableShape(): h.JSX.Element | null {
    const { width, height, x, y, radius, properties, getAddableOutlineStyle } =
      this.props.model as GroupNodeModel
    if (!properties.groupAddable) return null
    const { strokeWidth = 0 } = this.props.model.getNodeStyle()

    const style: Record<string, any> = getAddableOutlineStyle()
    const newWidth = width + strokeWidth + 8
    const newHeight = height + strokeWidth + 8

    return h('rect', {
      ...style,
      width: newWidth,
      height: newHeight,
      x: x - newWidth / 2,
      y: y - newHeight / 2,
      rx: radius,
      ry: radius,
    })
  }

  getFoldIcon(): h.JSX.Element | null {
    const { model } = this.props
    const foldX = model.x - model.width / 2 + 5
    const foldY = model.y - model.height / 2 + 5
    if (!model.foldable) return null
    const iconIcon = h('path', {
      fill: 'none',
      stroke: '#818281',
      strokeWidth: 2,
      'pointer-events': 'none',
      d: model.properties.isFolded
        ? `M ${foldX + 3},${foldY + 6} ${foldX + 11},${foldY + 6} M${
            foldX + 7
          },${foldY + 2} ${foldX + 7},${foldY + 10}`
        : `M ${foldX + 3},${foldY + 6} ${foldX + 11},${foldY + 6} `,
    })
    return h('g', {}, [
      h('rect', {
        height: 12,
        width: 14,
        rx: 2,
        ry: 2,
        strokeWidth: 1,
        fill: '#F4F5F6',
        stroke: '#CECECE',
        cursor: 'pointer',
        x: model.x - model.width / 2 + 5,
        y: model.y - model.height / 2 + 5,
        onClick: () => {
          ;(model as GroupNodeModel).foldGroup(!model.properties.isFolded)
        },
      }),
      iconIcon,
    ])
  }

  getResizeShape(): h.JSX.Element {
    return h('g', {}, [
      this.getAddableShape(),
      super.getResizeShape(),
      this.getFoldIcon(),
    ])
  }
}

export default {
  type: 'group',
  view: GroupNode,
  model: GroupNodeModel,
}
