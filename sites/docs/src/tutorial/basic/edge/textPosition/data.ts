const data = {
  nodes: [
    {
      id: 'rect_1',
      type: 'rect',
      x: 150,
      y: 100,
      text: 'rect',
    },
    {
      id: 'circle_1',
      type: 'circle',
      x: 450,
      y: 300,
      text: 'circle',
    },
  ],
  edges: [
    {
      sourceNodeId: 'rect_1',
      targetNodeId: 'circle_1',
      type: 'custom-edge',
      text: '连线文本',
    },
  ],
};

export default data;
