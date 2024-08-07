import LogicFlow, { PolygonNodeModel, PolygonNode } from '@logicflow/core';

class CustomHexagonModel extends PolygonNodeModel {
  setAttributes() {
    const width = 100;
    const height = 100;
    const x = 50;
    const y = 50;
    // 计算六边形， 中心点为[50, 50], 宽高均为100
    const pointList: LogicFlow.PointTuple[] = [
      [x - 0.205 * width, y - 0.5 * height],
      [x + 0.205 * width, y - 0.5 * height],
      [x + 0.5 * width, y],
      [x + 0.205 * width, y + 0.5 * height],
      [x - 0.205 * width, y + 0.5 * height],
      [x - 0.5 * width, y],
    ];
    this.points = pointList;
  }

  getConnectedSourceRules() {
    const rules = super.getConnectedSourceRules();
    const geteWayOnlyAsTarget = {
      message: '下一个节点只能是circle',
      validate: (
        source: any,
        target: any,
        sourceAnchor: any,
        targetAnchor: any,
      ) => {
        console.log('sourceAnchor, targetAnchor', sourceAnchor, targetAnchor);
        return target.type === 'circle';
      },
    };
    rules.push(geteWayOnlyAsTarget);
    return rules;
  }

  getNodeStyle() {
    const style = super.getNodeStyle();
    if (this.properties.isSelected) {
      style.fill = 'red';
    }
    if (this.isHovered) {
      style.stroke = 'red';
    }
    // 如果此节点不允许被连接，节点变红
    if (this.state === 5) {
      style.fill = 'red';
    }
    if (this.state === 4) {
      style.fill = 'green';
    }
    return style;
  }
}

export default {
  type: 'hexagonNode',
  model: CustomHexagonModel,
  view: PolygonNode,
};
