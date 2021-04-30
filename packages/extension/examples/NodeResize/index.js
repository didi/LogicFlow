window.onload = function () {
  const lf = new LogicFlow({
    container: document.querySelector('#app'),
    // fixme: grid成为了必传的了
    grid: {
      type: 'dot',
      size: 20,
    },
  });
  lf.setTheme({
    rect: {
      radius: 40,
      strokeWidth: 2,
      outlineColor: 'transparent',
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
  console.log(lf);
  // 初始化拖入功能
  document.querySelector('#rect').addEventListener('mousedown', () => {
    lf.dnd.startDrag({
      type: 'rect',
    });
  });
  document.querySelector('#circle').addEventListener('mousedown', () => {
    lf.dnd.startDrag({
      type: 'circle',
    });
  });
};
