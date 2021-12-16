import { PolylineEdgeModel } from '@logicflow/core';
import { isNodeInSegement } from './edge';

const InsertNodeInPolyline = {
  pluginName: 'insert-node-in-polyline',
  _lf: null,
  dndAdd: true, // dnd 添加节点到折线上的开关
  dropAdd: true, // 移动节点到折线上的开关
  install(lf) {
    InsertNodeInPolyline._lf = lf;
    this.eventHandler();
  },
  eventHandler() {
    // 监听事件
    if (InsertNodeInPolyline.dndAdd) {
      InsertNodeInPolyline._lf.on('node:dnd-add', ({ data }) => {
        InsertNodeInPolyline.insetNode(data);
      });
    }
    if (InsertNodeInPolyline.dropAdd) {
      InsertNodeInPolyline._lf.on('node:drop', ({ data }) => {
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
          InsertNodeInPolyline.insetNode(data);
        }
      });
    }
  },
  insetNode(nodeData): void {
    const { edges } = this._lf.graphModel;
    const nodeModel = this._lf.getNodeModel(nodeData.id);
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
  },
};

export { InsertNodeInPolyline };

export default InsertNodeInPolyline;
