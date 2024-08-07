import { action, observable } from 'mobx'
import { GraphModel, BaseNodeModel } from '.'
import LogicFlow from '../LogicFlow'
import { getNodeBBox } from '../util'
import Position = LogicFlow.Position
import NodeData = LogicFlow.NodeData

export type ISnaplineInfo = {
  isShowHorizontal: boolean
  isShowVertical: boolean
  position: Position
}

export class SnaplineModel {
  graphModel: GraphModel
  // 是否展示水平对齐线
  @observable isShowHorizontal: boolean
  // 是否展示垂直对齐线
  @observable isShowVertical: boolean
  // 对齐线的中心位置，目前仅展示中心对齐的情况，后面可以考虑多种对齐策略
  @observable position: Position

  constructor(graphModel: GraphModel) {
    this.isShowHorizontal = false
    this.isShowVertical = false
    this.position = {
      x: 0,
      y: 0,
    }
    this.graphModel = graphModel
  }

  getStyle() {
    return {
      ...this.graphModel.theme.snapline,
    }
  }

  // 计算节点中心线与其他节点的对齐信息
  private getCenterSnapLine(
    draggingNode: NodeData,
    nodes: BaseNodeModel[],
  ): ISnaplineInfo {
    const { x, y } = draggingNode
    let isShowVertical = false
    let isShowHorizontal = false
    for (let i = 0; i < nodes.length; i++) {
      const item = nodes[i]
      // 排除当前节点
      if (item.id !== draggingNode.id) {
        if (x === item.x) {
          isShowVertical = true
        }
        if (y === item.y) {
          isShowHorizontal = true
        }
        // 如果水平垂直都显示，则停止循环。减少不必要的遍历
        if (isShowVertical && isShowHorizontal) {
          break
        }
      }
    }
    return {
      isShowVertical,
      isShowHorizontal,
      position: {
        x,
        y,
      },
    }
  }

  // 计算节点上下边框与其他节点的上下边框的对齐信息
  private getHorizontalSnapline(
    draggingNode: NodeData,
    nodes: BaseNodeModel[],
  ): ISnaplineInfo {
    let isShowHorizontal = false
    let horizontalY: number = 0
    const { id } = draggingNode
    let draggingData
    if (id) {
      const { fakeNode } = this.graphModel
      if (fakeNode && fakeNode.id === id) {
        draggingData = getNodeBBox(fakeNode)
      } else {
        const nodeModel = this.graphModel.getNodeModelById(id)
        if (nodeModel) {
          draggingData = getNodeBBox(nodeModel)
        }
      }
    }
    for (let i = 0; i < nodes.length; i++) {
      const item = nodes[i]
      // 排除当前节点
      if (item.id !== draggingNode.id) {
        const itemData = getNodeBBox(item)
        // 如果节点的最大最小Y轴坐标与节点的最大最小Y轴坐标相等，展示水平线
        if (
          itemData.minY === draggingData?.minY ||
          itemData.maxY === draggingData?.minY
        ) {
          // 找到则停止循环。减少不必要的遍历
          isShowHorizontal = true
          horizontalY = draggingData.minY
          break
        }
        if (
          itemData.minY === draggingData?.maxY ||
          itemData.maxY === draggingData?.maxY
        ) {
          isShowHorizontal = true
          horizontalY = draggingData.maxY
          break
        }
      }
    }
    return {
      isShowHorizontal,
      isShowVertical: this.isShowVertical,
      position: {
        ...this.position,
        y: horizontalY,
      },
    }
  }

  // 计算节点左右边框与其他节点的左右边框的对齐信息
  private getVerticalSnapline(
    draggingNode: NodeData,
    nodes: BaseNodeModel[],
  ): ISnaplineInfo {
    let isShowVertical: boolean = false
    let verticalX: number = 0
    const { id } = draggingNode
    let draggingData
    if (id) {
      const { fakeNode } = this.graphModel
      if (fakeNode && fakeNode.id === id) {
        draggingData = getNodeBBox(fakeNode)
      } else {
        const nodeModel = this.graphModel.getNodeModelById(id)
        if (nodeModel) {
          draggingData = getNodeBBox(nodeModel)
        }
      }
    }
    for (let i = 0; i < nodes.length; i++) {
      const item = nodes[i]
      // 排除当前节点
      if (item.id !== draggingNode.id) {
        const itemData = getNodeBBox(item)
        // 如果节点的最大最小X轴坐标与节点的最大最小X轴坐标相等，展示垂直线
        if (
          itemData.minX === draggingData?.minX ||
          itemData.maxX === draggingData?.minX
        ) {
          // 找到则停止循环。减少不必要的遍历
          isShowVertical = true
          verticalX = draggingData.minX
          break
        }
        if (
          itemData.minX === draggingData?.maxX ||
          itemData.maxX === draggingData?.maxX
        ) {
          isShowVertical = true
          verticalX = draggingData.maxX
          break
        }
      }
    }
    return {
      isShowHorizontal: this.isShowHorizontal,
      isShowVertical,
      position: {
        ...this.position,
        x: verticalX,
      },
    }
  }

  // 计算节点与其他节点的对齐信息
  getSnapLinePosition(
    draggingNode: NodeData,
    nodes: BaseNodeModel[],
  ): ISnaplineInfo {
    const snaplineInfo = this.getCenterSnapLine(draggingNode, nodes)
    const { isShowHorizontal, isShowVertical } = snaplineInfo
    // 中心对齐优先级最高
    // 如果没有中心坐标的水平对齐，计算上下边框的对齐
    if (!isShowHorizontal) {
      const horizontalSnapline = this.getHorizontalSnapline(draggingNode, nodes)
      if (horizontalSnapline.isShowHorizontal) {
        snaplineInfo.isShowHorizontal = horizontalSnapline.isShowHorizontal
        snaplineInfo.position.y = horizontalSnapline.position.y
      }
    }
    // 如果没有中心坐标的垂直对齐，计算左右边框的对齐
    if (!isShowVertical) {
      const verticalSnapline = this.getVerticalSnapline(draggingNode, nodes)
      if (verticalSnapline.isShowVertical) {
        snaplineInfo.isShowVertical = verticalSnapline.isShowVertical
        snaplineInfo.position.x = verticalSnapline.position.x
      }
    }
    return snaplineInfo
  }

  // 设置对齐信息
  private setSnaplineInfo(snaplineInfo: ISnaplineInfo): void {
    const { isShowHorizontal, isShowVertical, position } = snaplineInfo
    this.position = position
    this.isShowHorizontal = isShowHorizontal
    this.isShowVertical = isShowVertical
  }

  // 清空对齐信息，对齐线消失
  @action
  clearSnapline(): void {
    this.position = {
      x: 0,
      y: 0,
    }
    this.isShowHorizontal = false
    this.isShowVertical = false
  }

  // 设置节点对齐线
  @action
  setNodeSnapLine(nodeData: NodeData): void {
    const { nodes } = this.graphModel
    const info = this.getSnapLinePosition(nodeData, nodes)
    this.setSnaplineInfo(info)
  }
}

export default SnaplineModel
