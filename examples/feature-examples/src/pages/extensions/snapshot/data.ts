export default {
  nodes: [
    {
      type: 'customHtml',
      x: 0,
      y: 50,
      id: 'uml_1',
      properties: {
        name: 'hello',
        body: '哈哈哈哈',
      },
    },
    {
      id: 'rect_1',
      type: 'rect',
      x: 200,
      y: 0,
      text: '你好1',
    },
    {
      id: 'rect_2',
      type: 'rect',
      x: 400,
      y: 0,
      text: '你好2',
    },
    {
      id: '3',
      type: 'image',
      x: 200,
      y: 100,
      text: '云',
    },
    {
      id: '5',
      type: 'image',
      x: 400,
      y: 100,
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
      sourceNodeId: '3',
      targetNodeId: '5',
    },
  ],
}
