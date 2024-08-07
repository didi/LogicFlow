const shrinkWidth = 100;
const shrinkHeight = 60;
const lf = new window.LogicFlow({
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
  snapline: true,
  stopScrollGraph: true,
  stopZoomGraph: true,
  stopMoveGraph: true,
});
lf.setMenuByType({
  type: 'group',
  menu: [
    {
      text: '收缩',
      callback(group) {
        lf.extension.groupShrink.startShrink(group);
      },
    },
    {
      text: '展开',
      callback(group) {
        lf.extension.groupShrink.startExpand(group);
      },
    },
  ],
});
lf.render({
  nodes: [
    {
      id: 'c_1',
      type: 'circle',
      x: 100,
      y: 100,
    },
    {
      id: 'c_2',
      type: 'circle',
      x: 300,
      y: 200,
    },
    {
      id: 'c_3',
      type: 'group',
      x: 650,
      y: 200,
    },
    {
      id: 'c_4',
      type: 'rect',
      x: 1000,
      y: 200,
    },
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
          y: 100,
        },
        {
          x: 200,
          y: 200,
        },
        {
          x: 250,
          y: 200,
        },
      ],
      sourceNodeId: 'c_1',
      targetNodeId: 'c_2',
    },
    {
      id: 'e_2',
      type: 'polyline',
      pointsList: [
        {
          x: 350,
          y: 200,
        },
        {
          x: 950,
          y: 200,
        },
      ],
      sourceNodeId: 'c_2',
      targetNodeId: 'c_4',
    },
  ],
});
document.querySelector('#selectBtn').addEventListener('click', () => {
  console.log(lf.getGraphData());
  lf.render(lf.getGraphData());
});
// 初始化拖入功能
document.querySelector('#rect').addEventListener('mousedown', () => {
  lf.dnd.startDrag({
    type: 'rect',
  });
});
