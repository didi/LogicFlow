import { DiamondNode, DiamondNodeModel } from '@logicflow/core';

class CustomDiamondModel extends DiamondNodeModel {
  constructor(data, graphModel) {
    data.text = {
      value: data.text,
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
