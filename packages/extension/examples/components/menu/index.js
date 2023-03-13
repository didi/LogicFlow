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
    plugins: [Menu],
    pluginsOptions: {
      MiniMap: {
        width: 200,
        height: 170,
        headerTitle: '缩略图',
        topPosition: 20,
        rightPosition: 20,
        bottomPosition: 100,
      }
    },
    snapline: true,
  });
  lf.register({
    type: 'x-node',
    view: RectNode,
    model: RectNodeModel,
  })
  lf.extension.menu.addMenuConfig({
    nodeMenu: [
      {
        text: "分享",
        callback() {
          alert("分享成功！");
        }
      },
      {
        text: "属性",
        callback(node) {
          alert(`
            节点id：${node.id}
            节点类型：${node.type}
            节点坐标：(x: ${node.x}, y: ${node.y})`);
        }
      }
    ],
    edgeMenu: [
      {
        text: "属性",
        callback(edge) {
          alert(`
            边id：${edge.id}
            边类型：${edge.type}
            边坐标：(x: ${edge.x}, y: ${edge.y})
            源节点id：${edge.sourceNodeId}
            目标节点id：${edge.targetNodeId}`);
        }
      }
    ],
    graphMenu: [
      {
        text: "分享",
        callback() {
          alert("分享成功！");
        }
      }
    ]
  });

  lf.render({
    nodes: [
      {
        id: '1',
        x: 100,
        y: 100,
        type: 'rect',
      },
      {
        id: '2',
        x: 300,
        y: 200,
        type: 'rect',
      },
    ],
    edges: [
      {
        sourceNodeId: '1',
        targetNodeId: '2',
        type: 'polyline',
      }
    ]
  });
})
