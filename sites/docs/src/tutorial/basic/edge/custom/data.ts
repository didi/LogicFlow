const data = {
  nodes: [
    {
      id: '1',
      type: 'rect',
      x: 100,
      y: 100,
      text: '矩形',
    },
    {
      id: '2',
      type: 'circle',
      x: 300,
      y: 100,
      text: '圆形',
    },
    {
      id: '3',
      type: 'ellipse',
      x: 500,
      y: 100,
      text: '椭圆',
    },
    {
      id: '4',
      type: 'polygon',
      x: 100,
      y: 250,
      text: '多边形',
    },
    {
      id: '5',
      type: 'diamond',
      x: 300,
      y: 250,
      text: '菱形',
    },
    {
      id: '6',
      type: 'text',
      x: 500,
      y: 250,
      text: '纯文本节点',
    },
  ],
  edges: [
    {
      id: '10',
      sourceNodeId: '1',
      targetNodeId: '3',
      startPoint: {
        x: 100,
        y: 60,
      },
      endPoint: {
        x: 500,
        y: 50,
      },
      text: 'sequence',
      type: 'sequence',
      properties: {
        isstrokeDashed: true, // 是否虚线
      },
    },
    {
      sourceNodeId: '3',
      targetNodeId: '4',
      type: 'line',
    },
    {
      sourceNodeId: '3',
      targetNodeId: '5',
      type: 'line',
    },
  ],
};

export default data;
