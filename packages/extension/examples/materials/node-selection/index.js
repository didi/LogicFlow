window.addEventListener('DOMContentLoaded', () => {
  const lf = new LogicFlow({
    container: document.querySelector('#app'),
    edgeTextDraggable: true,
    nodeTextDraggable: true,
    multipleSelectKey: 'shift',
    disabledTools: ['multipleSelect'],
    // metaKeyMultipleSelected: false,
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
    // edges: [
    //   {
    //     id: 'e_1',
    //     type: 'edge',
    //     pointsList: [
    //       {
    //         x: 140,
    //         y: 100,
    //       },
    //       {
    //         x: 200,
    //         y: 100
    //       },
    //       {
    //         x: 200,
    //         y: 200,
    //       },
    //       {
    //         x: 250,
    //         y: 200
    //       }
    //     ],
    //     sourceNodeId: '1',
    //     targetNodeId: '2'
    //   }
    // ],
    nodes: [
      {
        id: '1',
        type: 'rect',
        x: 50,
        y: 50,
        text: 'rect1',
      },
      {
        id: '2',
        type: 'rect',
        x: 250,
        y: 50,
        text: 'rect2'
      },
      {
        id: '3',
        type: 'rect',
        x: 50,
        y: 250,
        text: 'rect3'
      },
      {
        id: '4',
        type: 'rect',
        x: 250,
        y: 250,
        text: 'rect4',
        properties: {
          // activated: 'true'
        }
      },
      {
        id: '5',
        type: 'node-selection',
        properties: {
          node_selection_ids: ['2', '4'],
          label_text: '方案',
          active_color: '#6a35ed',
        }
      }
    ]
  })

  lf.on('node:contextmenu', (val) => {
    if (val.data.type === 'node-selection') {
      const el = document.querySelector(`#${val.data.id}`)
      console.log(el.getBoundingClientRect())
    }
  });
})
