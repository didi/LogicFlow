class CustomHexagonModel extends PolygonNodeModel {
  setAttributes() {
    const width = 100;
    const height = 100;
    const x = 50;
    const y = 50;
    // 计算六边形， 中心点为[50, 50], 宽高均为100
    const pointList = [
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
      message: '下一个节点只能是customCircle',
      validate: (source, target, sourceAnchor, targetAnchor) => {
        return target.type === 'customCircle';
      },
    };
    rules.push(geteWayOnlyAsTarget);
    return rules;
  }
  getNodeStyle() {
    const style = super.getNodeStyle();
    if (this.properties.isSelected) {
      style.fill = 'red'
    }
    if (this.isHovered) {
      style.stroke = 'red'
    }
    return style
  }
}

export default {
  type: 'hexagonNode',
  model: CustomHexagonModel,
  view: PolygonNode
}
