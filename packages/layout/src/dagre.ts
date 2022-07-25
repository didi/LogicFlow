import { DagreLayout } from '@antv/layout';

export class Dagre {
  static pluginName = 'dagre';
  lf: any;
  render(lf) {
    this.lf = lf;
  }
  /**
   * option: {
   *   rankdir: "TB", // layout 方向, 可选 TB, BT, LR, RL
   *   align: undefined, // 节点对齐方式，可选 UL, UR, DL, DR
   *   nodeSize: undefined, // 节点大小
   *   nodesepFunc: undefined, // 节点水平间距(px)
   *   ranksepFunc: undefined, // 每一层节点之间间距
   *   nodesep: 50, // 节点水平间距(px)
   *   ranksep: 50, // 每一层节点之间间距
   *   controlPoints: false, // 是否保留布局连线的控制点
   *   radial: false, // 是否基于 dagre 进行辐射布局
   *   focusNode: null, // radial 为 true 时生效，关注的节点
   * };
   */
  layout(option = {}) {
    const { nodes, edges } = this.lf.graphModel;
    const layoutInstance = new DagreLayout({
      type: 'dagre',
      rankdir: 'LR',
      begin: [100, 100],
      ...option,
    });
    const layoutData = layoutInstance.layout({
      nodes: nodes.map((node) => ({
        id: node.id,
        size: {
          width: node.width,
          height: node.height,
        },
        model: node,
      })),
      edges: edges.map((edge) => ({
        source: edge.sourceNodeId,
        target: edge.targetNodeId,
        model: edge,
      })),
    });
    const newGraphData = {
      nodes: [],
      edges: [],
    };
    layoutData.nodes.forEach(node => {
      // @ts-ignore: pass node data
      const { model } = node;
      const data = model.getData();
      // @ts-ignore: pass node data
      data.x = node.x;
      // @ts-ignore: pass node data
      data.y = node.y;
      newGraphData.nodes.push(data);
    });
    layoutData.edges.forEach(edge => {
      // @ts-ignore: pass edge data
      const { model } = edge;
      const data = model.getData();
      data.pointsList = undefined;
      data.startPoint = undefined;
      data.endPoint = undefined;
      newGraphData.edges.push(data);
    });
    this.lf.render(newGraphData);
  }
}
