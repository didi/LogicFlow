window.addEventListener('DOMContentLoaded', () => {
  console.log(document.querySelector('#app'))
  const lf = new LogicFlow({
    container: document.querySelector('#app'),
    edgeTextDraggable: true,
    nodeTextDraggable: true,
    metaKeyMultipleSelected: true,
    grid: {
      type: 'dot',
      size: 20,
    },
    keyboard: {
      enabled: true,
    },
    snapline: true,
  });
  console.log(5);
  lf.register('x-node', ({ RectNode, RectNodeModel }) => {
    return {
      view: RectNode,
      model: RectNodeModel,
    }
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
        id: 'c_3',
        type: 'x-node',
        x: 500,
        y: 200
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
        type: 'polyline',
        pointsList: [
          {
            x: 140,
            y: 100,
          },
          {
            x: 200,
            y: 100
          },
          {
            x: 200,
            y: 200,
          },
          {
            x: 250,
            y: 200
          }
        ],
        sourceNodeId: 'c_1',
        targetNodeId: 'c_2'
      }
    ]
  });

  document.querySelector('#mini-map').addEventListener('click', () => {
    console.log(444)
    MiniMap.show();
  })
})
