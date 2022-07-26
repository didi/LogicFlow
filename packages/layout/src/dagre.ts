import { DagreLayout, DagreLayoutOptions } from '@antv/layout';

export class Dagre {
  static pluginName = 'dagre';
  lf: any;
  option: DagreLayoutOptions;
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
    this.option = {
      type: 'dagre',
      rankdir: 'LR',
      nodesep: 20,
      begin: [100, 100],
      ...option,
    };
    const layoutInstance = new DagreLayout(this.option);
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
      data.pointsList = this.calcPointsList(model, newGraphData.nodes);
      if (data.pointsList) {
        const [first, next, third, last] = data.pointsList;
        data.startPoint = { x: first.x, y: first.y };
        data.endPoint = { x: last.x, y: last.y };
        if (data.text && data.text.value) {
          data.text = {
            x: (third.x + last.x) / 2,
            y: last.y,
            value: data.text.value,
          };
        }
      } else {
        data.startPoint = undefined;
        data.endPoint = undefined;
        if (data.text && data.text.value) {
          data.text = data.text.value;
        }
      }
      newGraphData.edges.push(data);
    });
    this.lf.render(newGraphData);
  }
  calcPointsList(model, nodes) {
    console.log(this.option.rankdir, model.modelType);
    // 在节点确认从左向右后，通过计算来保证节点连线清晰。
    if (this.option.rankdir === 'LR' && model.modelType === 'polyline-edge') {
      const sourceNodeModel = this.lf.getNodeModelById(model.sourceNodeId);
      const targetNodeModel = this.lf.getNodeModelById(model.targetNodeId);
      const newSourceNodeData = nodes.find(node => node.id === model.sourceNodeId);
      const newTargetNodeData = nodes.find(node => node.id === model.targetNodeId);
      const firstPoint = {
        x: newSourceNodeData.x + sourceNodeModel.width / 2,
        y: newSourceNodeData.y,
      };
      const nextPoint = {
        x: newSourceNodeData.x + sourceNodeModel.width / 2 + (model.offset || 50),
        y: newSourceNodeData.y,
      };
      const thirdPoint = {
        x: newSourceNodeData.x + sourceNodeModel.width / 2 + (model.offset || 50),
        y: newTargetNodeData.y,
      };
      const lastPoint = {
        x: newTargetNodeData.x - targetNodeModel.width / 2,
        y: newTargetNodeData.y,
      };
      return [firstPoint, nextPoint, thirdPoint, lastPoint];
    }
    return undefined;
  }
}
