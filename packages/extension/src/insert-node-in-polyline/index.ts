import LogicFlow, { PolylineEdgeModel } from '@logicflow/core';
import { cloneDeep } from 'lodash-es';
import { isNodeInSegment } from './edge';

class InsertNodeInPolyline {
  static pluginName = 'insertNodeInPolyline';
  _lf: LogicFlow;
  dndAdd: boolean; // dnd 添加节点到折线上的开关
  dropAdd: boolean; // 移动节点到折线上的开关
  deviation: number; // 节点中心距离直接距离小于该值时，认为节点在折线上
  constructor({ lf }) {
    this._lf = lf;
    // fix https://github.com/didi/LogicFlow/issues/754
    this.deviation = 20;
    this.dndAdd = true;
    this.dropAdd = true;
    this.eventHandler();
  }
  eventHandler() {
    // 监听事件
    if (this.dndAdd) {
      this._lf.on('node:dnd-add', ({ data }) => {
        this.insetNode(data);
      });
    }
    if (this.dropAdd) {
      this._lf.on('node:drop', ({ data }) => {
        const { edges } = this._lf.graphModel;
        const { id } = data;
        // 只有游离节点才能插入到连线上
        let pureNode = true;
        for (let i = 0; i < edges.length; i++) {
          if (edges[i].sourceNodeId === id || edges[i].targetNodeId === id) {
            pureNode = false;
            break;
          }
        }
        if (pureNode) {
          this.insetNode(data);
        }
      });
    }
  }
  insetNode(nodeData): void {
    const { edges } = this._lf.graphModel;
    const nodeModel = this._lf.getNodeModelById(nodeData.id);
    for (let i = 0; i < edges.length; i++) {
      // eslint-disable-next-line max-len
      const { crossIndex, crossPoints } = isNodeInSegment(nodeModel, edges[i] as PolylineEdgeModel, this.deviation);
      if (crossIndex >= 0) {
        const { sourceNodeId, targetNodeId, id, type, pointsList } = edges[i];
        // fix https://github.com/didi/LogicFlow/issues/996
        const startPoint = cloneDeep(pointsList[0]);
        const endPoint = cloneDeep(crossPoints.startCrossPoint);
        this._lf.addEdge({
          type,
          sourceNodeId,
          targetNodeId: nodeData.id,
          startPoint,
          endPoint,
          pointsList: [...pointsList.slice(0, crossIndex), crossPoints.startCrossPoint],
        });
        this._lf.addEdge({
          type,
          sourceNodeId: nodeData.id,
          targetNodeId,
          startPoint: cloneDeep(crossPoints.endCrossPoint),
          endPoint: cloneDeep(pointsList[pointsList.length - 1]),
          pointsList: [crossPoints.endCrossPoint, ...pointsList.slice(crossIndex)],
        });
        this._lf.deleteEdge(id);
        break;
      }
    }
  }
}

export { InsertNodeInPolyline };

export default InsertNodeInPolyline;
