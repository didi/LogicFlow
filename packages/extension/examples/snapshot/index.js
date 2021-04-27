window.onload = function () {
  LogicFlow.use(Snapshot);
  const lf = new LogicFlow({
    container: document.querySelector('#app'),
    width: 700,
    height: 300,
    tool: {
      menu: true,
      control: true,
    },
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
  class UserModel extends RectNodeModel {
  }
  class UserNode extends RectNode {
  }
  lf.register({
    type: 'user',
    view: UserNode,
    model: UserModel,
  });
  lf.render({
    nodes: [
      {
        type: 'rect',
        x: 300,
        y: 200,
        text: {
          value: '你好',
          x: 300,
          y: 200,
        },
        id: 10,
      }
    ],
    edges: [
    ],
  });
}
document.getElementById('download').addEventListener('click', () => {
  lf.getSnapshot()
})