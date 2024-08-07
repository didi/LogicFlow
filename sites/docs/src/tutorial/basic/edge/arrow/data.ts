export default {
  nodes: [
    {
      id: 'rect1',
      type: 'rect',
      x: 100,
      y: 100,
      text: 'rect1',
    },
    {
      id: 'rect2',
      type: 'rect',
      x: 500,
      y: 100,
      text: 'rect2',
    },
    {
      id: 'rect3',
      type: 'rect',
      x: 100,
      y: 300,
      text: 'rect3',
    },
    {
      id: 'rect4',
      type: 'rect',
      x: 500,
      y: 300,
      text: 'rect4',
    },
  ],
  edges: [
    {
      id: 'customArrow1',
      type: 'custom-arrow',
      sourceNodeId: 'rect1',
      targetNodeId: 'rect2',
      properties: {
        arrowType: 'empty',
      },
      text: '空心箭头',
    },
    {
      id: 'customArrow2',
      type: 'custom-arrow',
      sourceNodeId: 'rect3',
      targetNodeId: 'rect4',
      properties: {
        arrowType: 'half',
      },
      text: '半箭头',
    },
  ],
};
