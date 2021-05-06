/**
 * 路径插件，此插件支持获取绘制的图中所有的路径。
 * 需要指定开始节点类型。
 */

import LogicFlow from '@logicflow/core';
import { getBpmnId } from '../bpmn/getBpmnId';

type Path = {
  routeId: string;
  name: string;
  elements: string[];
  type: number;
};

type RawPath = Path & {
  similarElement: RawPath;
  similarElementWeight: number;
};

class FlowPath {
  lf: LogicFlow;
  pathes: RawPath[];
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
      this.setPathes(pathes);
    };

    lf.getRawPathes = () => this.pathes;

    lf.setStartNodeType = (type: string) => {
      this.startNodeType = type;
    };
  }
  setPathes(pathes) {
    this.pathes = pathes.map(({ routeId, name, elements, type }) => ({
      routeId,
      name,
      elements,
      type,
      similarElement: null,
      similarElementWeight: 0,
    }));
  }
  getPathes() {
    const graphData = this.lf.getGraphRawData();
    const nodesMap = new Map();
    const startNodeIds = [];
    graphData.nodes.forEach(node => {
      nodesMap.set(node.id, {
        id: node.id,
        data: node,
        nextNodes: [],
      });
      if (node.type === this.startNodeType) {
        startNodeIds.push(node.id);
      }
    });
    graphData.edges.forEach(edge => {
      const node = nodesMap.get(edge.sourceNodeId);
      node.nextNodes.push(edge.targetNodeId);
    });
    let pathElements = [];
    startNodeIds.forEach((id) => {
      pathElements = pathElements.concat(this.findPathElements(nodesMap.get(id), nodesMap, []));
    });
    return this.getNewPathes(pathElements);
  }
  private findPathElements(node, nodesMap, elements = []) {
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
        p = this.findPathElements(n, nodesMap, [...newPathes]);
      }
      subPath = subPath.concat(p);
    }
    return subPath;
  }
  /**
   * 设置路径id
   * 如果存在原始路径Id, 则需要比较新路径是否在原始路径中存在相似路径
   * 如果有，则尽量使用原始路径。
   * 相似路径
   * 1. 如果所有的节点都相同，则必定为同一路径。(包括顺序不同)
   * 2. 如果新路径比原来路径少了或者多了部分节点，则记录为相似路径。基于不同的差异，标记不同的权重。
   * 3. 基于新路径在旧路径占用权限，设置新路径Id.
   * 4. 如果某一条旧路径被多条新路径标记为相同的权重，则这两条新路径都使用新Id.
   */
  private getNewPathes(pathElements) {
    const pathes = [];
    pathElements.forEach(elements => {
      const routeId = this.getNewId('path');
      const name = this.getNewId('路径');
      const isLoop = this.isLoopPath(elements);
      pathes.push({
        routeId,
        name,
        elements,
        type: isLoop,
        weight: 0,
        similarElement: '',
      });
    });
    const oldPathes = JSON.parse(JSON.stringify(this.pathes));
    // 1) 找到所有路径最相似的路径, 给旧路径标记其最接近的路径
    pathes.forEach(newPath => {
      for (let i = 0; i < this.pathes.length; i++) {
        const path = oldPathes[i];
        const weight = this.similar2Path([...newPath.elements], [...path.elements]);
        if (weight > newPath.weight && path.similarElementWeight <= weight) {
          newPath.weight = weight;
          newPath.similarElement = path;
          if (weight === path.similarElementWeight && path.similarElement) {
            // 特殊处理，如果两个路径都与同一条旧路径有相似的权重，则这两个路径的相似路径都置空
            path.similarElement.similarElement = null;
            path.similarElement.similarElementWeight = 0;
            path.similarElement = null;
            path.similarElementWeight = 0;
          } else {
            path.similarElement = newPath;
            path.similarElementWeight = weight;
          }
        }
      }
    });
    // 2) 再次遍历所有路径，如果该路径的相似路径对应的相似路径是自己，那么就设置该路径id和name为其相似路径。
    pathes.forEach(newPath => {
      if (newPath.similarElement && newPath.similarElement.similarElement === newPath) {
        newPath.routeId = newPath.similarElement.routeId;
        newPath.name = newPath.similarElement.name;
      }
      delete newPath.similarElement;
      delete newPath.weight;
    });

    this.setPathes(pathes);
    return pathes;
  }
  private similar2Path(x, y) {
    let z = 0;
    const s = x.length + y.length;

    x.sort();
    y.sort();
    let a = x.shift();
    let b = y.shift();

    while (a !== undefined && b !== undefined) {
      if (a === b) {
        z++;
        a = x.shift();
        b = y.shift();
      } else if (a < b) {
        a = x.shift();
      } else if (a > b) {
        b = y.shift();
      }
    }
    return (z / s) * 200;
  }
  private getNewId(prefix) {
    return `${prefix}_${getBpmnId()}`;
  }
  /**
   * 判断是否为循环路径
   * 循环路径的最后一个节点在路径的前面出现过
   */
  private isLoopPath(elements) {
    const { length } = elements;
    return elements.indexOf(elements[length - 1]) !== length - 1 ? 1 : 0;
  }
}

export {
  FlowPath,
};
