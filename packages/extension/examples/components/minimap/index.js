window.addEventListener('DOMContentLoaded', () => {
  MiniMap.setOption({
    width: 200,
    height: 170,
    headerTitle: '缩略图',
    // topPosition: 20,
    // rightPosition: 20,
    // bottomPosition: 40,
  })
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
    plugins: [Control, MiniMap],
    snapline: true,
  });
  lf.register({
    type: 'x-node',
    view: RectNode,
    model: RectNodeModel,
  })
  console.log(lf.extension);
  const nodes = [];
  const edges = [];
  for (let i = 0; i < 100; i++) {
    const nodeStart = {
      id: i * 2 + 1,
      type: 'rect',
      x: 400 * (i % 10) + 200,
      y: 100 * Math.floor(i / 10) + 100,
      text: String(`${i}-start`),
    }
    const nodeEnd = {
      id: i * 2 + 2,
      type: 'rect',
      x: 400 * (i % 10) + 400,
      y: 100 * Math.floor(i / 10) + 100,
      text: String(`${i}-end`),
    }
    const edge = {
      id: `e_${i}`,
      type: 'polyline',
      sourceNodeId: i * 2 + 1,
      targetNodeId: i * 2 + 2,
    }
    nodes.push(nodeStart);
    nodes.push(nodeEnd);
    edges.push(edge);
  }
  lf.render({nodes, edges});

  document.querySelector('#mini-map').addEventListener('click', () => {
    lf.extension.miniMap.show();
  })
  document.querySelector('#reset').addEventListener('click', () => {
    lf.extension.miniMap.reset();
  })
})
