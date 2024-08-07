import LogicFlow, {
  CircleNode,
  CircleNodeModel,
  GraphModel,
} from '@logicflow/core';

class CustomCircleModel extends CircleNodeModel {
  constructor(data: LogicFlow.NodeConfig, graphModel: GraphModel) {
    data.text = {
      // 自定义文本坐标：向下移动40px
      value: data.text as string,
      x: data.x,
      y: data.y + 40,
    };
    super(data, graphModel);

    // 半径：控制圆形大小
    this.r = 20;
  }
}

export default {
  type: 'custom-circle',
  view: CircleNode,
  model: CustomCircleModel,
};
