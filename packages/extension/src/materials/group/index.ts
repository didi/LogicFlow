import LogicFlow, { BaseNodeModel } from '@logicflow/core';
import GroupNode from './GroupNode';

type BaseNodeId = string;
type GroupId = string;

type Bounds = {
  x1: number,
  y1: number,
  x2: number,
  y2: number,
};

class Group {
  static pluginName = 'group';
  lf: LogicFlow;
  activeGroup: any;
  nodeGroupMap: Map<BaseNodeId, GroupId> = new Map();
  constructor({ lf }) {
    lf.register(GroupNode);
    this.lf = lf;
    lf.graphModel.addNodeMoveRules((model, deltaX, deltaY) => {
      if (model.isGroup) { // 如果移动的是分组，那么分组的子节点也跟着移动。
        lf.graphModel.moveNodes([...model.children], deltaX, deltaY, true);
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
    lf.on('node:add', this.appendNodeToGroup);
    lf.on('node:delete', this.deleteGroupChild);
    lf.on('node:drop', this.appendNodeToGroup);
    lf.on('node:dnd-drag', this.setActiveGroup);
    lf.on('node:drag', this.setActiveGroup);
    lf.on('graph:rendered', this.graphRendered);
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
    const bounds = this.lf.getNodeModelById(data.id).getBounds();
    const group = this.getGroup(bounds);
    if (!group) return;
    const isAllowAppendIn = group.isAllowAppendIn(data);
    if (!isAllowAppendIn) {
      this.lf.emit('group:not-allowed', {
        group: group.getData(),
        node: data,
      });
      return;
    }
    if (data.id !== group.id) {
      group.addChild(data.id);
      this.nodeGroupMap.set(data.id, group.id);
      group.setAllowAppendChild(false);
    } else if (data.children && data.children.length > 0) {
      // 表示当前添加的节点是一个新增的group
      data.children.forEach((nodeId) => {
        this.nodeGroupMap.set(nodeId, data.id);
      });
    }
  };
  deleteGroupChild = ({ data }) => {
    const groupId = this.nodeGroupMap.get(data.id);
    if (groupId) {
      const group = this.lf.getNodeModelById(groupId);
      group.removeChild(data.id);
      this.nodeGroupMap.delete(data.id);
    }
  };
  setActiveGroup = ({ data }) => {
    const nodeModel = this.lf.getNodeModelById(data.id);
    if (nodeModel.isGroup) return;
    const bounds = nodeModel.getBounds();
    const newGroup = this.getGroup(bounds);
    if (newGroup || newGroup !== this.activeGroup) {
      if (this.activeGroup) {
        this.activeGroup.setAllowAppendChild(false);
      }
      if (newGroup) {
        const isAllowAppendIn = newGroup.isAllowAppendIn(data);
        if (!isAllowAppendIn) {
          return;
        }
        this.activeGroup = newGroup;
        this.activeGroup.setAllowAppendChild(true);
      }
    }
  };
  /**
   * 获取自定位置其所属分组
   */
  getGroup(bounds: Bounds): BaseNodeModel | undefined {
    const { nodes } = this.lf.graphModel;
    for (let i = 0; i < nodes.length; i++) {
      const model = nodes[i];
      if (model.isGroup && model.isInRange(bounds)) {
        return model;
      }
    }
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
