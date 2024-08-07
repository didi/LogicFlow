class myCurvedEdge extends CurvedEdge {}
class myCurvedEdgeModel extends CurvedEdgeModel {
  initEdgeData(data) {
    super.initEdgeData(data);
    this.radius = 5;
  }
  getEdgeStyle() {
    const style = super.getEdgeStyle();
    style.strokeWidth = 3;
    style.stroke = 'rgb(130, 179, 102)'
    return style;
  }
  setAttributes() {
    this.isAnimation = true;
  }
  getEdgeAnimationStyle() {
    const style = super.getEdgeAnimationStyle();
    style.strokeDasharray = "15 5";
    style.animationDuration = "10s";
    style.stroke = 'rgb(130, 179, 102)'
    return style;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const lf = new LogicFlow({
    container: document.querySelector('#app'),
    edgeTextDraggable: true,
    nodeTextDraggable: true,
    grid: {
      type: 'dot',
      size: 20,
    },
    keyboard: {
      enabled: true,
    },
    snapline: true,
  });
  lf.register({
    type: 'my-curved-edge',
    view: myCurvedEdge,
    model: myCurvedEdgeModel,
  })
  lf.render({
    nodes: [
      {
        id: 'c_1',
        type: 'circle',
        x: 100,
        y: 100
      },
      {
        id: 'c_2',
        type: 'circle',
        x: 300,
        y: 200
      }
    ],
    edges: [
      {
        id: 'e_1',
        type: 'my-curved-edge',
        sourceNodeId: 'c_1',
        targetNodeId: 'c_2'
      }
    ]
  })
})
