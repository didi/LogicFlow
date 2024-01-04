import { EllipseNode, EllipseNodeModel } from '@logicflow/core';

class CustomEllipseModel extends EllipseNodeModel {
  constructor(data, graphModel) {
    if (data.text && typeof data.text === 'string') {
      data.text = {
        value: data.text,
        x: data.x,
        y: data.y + 40,
      };
    }
    super(data, graphModel);

    this.rx = 50;
    this.ry = 20;
  }
}

export default {
  type: 'custom-ellipse',
  view: EllipseNode,
  model: CustomEllipseModel,
};
