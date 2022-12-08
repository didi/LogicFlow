import { PolylineEdge, PolylineEdgeModel, h } from '@logicflow/core';

class CurvedEdgeView extends PolylineEdge {
  pointFilter(points) {
    const allPoints = points;
    let i = 1;
    while (i < allPoints.length - 1) {
      const [x, y] = allPoints[i - 1];
      const [x1, y1] = allPoints[i];
      const [x2, y2] = allPoints[i + 1];
      if ((x === x1 && x1 === x2)
        || (y === y1 && y1 === y2)) {
        allPoints.splice(i, 1);
      } else {
        i++;
      }
    }
    return allPoints;
  }
  getEdge() {
    const { model } = this.props;
    const { points, isAnimation, arrowConfig, radius = 5 } = model;
    const style = model.getEdgeStyle();
    const animationStyle = model.getEdgeAnimationStyle();
    const points2 = this.pointFilter(points.split(' ').map((p) => p.split(',').map(a => Number(a))));
    const [startX, startY] = points2[0];
    let d = `M${startX} ${startY}`;
    // 1) 如果一个点不为开始和结束，则在这个点的前后增加弧度开始和结束点。
    // 2) 判断这个点与前一个点的坐标
    //    如果x相同则前一个点的x也不变，
    //    y为（这个点的y 大于前一个点的y, 则 为 这个点的y - 5；小于前一个点的y, 则为这个点的y+5）
    //    同理，判断这个点与后一个点的x,y是否相同，如果x相同，则y进行加减，如果y相同，则x进行加减
    for (let i = 1; i < points2.length - 1; i++) {
      const [preX, preY] = points2[i - 1];
      const [currentX, currentY] = points2[i];
      const [nextX, nextY] = points2[i + 1];
      if (currentX === preX && currentY !== preY) {
        const y = currentY > preY ? currentY - radius : currentY + radius;
        d = `${d} L ${currentX} ${y}`;
      }
      if (currentY === preY && currentX !== preX) {
        const x = currentX > preX ? currentX - radius : currentX + radius;
        d = `${d} L ${x} ${currentY}`;
      }
      d = `${d} Q ${currentX} ${currentY}`;
      if (currentX === nextX && currentY !== nextY) {
        const y = currentY > nextY ? currentY - radius : currentY + radius;
        d = `${d} ${currentX} ${y}`;
      }
      if (currentY === nextY && currentX !== nextX) {
        const x = currentX > nextX ? currentX - radius : currentX + radius;
        d = `${d} ${x} ${currentY}`;
      }
    }
    const [endX, endY] = points2[points2.length - 1];
    d = `${d} L ${endX} ${endY}`;
    const attrs = {
      d,
      style: isAnimation ? animationStyle : {},
      ...style,
      ...arrowConfig,
      fill: 'none',
    };
    return h(
      'path',
      {
        d,
        ...attrs,
      },
    );
  }
}

class CurvedEdgeModel extends PolylineEdgeModel {
}

const CurvedEdge = {
  type: 'curved-edge',
  view: CurvedEdgeView,
  model: CurvedEdgeModel,
};

export { CurvedEdge };

export default CurvedEdge;
