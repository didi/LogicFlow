import LogicFlow, { RectNode, RectNodeModel } from '@logicflow/core';

class CustomNode extends RectNode {
  // 禁止节点点击后被显示到所有元素前面
  toFront() {
    return false;
  }
}

class CustomNodeModel extends RectNodeModel {
  initNodeData(data: LogicFlow.NodeConfig) {
    if (!data.text || typeof data.text === 'string') {
      data.text = {
        value: data.text || '',
        x: data.x - 230,
        y: data.y,
      };
    }
    super.initNodeData(data);
    this.width = 500;
    this.height = 200;
    this.isGroup = true;
    this.zIndex = -1;
    this.children = data.children;
  }

  getTextStyle() {
    const style = super.getTextStyle();
    style.overflowMode = 'autoWrap';
    style.width = 15;
    return style;
  }
}

export default {
  type: 'custom-node',
  view: CustomNode,
  model: CustomNodeModel,
};
