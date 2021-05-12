window.addEventListener('DOMContentLoaded', () => {
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
        type: 'curved-edge',
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
  })
})
