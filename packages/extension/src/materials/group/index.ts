/* eslint-disable no-shadow */
import LogicFlow, { BaseEdgeModel, BaseNodeModel, GraphConfigData } from '@logicflow/core';
import GroupNode from './GroupNode';

type BaseNodeId = string;
type GroupId = string;

type Bounds = {
  x1: number,
  y1: number,
  x2: number,
  y2: number,
};

const DEFAULT_TOP_Z_INDEX = -1000;
const DEFAULT_BOTTOM_Z_INDEX = -10000;
class Group {
  static pluginName = 'group';
  lf: LogicFlow;
  topGroupZIndex = DEFAULT_BOTTOM_Z_INDEX;
  activeGroup: any;
  nodeGroupMap: Map<BaseNodeId, GroupId> = new Map();
  constructor({ lf }) {
    lf.register(GroupNode);
    this.lf = lf;
    lf.graphModel.addNodeMoveRules((model, deltaX, deltaY) => {
      if (model.isGroup) { // 如果移动的是分组，那么分组的子节点也跟着移动。
        const nodeIds = this.getNodeAllChild(model);
        lf.graphModel.moveNodes(nodeIds, deltaX, deltaY, true);
        return true;
      }
      const groupModel = lf.getNodeModelById(this.nodeGroupMap.get(model.id));
      if (groupModel && groupModel.isRestrict) { // 如果移动的节点存在分组中，且这个分组禁止子节点移出去。
        const { x1, y1, x2, y2 } = model.getBounds();
        const r = groupModel.isAllowMoveTo({
          x1: x1 + deltaX,
          y1: y1 + deltaY,
          x2: x2 + deltaX,
          y2: y2 + deltaY,
        });
        return r;
      }

      return true;
    });
    lf.graphModel.group = this;
    lf.on('node:add,node:drop,node:dnd-add', this.appendNodeToGroup);
    lf.on('node:delete', this.deleteGroupChild);
    lf.on('node:dnd-drag,node:drag', this.setActiveGroup);
    lf.on('node:click', this.nodeSelected);
    lf.on('graph:rendered', this.graphRendered);
    lf.addElements = function addElements({ nodes, edges }: GraphConfigData): {
      nodes: BaseNodeModel[];
      edges: BaseEdgeModel[];
    } {
      const nodeIdMap: any = {};
      const elements: any = {
        nodes: [],
        edges: [],
      };
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const preId = node.id;
        const { children, ...rest } = node;
        const nodeModel = lf.addNode(rest);
        const fn = (children: Set<string>, current: BaseNodeModel) => {
          children?.forEach((childId: string) => {
            const childNodeModel = lf.getNodeModelById(childId);
            const { x, y, properties, type, text, rotate, children } = childNodeModel;
            const newChildModel = lf.addNode({
              x: x + 40,
              y: y + 40,
              properties,
              type,
              text: {
                ...text,
                x: text.x + 40,
                y: text.y + 40,
              },
              rotate,
            });
            current.addChild(newChildModel.id);
            if (children instanceof Set) {
              fn(children, newChildModel);
            }
          });
        };
        fn(children, nodeModel);
        if (!nodeModel) return { nodes: [], edges: [] };
        if (preId) nodeIdMap[preId] = nodeModel.id;
        elements.nodes.push(nodeModel);
      }
      edges.forEach((edge) => {
        let sourceId = edge.sourceNodeId;
        let targetId = edge.targetNodeId;
        if (nodeIdMap[sourceId]) sourceId = nodeIdMap[sourceId];
        if (nodeIdMap[targetId]) targetId = nodeIdMap[targetId];
        const edgeModel = lf.graphModel.addEdge({
          ...edge,
          sourceNodeId: sourceId,
          targetNodeId: targetId,
        });
        elements.edges.push(edgeModel);
      });
      return elements;
    };
  }
  /**
   * 获取一个节点内部所有的子节点，包裹分组的子节点
   */
  getNodeAllChild(model) {
    let nodeIds = [];
    if (model.children) {
      model.children.forEach((nodeId) => {
        nodeIds.push(nodeId);
        const nodeModel = this.lf.getNodeModelById(nodeId);
        if (nodeModel.isGroup) {
          nodeIds = nodeIds.concat(this.getNodeAllChild(nodeModel));
        }
      });
    }
    return nodeIds;
  }
  graphRendered = (data) => {
    // 如果节点
    if (data && data.nodes) {
      data.nodes.forEach(node => {
        if (node.children) {
          node.children.forEach(nodeId => {
            this.nodeGroupMap.set(nodeId, node.id);
          });
        }
      });
    }
  };
  appendNodeToGroup = ({ data }) => {
    // 如果这个节点之前已经在group中了，则将其从之前的group中移除
    const preGroupId = this.nodeGroupMap.get(data.id);
    if (preGroupId) {
      const preGroup = this.lf.getNodeModelById(preGroupId);
      preGroup.removeChild(data.id);
      this.nodeGroupMap.delete(data.id);
      preGroup.setAllowAppendChild(false);
    }
    // 然后再判断这个节点是否在某个group中，如果在，则将其添加到对应的group中
    const nodeModel = this.lf.getNodeModelById(data.id);
    const bounds = nodeModel.getBounds();
    const group = this.getGroup(bounds, data);
    // https://github.com/didi/LogicFlow/issues/1261
    // 当使用SelectionSelect框选后触发lf.addNode(Group)
    // 会触发appendNodeToGroup()的执行
    // 由于this.getGroup()会判断node.id !== nodeData.id
    // 因此当addNode是Group类型时，this.getGroup()会一直返回空
    // 导致了下面这段代码无法执行，也就是无法将当前添加的Group添加到this.nodeGroupMap中
    // 这导致了折叠分组时触发的foldEdge()无法正确通过getNodeGroup()拿到正确的groupId
    // 从而导致折叠分组时一直都会创建一个虚拟边
    // 而初始化分组时由于正确设置了nodeGroupMap的数据，因此不会产生虚拟边的错误情况
    if (nodeModel.isGroup) {
      // 如果这个节点是分组，那么将其子节点也记录下来
      data.children.forEach((nodeId) => {
        this.nodeGroupMap.set(nodeId, data.id);
      });
      this.nodeSelected({ data, isSelected: false, isMultiple: false });
    }
    if (!group) return;
    const isAllowAppendIn = group.isAllowAppendIn(data);
    if (!isAllowAppendIn) {
      this.lf.emit('group:not-allowed', {
        group: group.getData(),
        node: data,
      });
      return;
    }
    group.addChild(data.id);
    this.nodeGroupMap.set(data.id, group.id);
    group.setAllowAppendChild(false);
  };
  deleteGroupChild = ({ data }) => {
    // 如果删除的是分组节点，则同时删除分组的子节点
    if (data.children) {
      data.children.forEach((nodeId) => {
        this.nodeGroupMap.delete(nodeId);
        this.lf.deleteNode(nodeId);
      });
    }
    const groupId = this.nodeGroupMap.get(data.id);
    if (groupId) {
      const group = this.lf.getNodeModelById(groupId);
      group.removeChild(data.id);
      this.nodeGroupMap.delete(data.id);
    }
  };
  setActiveGroup = ({ data }) => {
    const nodeModel = this.lf.getNodeModelById(data.id);
    const bounds = nodeModel.getBounds();
    const newGroup = this.getGroup(bounds, data);
    if (this.activeGroup) {
      this.activeGroup.setAllowAppendChild(false);
    }
    if (!newGroup || (nodeModel.isGroup && newGroup.id === data.id)) return;
    const isAllowAppendIn = newGroup.isAllowAppendIn(data);
    if (!isAllowAppendIn) {
      return;
    }
    this.activeGroup = newGroup;
    this.activeGroup.setAllowAppendChild(true);
  };
  /**
   * 1. 分组节点默认在普通节点下面。
   * 2. 分组节点被选中后，会将分组节点以及其内部的其他分组节点放到其余分组节点的上面。
   * 3. 分组节点取消选中后，不会将分组节点重置为原来的高度。
   * 4. 由于LogicFlow核心目标是支持用户手动绘制流程图，所以不考虑一张流程图超过1000个分组节点的情况。
   */
  nodeSelected = ({ data, isMultiple, isSelected }) => {
    const nodeModel = this.lf.getNodeModelById(data.id);
    this.toFrontGroup(nodeModel);
    // 重置所有的group zIndex,防止group节点zIndex增长为正。
    if (this.topGroupZIndex > DEFAULT_TOP_Z_INDEX) {
      this.topGroupZIndex = DEFAULT_BOTTOM_Z_INDEX;
      const allGroups = this.lf.graphModel.nodes
        .filter(node => node.isGroup)
        .sort((a, b) => a.zIndex - b.zIndex);
      let preZIndex = 0;
      for (let i = 0; i < allGroups.length; i++) {
        const group = allGroups[i];
        if (group.zIndex !== preZIndex) {
          this.topGroupZIndex++;
          preZIndex = group.zIndex;
        }
        group.setZIndex(this.topGroupZIndex);
      }
    }
    // FIX #1004
    // 如果节点被多选，
    // 这个节点是分组，则将分组的所有子节点取消选中
    // 这个节点是分组的子节点，且其所属分组节点已选，则取消选中
    if (isMultiple && isSelected) {
      if (nodeModel.isGroup) {
        nodeModel.children.forEach((child) => {
          const childModel = this.lf.graphModel.getElement(child);
          childModel.setSelected(false);
        });
      } else {
        const groupId = this.nodeGroupMap.get(data.id);
        if (groupId) {
          const groupModel = this.lf.getNodeModelById(groupId);
          groupModel.isSelected && nodeModel.setSelected(false);
        }
      }
    }
  };
  toFrontGroup = (model) => {
    if (!model || !model.isGroup) {
      return;
    }
    this.topGroupZIndex++;
    model.setZIndex(this.topGroupZIndex);
    if (model.children) {
      model.children.forEach((nodeId) => {
        const node = this.lf.getNodeModelById(nodeId);
        this.toFrontGroup(node);
      });
    }
  };
  /**
   * 获取自定位置其所属分组
   * 当分组重合时，优先返回最上层的分组
   */
  getGroup(bounds: Bounds, nodeData: BaseNodeModel): BaseNodeModel | undefined {
    const { nodes } = this.lf.graphModel;
    const groups = nodes.filter(
      node => node.isGroup && node.isInRange(bounds) && node.id !== nodeData.id,
    );
    if (groups.length === 0) return;
    if (groups.length === 1) return groups[0];
    let topGroup = groups[groups.length - 1];
    for (let i = groups.length - 2; i >= 0; i--) {
      if (groups[i].zIndex > topGroup.zIndex) {
        topGroup = groups[i];
      }
    }
    return topGroup;
  }
  /**
   * 获取某个节点所属的groupModel
   */
  getNodeGroup(nodeId) {
    const groupId = this.nodeGroupMap.get(nodeId);
    if (groupId) {
      return this.lf.getNodeModelById(groupId);
    }
  }
}

export {
  Group,
  GroupNode,
};
