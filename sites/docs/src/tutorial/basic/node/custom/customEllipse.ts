import LogicFlow, {
  EllipseNode,
  EllipseNodeModel,
  GraphModel,
} from '@logicflow/core';

class CustomEllipseModel extends EllipseNodeModel {
  constructor(data: LogicFlow.NodeConfig, graphModel: GraphModel) {
    if (data.text && typeof data.text === 'string') {
      data.text = {
        // 自定义文本坐标：向下移动40px
        value: data.text,
        x: data.x,
        y: data.y + 40,
      };
    }
    super(data, graphModel);

    // rx：x轴的半径 ry：y轴的半径，通过rx，ry控制椭圆大小
    this.rx = 50;
    this.ry = 20;
  }
}

export default {
  type: 'custom-ellipse',
  view: EllipseNode,
  model: CustomEllipseModel,
};
