import { action, computed, observable } from 'mobx';
import { assign } from 'lodash-es';
import GraphModel from './GraphModel';
import { NodeData } from '../type/index';
import { defaultTheme } from '../constant/DefaultTheme';
import { getNodeBBox } from '../util/node';
import BaseNodeModel from './node/BaseNodeModel';

export type SnaplineInfo = {
  isShowHorizontal?: boolean;
  isShowVertical?: boolean;
  position?: SnaplinePosition;
};
export type SnaplinePosition = {
  x?: number;
  y?: number;
};

export default class SnaplineModel {
  graphModel: GraphModel;
  // 是否展示水平对齐线
  @observable isShowHorizontal: boolean;
  // 是否展示垂直对齐线
  @observable isShowVertical: boolean;
  // 对齐线的中心位置，目前仅展示中心对齐的情况，后面可以考虑多种对齐策略
  @observable position: SnaplinePosition;
  constructor(graphModel) {
    this.isShowHorizontal = false;
    this.isShowVertical = false;
    this.position = { x: 0, y: 0 };
    this.graphModel = graphModel;
  }
  getStyle() {
    return {
      ...this.graphModel.theme.snapline,
    };
  }
  // 计算节点中心线与其他节点的对齐信息
  private getCenterSnapLine(dragingNode: NodeData, nodes: BaseNodeModel[]): SnaplineInfo {
    const { x, y } = dragingNode;
    let isShowVertical = false;
    let isShowHorizontal = false;
    for (let i = 0; i < nodes.length; i++) {
      const item = nodes[i];
      // 排除当前节点
      if (item.id !== dragingNode.id) {
        if (x === item.x) {
          isShowVertical = true;
        }
        if (y === item.y) {
          isShowHorizontal = true;
        }
        // 如果水平垂直都显示，则停止循环。减少不必要的遍历
        if (isShowVertical && isShowHorizontal) {
          break;
        }
      }
    }
    return ({
      isShowVertical,
      isShowHorizontal,
      position: { x, y },
    });
  }
  // 计算节点上下边框与其他节点的上下边框的对齐信息
  private getHorizontalSnapline(dragingNode: NodeData, nodes: BaseNodeModel[]): SnaplineInfo {
    let isShowHorizontal = false;
    let horizontalY;
    const { id } = dragingNode;
    let dragingData;
    if (id) {
      const { fakerNode } = this.graphModel;
      if (fakerNode && fakerNode.id === id) {
        dragingData = getNodeBBox(fakerNode);
      } else {
        const nodeModel = this.graphModel.getNodeModelById(id);
        dragingData = getNodeBBox(nodeModel);
      }
    }
    for (let i = 0; i < nodes.length; i++) {
      const item = nodes[i];
      // 排除当前节点
      if (item.id !== dragingNode.id) {
        const itemData = getNodeBBox(item);
        // 如果节点的最大最小Y轴坐标与节点的最大最小Y轴坐标相等，展示水平线
        if (itemData.minY === dragingData.minY
          || itemData.maxY === dragingData.minY
        ) {
          // 找到则停止循环。减少不必要的遍历
          isShowHorizontal = true;
          horizontalY = dragingData.minY;
          break;
        }
        if (itemData.minY === dragingData.maxY
          || itemData.maxY === dragingData.maxY
        ) {
          isShowHorizontal = true;
          horizontalY = dragingData.maxY;
          break;
        }
      }
    }
    return assign({ isShowHorizontal, position: { y: horizontalY } });
  }
  // 计算节点左右边框与其他节点的左右边框的对齐信息
  private getVerticalSnapline(dragingNode: NodeData, nodes: BaseNodeModel[]): SnaplineInfo {
    let isShowVertical = false;
    let verticalX;
    const { id } = dragingNode;
    let dragingData;
    if (id) {
      const { fakerNode } = this.graphModel;
      if (fakerNode && fakerNode.id === id) {
        dragingData = getNodeBBox(fakerNode);
      } else {
        const nodeModel = this.graphModel.getNodeModelById(id);
        dragingData = getNodeBBox(nodeModel);
      }
    }
    for (let i = 0; i < nodes.length; i++) {
      const item = nodes[i];
      // 排除当前节点
      if (item.id !== dragingNode.id) {
        const itemData = getNodeBBox(item);
        // 如果节点的最大最小X轴坐标与节点的最大最小X轴坐标相等，展示垂直线
        if (itemData.minX === dragingData.minX
          || itemData.maxX === dragingData.minX
        ) {
          // 找到则停止循环。减少不必要的遍历
          isShowVertical = true;
          verticalX = dragingData.minX;
          break;
        }
        if (itemData.minX === dragingData.maxX
          || itemData.maxX === dragingData.maxX
        ) {
          isShowVertical = true;
          verticalX = dragingData.maxX;
          break;
        }
      }
    }
    return assign({ isShowVertical, position: { x: verticalX } });
  }
  // 计算节点与其他节点的对齐信息
  getSnapLinePosition(dragingNode: NodeData, nodes: BaseNodeModel[]): SnaplineInfo {
    const snaplineInfo = this.getCenterSnapLine(dragingNode, nodes);
    const { isShowHorizontal, isShowVertical } = snaplineInfo;
    // 中心对齐优先级最高
    // 如果没有中心坐标的水平对齐，计算上下边框的对齐
    if (!isShowHorizontal) {
      const horizontalSnapline = this.getHorizontalSnapline(dragingNode, nodes);
      if (horizontalSnapline.isShowHorizontal) {
        snaplineInfo.isShowHorizontal = horizontalSnapline.isShowHorizontal;
        snaplineInfo.position.y = horizontalSnapline.position.y;
      }
    }
    // 如果没有中心坐标的垂直对齐，计算左右边框的对齐
    if (!isShowVertical) {
      const verticalSnapline = this.getVerticalSnapline(dragingNode, nodes);
      if (verticalSnapline.isShowVertical) {
        snaplineInfo.isShowVertical = verticalSnapline.isShowVertical;
        snaplineInfo.position.x = verticalSnapline.position.x;
      }
    }
    return snaplineInfo;
  }
  // 设置对齐信息
  private setSnaplineInfo(snaplineInfo: SnaplineInfo): void {
    const { isShowHorizontal, isShowVertical, position } = snaplineInfo;
    this.position = position;
    this.isShowHorizontal = isShowHorizontal;
    this.isShowVertical = isShowVertical;
  }
  // 清空对齐信息，对齐线消失
  @action
  clearSnapline(): void {
    this.position = { x: 0, y: 0 };
    this.isShowHorizontal = false;
    this.isShowVertical = false;
  }
  // 设置节点对齐线
  @action
  setNodeSnapLine(nodeData: NodeData): void {
    const { nodes } = this.graphModel;
    const info = this.getSnapLinePosition(nodeData, nodes);
    this.setSnaplineInfo(info);
  }
}

export { SnaplineModel };
