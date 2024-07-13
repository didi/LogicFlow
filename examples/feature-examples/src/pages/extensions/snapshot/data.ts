export default {
  nodes: [
    {
      type: 'uml',
      x: 100,
      y: 100,
      id: 'uml_1',
      properties: {
        name: 'haod',
        body: '哈哈哈哈',
      },
    },
    {
      type: 'rect',
      x: 300,
      y: 200,
      text: {
        value: '你好',
        x: 300,
        y: 200,
      },
      id: 'rect_1',
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
      id: 'rect_2',
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
      id: 'rect_3',
    },
  ],
  edges: [
    {
      id: 'polyline_1',
      type: 'polyline',
      sourceNodeId: 'rect_1',
      targetNodeId: 'rect_2',
    },
  ],
}
