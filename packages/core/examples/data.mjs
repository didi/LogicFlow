export const baseData = {
  nodes: [
    {
      id: '1',
      type: 'rect',
      x: 500,
      y: 200,
    },
    {
      type: 'circle',
      x: 100,
      y: 200,
    },
    {
      id: '2',
      type: 'polygon',
      x: 300,
      y: 200,
    },
    {
      id: '3',
      type: 'ellipse',
      x: 100,
      y: 400,
    },
    {
      id: '4',
      type: 'diamond',
      x: 300,
      y: 400,
    },
    {
      type: 'text',
      x: 500,
      y: 400,
      text: '33333'
    }
  ],
  edges: [
    {
      id: '11',
      sourceNodeId: '1',
      targetNodeId: '3',
      type: 'polyline'
    }
  ]
}