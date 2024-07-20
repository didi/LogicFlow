import LogicFlow, { RectNode, RectNodeModel } from '@logicflow/core';

class MovableNode extends RectNode {}

class MovableNodeModel extends RectNodeModel {
  initNodeData(data: LogicFlow.NodeConfig) {
    super.initNodeData(data);
    this.moveRules.push((model, deltaX, deltaY) => {
      // 不允许移动到坐标为负值的地方
      if (
        model.x + deltaX - this.width / 2 < 0 ||
        model.y + deltaY - this.height / 2 < 0
      ) {
        return false;
      }
      return true;
    });
  }
}

export default {
  type: 'movable-node',
  view: MovableNode,
  model: MovableNodeModel,
};
