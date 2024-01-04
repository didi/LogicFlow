import { CircleNode, CircleNodeModel } from '@logicflow/core';

class CustomCircleModel extends CircleNodeModel {
  constructor(data, graphModel) {
    data.text = {
      value: data.text,
      x: data.x,
      y: data.y + 40,
    };
    super(data, graphModel);

    this.r = 20;
  }
}

export default {
  type: 'custom-circle',
  view: CircleNode,
  model: CustomCircleModel,
};
