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
      },
      {
        type: 'rect',
        x: 500,
        y: 300,
        text: {
          value: '你好2',
          x: 500,
          y: 300,
        },
        id: 11,
      },
      {
        type: 'rect',
        x: 700,
        y: 300,
        text: {
          value: '你好3',
          x: 700,
          y: 300,
        },
        id: 12,
      }
    ],
    edges: [
      {
        type: 'polyline',
        sourceNodeId: 10,
        targetNodeId: 11
      }
    ],
  });
}
document.getElementById('download').addEventListener('click', () => {
  lf.getSnapshot()
})
document.getElementById('preview').addEventListener('click', () => {
  lf.getSnapshotBlob().then(res=> {
    console.log(res);
    document.getElementById('img').src = img.src = window.URL.createObjectURL(res);
  })
})
document.getElementById('base64').addEventListener('click', () => {
  lf.getSnapshotBase64().then(res => {
    console.log(res)
    document.getElementById('img').src = res;
  })
})