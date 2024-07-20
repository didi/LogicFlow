const data = {
  nodes: [
    {
      type: 'custom-node',
      x: 300,
      y: 250,
      text: '你好',
      children: ['circle-1'],
    },
    {
      type: 'movable-node',
      x: 100,
      y: 70,
      text: '你好',
    },
    {
      id: 'circle-1',
      type: 'circle',
      x: 300,
      y: 250,
      text: 'hello world',
    },
  ],
  edges: [],
};

export default data;
