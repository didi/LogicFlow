class CustomHexagonModel extends PolygonNodeModel {
  initNodeData(data) {
    super.initNodeData(data)
  }
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
    const circleOnlyAsTarget = {
      message: "六边形节点下一个节点只能是圆形节点",
      validate: (sourceNode, targetNode, sourceAnchor, targetAnchor) => {
        return targetNode.type === "rect";
      },
    };
    this.sourceRules.push(circleOnlyAsTarget);
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
  getAnchorStyle(anchorInfo) {
    const style = super.getAnchorStyle(anchorInfo);
    if (anchorInfo.name === 'left') {
      style.stroke = 'red';
      style.strokeWidth = 2;
    } else {
      style.stroke = 'green';
      style.strokeWidth = 2;
    }
    return style;
  }
  getDefaultAnchor() {
    const { width, height, x, y, id } = this; 
    return [
      {
        x: x - width / 2,
        y,
        name: 'left',
        id: `${id}_0`
      },
      {
        x: x + width / 2,
        y,
        name: 'right',
        id: `${id}_1`
      },
    ]
  }
}

export default {
  type: 'hexagonNode',
  model: CustomHexagonModel,
  view: PolygonNode
}
