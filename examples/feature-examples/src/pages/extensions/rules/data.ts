export default {
  nodes: [
    {
      id: 'start',
      type: 'start',
      x: 150,
      y: 70,
      text: '开始',
    },
    {
      id: 'user-task',
      type: 'user-task',
      x: 400,
      y: 70,
      text: '用户节点',
    },
  ],
  edges: [
    {
      type: 'polyline',
      sourceNodeId: 'start',
      targetNodeId: 'user-task',
    },
  ],
}
