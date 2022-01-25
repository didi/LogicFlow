import { remove } from 'lodash-es';
import { EdgeData } from '@logicflow/core';

class GroupShrink {
  static pluginName = 'group-shrink';
  group = null; // group节点
  lf = null; // lf 实例
  shrinkWidth = 100; // 收缩后节点宽度
  shrinkHeight = 60; // 收缩后节点高度

  constructor({ lf }) {
    this.lf = lf;
    this.lf.extension = { ...(this.lf.extension ?? {}), groupShrink: this };
    this.lf.getGraphData = this.getGraphDataWithGroup;
  }

  /**
   * 收缩
   */
  startShrink(group) {
    if (group.type !== 'group') {
      console.log('只有分组节点可以收缩');
      return;
    }
    this.group = group;
    const nodeModel = this.lf.getNodeModelById(group.id);
    const { shrinkProperty: shrinkConfig } = nodeModel.getProperties();
    if (shrinkConfig && shrinkConfig.shrinked) {
      console.log('不能再收缩了');
      return;
    }
    const shrinkProperty = {
      shrinked: true,
      groupNode: { ...this.group },
      innerNodes: [],
      innerEdges: [],
    };
    let newEdges = []; // 需要重新生成的边
    let innerNodes = []; // 分组内节点
    let innerEdges = []; // 分组内部边
    let minX = null;
    let minY = null;

    // 处理分组内的节点和边
    if (this.group && this.group.children && this.group.children.length) {
      const edgesInfo = this.getGroupEdges();
      newEdges = edgesInfo.newEdges;
      innerEdges = edgesInfo.innerEdges;
      const nodesInfo = this.getGroupNodes();
      innerNodes = nodesInfo.innerNodes; // 分组内节点信息
      minX = nodesInfo.minX; // 左上角节点的x
      minY = nodesInfo.minY; // 左上角节点的y
    }
    shrinkProperty.innerNodes = innerNodes;
    shrinkProperty.innerEdges = innerEdges;
    this.lf.setProperties(this.group.id, { shrinkProperty }); // 分组节点收缩前状态、分组内节点、分组内边存入properties
    // 收缩后的分组节点移动到分组内左上角的节点位置
    nodeModel.x = minX || this.group.x;
    nodeModel.y = minY || this.group.y;
    // 收缩，调整节点大小
    nodeModel.width = this.shrinkWidth;
    nodeModel.height = this.shrinkHeight;
    // 生成与分组节点相连的边
    newEdges.forEach(edgeConfig => {
      this.lf.addEdge(edgeConfig);
    });
  }

  /**
   * 展开
   */
  startExpand(group) {
    this.group = group;
    const nodeModel = this.lf.getNodeModelById(group.id);
    const { shrinkProperty = {} } = nodeModel.getProperties();
    const { shrinked, groupNode, innerNodes, innerEdges } = shrinkProperty;
    if (!shrinked) {
      console.log('不能再展开了');
      return;
    }
    // 重新渲染分组节点
    this.lf.deleteNode(group.id);
    this.lf.addNode(groupNode);
    // 恢复分组内的节点
    innerNodes.forEach(item => {
      this.lf.addNode(item);
    });
    // 恢复分组内的节点上所有边
    innerEdges.forEach(item => {
      this.lf.addEdge(item);
    });
    // 修改properties
    this.lf.setProperties(group.id, { shrinkProperty: { shrinked: false } });
  }

  /**
   * 获取分组内的节点上的所有边,以及计算新的分组节点需要连接的边，之后删除原来的边
   */
  private getGroupEdges() {
    const { edges } = this.lf.graphModel.modelToGraphData();
    const { children } = this.group;
    const innerEdges = [];
    const newEdges = [];

    edges.forEach(item => {
      const startInGroup = children.indexOf(item.sourceNodeId) > -1;
      const endInGroup = children.indexOf(item.targetNodeId) > -1;

      if (startInGroup || endInGroup) {
        innerEdges.push(item);
        if (startInGroup && !endInGroup) {
          // 从分组内向外的边
          newEdges.push({
            sourceNodeId: this.group.id,
            targetNodeId: item.targetNodeId,
          });
        }
        if (!startInGroup && endInGroup) {
          // 从外部指向分组内的
          newEdges.push({
            sourceNodeId: item.sourceNodeId,
            targetNodeId: this.group.id,
          });
        }
        this.lf.deleteEdge(item.id);
      }
    });
    return { innerEdges, newEdges };
  }
  /**
   * 获取分组内的节点和左上角节点,获取到有效信息后，删除节点
   */
  private getGroupNodes() {
    const innerNodes = [];
    const { nodes } = this.lf.graphModel.modelToGraphData();
    const { children } = this.group;
    let minX = null;
    let minY = null;
    // 遍历所有节点，在分组内的， 暂存&删除
    nodes.forEach(item => {
      if (children.indexOf(item.id) > -1) {
        innerNodes.push(item);
        if ((!minX || item.x < minX) && (!minY || item.y < minY)) {
          minX = item.x;
          minY = item.y;
        }
        this.lf.deleteNode(item.id);
      }
    });
    return { innerNodes, minX, minY };
  }

  private getGraphDataWithGroup = () => {
    const { nodes, edges } = this.lf.graphModel.modelToGraphData();
    let groupNodes = [];
    let groupEdges = [];
    const shrinkedGroupIds = [];
    nodes.forEach(node => {
      if (node.type === 'group' && node.properties.shrinkProperty && node.properties.shrinkProperty) {
        const {
          shrinked,
          groupNode,
          innerNodes,
          innerEdges,
        } = node.properties.shrinkProperty;
        if (shrinked) {
          // 是收缩状态下的分组节点，需要恢复原来的节点和边
          node = groupNode;
          groupNodes = [...groupNodes, ...innerNodes];
          groupEdges = [...groupEdges, ...innerEdges];
          shrinkedGroupIds.push(groupNode.id);
        }
      }
    });
    // 移除与收缩分组节点相连的边
    if (shrinkedGroupIds.length) {
      remove(edges, (edge: EdgeData) => {
        const { sourceNodeId, targetNodeId } = edge;
        return shrinkedGroupIds.indexOf(sourceNodeId) > -1
                || shrinkedGroupIds.indexOf(targetNodeId) > -1;
      });
    }
    return {
      nodes: [...nodes, ...groupNodes],
      edges: [...edges, ...groupEdges],
    };
  };
}

export {
  GroupShrink,
};
