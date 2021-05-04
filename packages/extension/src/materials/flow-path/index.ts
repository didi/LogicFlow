import LogicFlow from '@logicflow/core';

type Path = {
  id: string;
  elements: string[];
};

class FlowPath {
  lf: LogicFlow;
  pathes: Path[];
  startNodeType: string;
  constructor({ lf }) {
    this.lf = lf;
    this.pathes = [];
    // 给lf添加方法
    lf.getPathes = () => {
      if (!this.startNodeType) {
        throw new Error('需要预先指定开始节点类型');
      }
      return this.getPathes();
    };

    lf.setRawPathes = (pathes: Path[]) => {
      this.pathes = pathes;
    };

    lf.getRawPathes = () => this.pathes;

    lf.setStartNodeType = (type: string) => {
      this.startNodeType = type;
    };
  }

  getPathes() {
    const graphData = this.lf.getGraphRawData();
    const nodesMap = new Map();
    let startNodeId;
    graphData.nodes.forEach(node => {
      nodesMap.set(node.id, {
        id: node.id,
        data: node,
        nextNodes: [],
      });
      if (node.type === this.startNodeType) {
        startNodeId = node.id;
      }
    });
    graphData.edges.forEach(edge => {
      const node = nodesMap.get(edge.sourceNodeId);
      node.nextNodes.push(edge.targetNodeId);
    });
    this.pathes = this.findPathes(nodesMap.get(startNodeId), nodesMap, []);
    return this.pathes;
  }
  private findPathes(node, nodesMap, elements = []) {
    const newPathes = [...elements];
    newPathes.push(node.id);
    if (node.nextNodes.length === 0) {
      return [newPathes];
    }
    let subPath = [];
    for (let i = 0; i < node.nextNodes.length; i++) {
      const n = nodesMap.get(node.nextNodes[i]);
      let p;
      // 循环路径
      if (newPathes.indexOf(n.id) !== -1) {
        p = [[...newPathes, n.id]];
      } else {
        p = this.findPathes(n, nodesMap, [...newPathes]);
      }
      subPath = subPath.concat(p);
    }
    return subPath;
  }
}

export {
  FlowPath,
};
