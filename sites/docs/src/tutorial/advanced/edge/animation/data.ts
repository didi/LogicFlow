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
    {
      id: 'rect_9',
      type: 'rect',
      x: 150,
      y: 100,
    },
    {
      id: 'rect_4',
      type: 'rect',
      x: 500,
      y: 100,
    },
    {
      id: 'rect_5',
      type: 'rect',
      x: 150,
      y: 300,
    },
  ],
  edges: [
    {
      sourceNodeId: 'rect_3',
      targetNodeId: 'rect_2',
      type: 'custom-edge',
      text: '连线文本',
    },
    // {
    //   sourceNodeId: 'rect_5',
    //   targetNodeId: 'rect_4',
    //   type: 'bezier',
    // },
    {
      sourceNodeId: 'rect_5',
      targetNodeId: 'rect_9',
      type: 'line',
    },
  ],
};

export default data;
