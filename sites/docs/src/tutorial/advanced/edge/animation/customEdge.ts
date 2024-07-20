import LogicFlow, { h, LineEdge, LineEdgeModel } from '@logicflow/core';

class CustomEdgeModel extends LineEdgeModel {
  // customTextPosition = true;
  initEdgeData(data: LogicFlow.EdgeConfig) {
    super.initEdgeData(data);
    this.customTextPosition = true;
  }

  setAttributes() {
    this.isAnimation = true;
  }

  setHovered(isHovered: boolean) {
    super.setHovered(isHovered);
    this.isAnimation = isHovered;
  }

  getEdgeAnimationStyle() {
    const style = super.getEdgeAnimationStyle();
    style.strokeDasharray = '5 5';
    style.strokeDashoffset = '100%';
    style.animationDuration = '10s';
    return style;
  }

  getTextPosition() {
    const position = super.getTextPosition();
    const currentPositionList = this.points.split(' ');
    const pointsList: LogicFlow.Point[] = [];
    currentPositionList &&
      currentPositionList.forEach((item) => {
        const [x, y] = item.split(',');
        pointsList.push({ x: Number(x), y: Number(y) });
      });
    if (pointsList.length > 1) {
      const { x: x1, y: y1 } = pointsList[0];
      const { x: x2, y: y2 } = pointsList[1];
      let distence = 50;
      // 垂直
      if (x1 === x2) {
        if (y2 < y1) {
          // 上
          distence = -50;
        }
        position.y = y1 + distence;
        position.x = x1;
      } else {
        // 水平
        if (x2 < x1) {
          // 左
          distence = -50;
        }
        position.x = x1 + distence;
        position.y = y1 - 10;
      }
    }
    return position;
  }
}

class CustomEdge extends LineEdge {
  getEndArrow() {
    const { stroke } = this.props.model.getArrowStyle();
    return h('path', {
      stroke,
      fill: '#FFF',
      d: 'M 0 0 -10 -5 -10 5 z',
    });
  }
}

export default {
  type: 'custom-edge',
  model: CustomEdgeModel,
  view: CustomEdge,
};
