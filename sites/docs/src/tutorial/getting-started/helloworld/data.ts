const data = {
  nodes: [
    {
      id: '1',
      type: 'rect',
      x: 100,
      y: 100,
      text: '节点1',
    },
    {
      id: '2',
      type: 'circle',
      x: 300,
      y: 100,
      text: '节点2',
    },
  ],
  edges: [
    {
      sourceNodeId: '1',
      targetNodeId: '2',
      type: 'polyline',
      text: '连线',
      startPoint: {
        x: 140,
        y: 100,
      },
      endPoint: {
        x: 250,
        y: 100,
      },
    },
  ],
};

export default data;
