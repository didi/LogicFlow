export default {
  nodes: [
    {
      id: 'rect',
      type: 'rect',
      x: 150,
      y: 70,
      text: '矩形',
    },
    {
      id: 'circle',
      type: 'circle',
      x: 400,
      y: 70,
      text: '圆形',
    },
  ],
  edges: [
    {
      type: 'polyline',
      sourceNodeId: 'rect',
      targetNodeId: 'circle',
    },
  ],
}
