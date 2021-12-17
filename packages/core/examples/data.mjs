export const baseData = {
  nodes: [
    {
      id: '30',
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
      id: '31',
      type: 'polygon',
      x: 300,
      y: 200,
    },
    {
      id: '32',
      type: 'ellipse',
      x: 100,
      y: 400,
    },
    {
      id: '33',
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
      sourceNodeId: '30',
      targetNodeId: '33',
      type: 'bezier'
    }
  ]
}