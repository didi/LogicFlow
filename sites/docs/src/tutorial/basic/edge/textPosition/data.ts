const data = {
  nodes: [
    {
      id: 'rect_2',
      type: 'circle',
      x: 450,
      y: 300,
    },
    {
      id: 'rect_3',
      type: 'rect',
      x: 150,
      y: 100,
    },
  ],
  edges: [
    {
      sourceNodeId: 'rect_3',
      targetNodeId: 'rect_2',
      type: 'custom-edge',
      text: '连线文本',
    },
  ],
};

export default data;
