import LogicFlow, { PolylineEdgeModel } from '@logicflow/core';
import { isNodeInSegement } from './edge';

class InsertNodeInPolyline {
  static pluginName = 'insertNodeInPolyline';
  _lf: LogicFlow;
  dndAdd: boolean; // dnd 添加节点到折线上的开关
  dropAdd: boolean; // 移动节点到折线上的开关
  constructor({ lf }) {
    this._lf = lf;
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
      const { crossIndex, crossPoints } = isNodeInSegement(nodeModel, edges[i] as PolylineEdgeModel);
      if (crossIndex >= 0) {
        const { sourceNodeId, targetNodeId, id, type, pointsList } = edges[i];
        this._lf.addEdge({
          type,
          sourceNodeId,
          targetNodeId: nodeData.id,
          pointsList: [...pointsList.slice(0, crossIndex), crossPoints.startCrossPoint],
        });
        this._lf.addEdge({
          type,
          sourceNodeId: nodeData.id,
          targetNodeId,
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
