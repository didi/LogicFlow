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
        const r = groupModel.isInRange({
          x1: x1 + deltaX,
          y1: y1 + deltaY,
          x2: x2 + deltaX,
          y2: y2 + deltaY,
        });
        return r;
      }
      return true;
    });
    lf.on('node:add', this.appendNodeToGrop);
    lf.on('node:drop', this.appendNodeToGrop);
    lf.on('node:dnd-move', this.setActiveGroup);
    lf.on('node:drag', this.setActiveGroup);
    // lf.on('group:add-node', this.nodeAppendIn);
  }
  appendNodeToGrop = ({ data }) => {
    console.log(333);
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
    if (group && data.id !== group.id) {
      group.addChild(data.id);
      this.nodeGroupMap.set(data.id, group.id);
      group.setAllowAppendChild(false);
    }
  };
  setActiveGroup = ({ data }) => {
    if (this.activeGroup) {
      this.activeGroup.setAllowAppendChild(false);
      this.activeGroup = undefined;
    }
    const bounds = this.lf.getNodeModelById(data.id).getBounds();
    this.activeGroup = this.getGroup(bounds);
    if (this.activeGroup && this.activeGroup.id !== data.id) {
      this.activeGroup.setAllowAppendChild(true);
    }
  };
  getGroups() {
    const groups = [];
    this.lf.graphModel.nodes.forEach((nodeModel) => {
      if (nodeModel.isGroup) {
        groups.push(nodeModel);
      }
    });
  }
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
}

export {
  Group,
  GroupNode,
};
