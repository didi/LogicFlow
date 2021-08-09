class CustomEdgeModel extends PolylineEdgeModel {
  customTextPosition = true;
  getTextPosition() {
    const position = super.getTextPosition();
    const currentPositionList = this.points.split(' ');
    const pointsList = [];
    currentPositionList && currentPositionList.forEach(item => {
      const [x, y] = item.split(',');
      pointsList.push({ x: Number(x), y: Number(y) });
    });
    if (currentPositionList.length > 1) {
      let [ x1, y1 ] = currentPositionList[0].split(',');
      let [ x2, y2 ] = currentPositionList[1].split(',');
      let distence = 50;
      x1 = Number(x1)
      y1 = Number(y1)
      x2 = Number(x2)
      y2 = Number(y2)
      if (x1 === x2) { // 垂直
        if (y2 < y1) {
          distence = -50;
        }
        position.y = y1 + distence;
        position.x = x1;
      } else {
        if (x2 < x1) {
          distence = -50;
        }
        position.x = x1 + distence;
        position.y = y1 - 10;
      }
    }
    return position;
  }
}

class CustomEdge extends PolylineEdge {

}

export default {
  type: 'custom-edge',
  model: CustomEdgeModel,
  view: CustomEdge
}