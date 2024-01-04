import { PolygonNode, PolygonNodeModel } from '@logicflow/core';

class CustomPolygonModel extends PolygonNodeModel {
  setAttributes() {
    const width = 100;
    const height = 100;
    const x = 50;
    const y = 50;
    // 计算多边形， 中心点为[50, 50], 宽高均为100
    const pointList = [
      [x - 0.205 * width, y - 0.5 * height],
      [x + 0.205 * width, y - 0.5 * height],
      [x + 0.5 * width, y - 0.205 * height],
      [x + 0.5 * width, y + 0.205 * height],
      [x + 0.205 * width, y + 0.5 * height],
      [x - 0.205 * width, y + 0.5 * height],
      [x - 0.5 * width, y + 0.205 * height],
      [x - 0.5 * width, y - 0.205 * height],
    ];
    this.points = pointList;
  }
  getTextStyle() {
    const { refX = 0, refY = 0 } = this.properties;
    const style = super.getTextStyle();

    // 通过 transform 重新设置 text 的位置
    return {
      ...style,
      transform: `matrix(1 0 0 1 ${refX} ${refY + 70})`,
    };
  }
}

export default {
  type: 'custom-polygon',
  view: PolygonNode,
  model: CustomPolygonModel,
};
