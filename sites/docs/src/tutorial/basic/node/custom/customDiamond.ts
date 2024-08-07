import LogicFlow, {
  DiamondNode,
  DiamondNodeModel,
  GraphModel,
} from '@logicflow/core';

class CustomDiamondModel extends DiamondNodeModel {
  constructor(data: LogicFlow.NodeConfig, graphModel: GraphModel) {
    data.text = {
      // 自定义文本坐标：向下移动40px
      value: data.text as string,
      x: data.x,
      y: data.y + 40,
    };
    super(data, graphModel);

    this.rx = 50;
    this.ry = 20;
  }
}

export default {
  type: 'custom-diamond',
  view: DiamondNode,
  model: CustomDiamondModel,
};
