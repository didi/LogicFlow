window.onload = function () {
  const lf = new LogicFlow({
    container: document.querySelector('#app'),
    // fixme: grid成为了必传的了
    grid: {
      type: 'dot',
      size: 10,
    },
    keyboard: {
      enabled: true,
    },
  });
  lf.setTheme({
    rect: {
      radius: 50,
      strokeWidth: 2,
    },
  });
  lf.render({
    nodes: [
      {
        id: 10,
        type: 'rect',
        x: 100,
        y: 100,
      },
      {
        id: 20,
        type: 'rect',
        x: 400,
        y: 100,
      },
    ],
    edges: [
      {
        type: 'polyline',
        sourceNodeId: 10,
        targetNodeId: 20,
      },
    ],
  });
  lf.on('node:resize', (data) => {
    console.log(data);
  })
  // 初始化拖入功能
  document.querySelector('#rect').addEventListener('mousedown', () => {
    lf.dnd.startDrag({
      type: 'rect',
    });
  });
  document.querySelector('#circle').addEventListener('mousedown', () => {
    lf.dnd.startDrag({
      type: 'ellipse',
    });
  });
  document.querySelector('#diamond').addEventListener('mousedown', () => {
    lf.dnd.startDrag({
      type: 'diamond',
    });
  });
  document.querySelector('#data').addEventListener('mousedown', () => {
    console.log(JSON.stringify(lf.getGraphData()));
  });
};
