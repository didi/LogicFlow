window.onload = function () {
  LogicFlow.use(RectLabelNode);
  LogicFlow.use(ResizeNode);
  const lf = new LogicFlow({
    container: document.querySelector('#app'),
    width: 700,
    height: 600,
    background: {
      color: '#F0F0F0'
    },
    grid: {
      type: 'dot',
      size: 20,
    },
    graphMenuConfig: [
      {
        text: '分享',
        className: 'lf-menu-item',
        callback(graphModel) {
          alert('分享')
        },
      }
    ],
    // nodeTextDraggable: true,
    edgeTextDraggable: true
  });
  // 方便调试
  window.lf = lf;
  
  lf.render({
    nodes: [
      {
        type: 'circle',
        x: 500 * Math.random(),
        y: 600 * Math.random(),
        id: 40,
      },
      {
        type: 'rect-label',
        x: 500 * Math.random(),
        y: 600 * Math.random(),
        id: 50,
        text: '开始',
        properties: {
          moreText: '用户节点'
        }
      },
      {
        type: 'rect-label',
        x: 500 * Math.random(),
        y: 600 * Math.random(),
        id: 51,
        text: '开始2',
        properties: {
          moreText: '系统节点'
        }
      },
    ],
    edges: [
    ],
  });
}