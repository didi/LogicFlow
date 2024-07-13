export default {
  nodes: [
    {
      type: 'uml',
      x: 0,
      y: 0,
      id: 'uml_1',
      properties: {
        name: 'haod',
        body: '哈哈哈哈',
      },
    },
    {
      type: 'rect',
      x: 150,
      y: 0,
      text: {
        value: '你好',
        x: 150,
        y: 0,
      },
      id: 'rect_1',
    },
    {
      type: 'rect',
      x: 400,
      y: 100,
      text: {
        value: '你好2',
        x: 400,
        y: 100,
      },
      id: 'rect_2',
    },
    {
      id: '3',
      type: 'image',
      x: 550,
      y: 100,
      text: '云',
    },
    {
      id: '5',
      type: 'image',
      x: 350,
      y: 250,
      text: '菱形',
    },
  ],
  edges: [
    {
      id: 'polyline_1',
      type: 'polyline',
      sourceNodeId: 'rect_1',
      targetNodeId: 'rect_2',
    },
    {
      id: 'e_3',
      type: 'polyline',
      sourceNodeId: '4',
      targetNodeId: '5',
    },
  ],
}
