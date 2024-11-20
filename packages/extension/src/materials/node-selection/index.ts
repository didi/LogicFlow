import { get } from 'lodash-es'
import LogicFlow, {
  BaseNodeModel,
  h,
  PolygonNode,
  PolygonNodeModel,
} from '@logicflow/core'
import { ResizeControl } from '@logicflow/core/lib/view/Control'

export type INodeSelectionProperties = {
  strokeColor?: string | 'none'
  node_selection_ids?: string[]
}

class NodeSelectionView extends PolygonNode {
  getLabelShape(): h.JSX.Element {
    const { id, x, y, width, height, properties } = this.props.model
    const style = this.props.model.getNodeStyle()
    return h(
      'svg',
      {
        x: x - width / 2,
        y: y - height / 2,
        width: 50,
        height: 24,
        style: 'z-index: 0; background: none; overflow: auto;',
      },
      [
        properties.labelText
          ? h(
              'text',
              {
                x: 0,
                y: -5,
                fontSize: '16px',
                fill: style.stroke,
              },
              properties.labelText,
            )
          : '',
        properties.disabledDelete
          ? ''
          : h(
              'text',
              {
                x: properties.labelText ? 50 : 0,
                y: -5,
                fontSize: '24px',
                cursor: 'pointer',
                fill: style.stroke,
                onclick: this.handleCustomDeleteIconClick.bind(this, id),
              },
              'x',
            ),
      ],
    )
  }

  getShape(): h.JSX.Element {
    const { x, y, width, height, id } = this.props.model
    const style = this.props.model.getNodeStyle()

    return h('g', {}, [
      h('rect', {
        ...style,
        x: x - width / 2,
        y: y - height / 2,
        width,
        height,
        id,
      }),
      this.getLabelShape(),
    ])
  }
  // 避免点击时，该节点置于最高层，挡住内部节点
  toFront() {}

  /**
   * 点击删除
   * @param id
   */
  handleCustomDeleteIconClick(id) {
    const { graphModel } = this.props
    graphModel.deleteNode(id)
  }
}

class NodeSelectionModel extends PolygonNodeModel<INodeSelectionProperties> {
  d = 10

  initNodeData(data) {
    data.text = {
      value: '',
      x: data.x,
      y: data.y,
      draggable: false,
      editable: false,
    }
    super.initNodeData(data)
    this.zIndex = 0
    this.draggable = true
  }

  setAttributes() {
    // 默认不显示
    this.points = []

    // 图render的时候，会把所有nodes数据实例化，全部实例化完成后，放到nodesMap里。
    // 节点的setAttributes在实例化的时候执行第一次
    // updatePointsByNodes中的getNodeModelById方法，是从nodesMap取的数据，第一次就拿不到，所以要加setTimeout
    if ((this.properties?.node_selection_ids as string[]).length > 1) {
      setTimeout(() => {
        this.updatePointsByNodes(this.properties?.node_selection_ids || [])
      })
    }
  }

  getNodeStyle() {
    const style = super.getNodeStyle()
    style.stroke = this.properties.strokeColor || '#008000'
    style.strokeDasharray = '10 5'
    return style
  }

  getDefaultAnchor() {
    return []
  }

  /**
   * 更新points - 多边形顶点坐标集合
   * @param points
   */
  updatePoints(points: [number, number][]) {
    this.points = points
  }

  /**
   * 更新x y - 多边形中点坐标
   */
  updateCoordinate({ x, y }) {
    this.x = x
    this.y = y
  }

  /**
   * 计算新的 points 和 x y
   */
  updatePointsByNodes(nodesIds: string[]) {
    const points: [number, number][] = []
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    nodesIds.forEach((id) => {
      const model = this.graphModel.getNodeModelById(id)
      if (!model) return
      const { width, height, x, y } = model
      minX = Math.min(minX, x - width / 2 - this.d)
      minY = Math.min(minY, y - height / 2 - this.d)
      maxX = Math.max(maxX, x + width / 2 + this.d)
      maxY = Math.max(maxY, y + height / 2 + this.d)
    })
    points.push([minX, minY], [maxX, minY], [maxX, maxY], [minX, maxY])

    if ([minX, minY, maxX, maxY].some((n) => Math.abs(n) === Infinity)) return

    this.updatePoints(points)
    this.updateCoordinate({
      x: (maxX + minX) / 2,
      y: (maxY + minY) / 2,
    })
  }

  isResize = false
  override resize(
    resizeInfo: ResizeControl.ResizeInfo,
  ): ResizeControl.ResizeNodeData {
    this.isResize = true
    const { width, height } = resizeInfo
    const scale = {
      x: width / this.width,
      y: height / this.height,
    }
    const childIds = (this.properties.node_selection_ids || []).slice()
    const childModels: BaseNodeModel[] = []
    const usedGroupId = new Set<string>()
    while (childIds.length) {
      const id = childIds.shift()!
      const node = this.graphModel.nodesMap[id]?.model
      if (!node) {
        continue
      }
      if (!isNodeSelectionModel(node)) {
        childModels.push(node)
        continue
      }
      // 跳出循环引用
      if (usedGroupId.has(node.id)) {
        continue
      }
      usedGroupId.add(node.id)
      childIds.push(...(node.properties.node_selection_ids || []))
    }

    const begin = {
      x: this.x - this.width / 2,
      y: this.y - this.height / 2,
    }

    const res = super.resize(resizeInfo)

    const end = {
      x: this.x - this.width / 2,
      y: this.y - this.height / 2,
    }

    childModels.forEach((node) => {
      node.width = node.width * scale.x
      node.height = node.height * scale.y
      const deltaX = (node.x - begin.x) * scale.x + end.x - node.x
      const deltaY = (node.y - begin.y) * scale.y + end.y - node.y
      node.move(deltaX, deltaY, true)
    })
    this.isResize = false
    return res
  }
}

const NODE_SELECTION_TYPE = 'node-selection'
class NodeSelection {
  static pluginName = 'node-selection'
  lf: LogicFlow // lf 实例
  selectNodes: any[] = [] // 选择的nodes
  currentClickNode // 当前点击的节点，选中的节点是无序的
  d = 10

  constructor({ lf }: LogicFlow.IExtensionProps) {
    this.lf = lf
    lf.register({
      type: NODE_SELECTION_TYPE,
      view: NodeSelectionView,
      model: NodeSelectionModel,
    })
  }

  /**
   * 获取所选node的id数组
   */
  get selectNodesIds(): string[] {
    return this.selectNodes.map((node) => node.id)
  }

  /**
   * 新建node-selection节点
   */
  addNodeSelection() {
    const node = this.lf.addNode({
      type: 'node-selection',
      text: '',
      properties: {
        node_selection_ids: this.selectNodesIds,
      },
      x: 0,
      y: 0,
    })
    node.updatePointsByNodes(this.selectNodesIds)
  }

  /**
   * 更新node-selection节点
   */
  updateNodeSelection() {
    const nodeSelection = this.getNodeSelection()
    if (!nodeSelection) return
    this.lf.setProperties(nodeSelection.id, {
      node_selection_ids: this.selectNodesIds,
    })

    this.lf
      .getNodeModelById(nodeSelection.id)
      ?.updatePointsByNodes(this.selectNodesIds)
  }

  /**
   * 获取所属的node-selection
   */
  getNodeSelection() {
    const ids = this.selectNodesIds
    const rawData = this.lf.getGraphRawData()

    const oldIds = ids.filter((id) => id !== this.currentClickNode.id)
    return rawData.nodes.find((node) => {
      if (node.type === 'node-selection') {
        const nodeSelectionIds = get(
          node,
          'properties.node_selection_ids',
          [],
        ) as string[]
        return oldIds.every((id) => nodeSelectionIds.includes(id))
      }
      return false
    })
  }

  protected onNodeChange(lf: LogicFlow, model: BaseNodeModel) {
    const connectedSelections = lf.graphModel.nodes.filter((node) => {
      if (!isNodeSelectionModel(node)) {
        return false
      }
      const childIds: string[] = node.properties.node_selection_ids || []
      return childIds.includes(model.id)
    })

    Promise.resolve().then(() => {
      connectedSelections.forEach((node) => {
        node.updatePointsByNodes(node.properties.node_selection_ids || [])
      })
    })
  }

  render(lf: LogicFlow) {
    this.lf = lf

    lf.on('node:click', (val) => {
      if (!val.e.shiftKey || val.data.type === NODE_SELECTION_TYPE) return
      this.currentClickNode = val.data

      // 如果selectNodesIds中已存在此节点，则取消选中此节点
      let hasExists = false
      if (this.selectNodesIds.includes(val.data.id)) {
        this.lf.getNodeModelById(val.data.id)?.setSelected(false)
        hasExists = true
      }

      // 获取所有被选中的节点，获取到的数组是无序的
      const { nodes } = lf.getSelectElements(true)
      this.selectNodes = nodes
      if (this.selectNodes.length === 1) {
        if (!hasExists) {
          this.addNodeSelection()
        } else {
          this.updateNodeSelection()
        }
      } else if (this.selectNodes.length > 1) {
        this.updateNodeSelection()
      }
    })
    lf.graphModel.addNodeMoveRules((model, deltaX, deltaY) => {
      this.onNodeChange(lf, model)
      /**
       * 如果移动的是分组，那么分组的子节点也跟着移动。
       * 忽略来自分组resize导致的move
       */
      if (isNodeSelectionModel(model) && !model.isResize) {
        const nodeIds = model.properties.node_selection_ids || []
        lf.graphModel.moveNodes(nodeIds, deltaX, deltaY, true)
        return true
      }
      return true
    })

    lf.graphModel.addNodeResizeRules((model) => {
      if (!isNodeSelectionModel(model)) {
        this.onNodeChange(lf, model)
      }
      return true
    })
  }
}

const isNodeSelectionModel = (
  node: BaseNodeModel,
): node is NodeSelectionModel => {
  return !!(node && (node.type as string) === NODE_SELECTION_TYPE)
}

export default NodeSelection

export { NodeSelection }
