class CustomEdgeModel extends PolylineEdgeModel {
  getTextPosition() {
    const position = super.getTextPosition();
    const currentPositionList = this.points.split(' ');
    const pointsList = [];
    currentPositionList && currentPositionList.forEach(item => {
      const [x, y] = item.split(',');
      pointsList.push({ x: Number(x), y: Number(y) });
    });
    if (currentPositionList.length > 1) {
      const [ x1, y1 ] = currentPositionList[0].split(',');
      const [ x2, y2 ] = currentPositionList[1].split(',');
      let distence = 50;
      if (x1 === x2) { // 垂直
        if (y2 < y1) {
          distence = -50;
        }
        position.y = Number(y1) + distence;
        position.x = Number(x1);
      } else {
        if (x2 < x1) {
          distence = -50;
        }
        position.x = Number(x1) + distence;
        position.y = Number(y1) - 10;
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