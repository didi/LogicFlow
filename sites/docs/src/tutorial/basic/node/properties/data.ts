export default {
  nodes: [
    {
      id: '1',
      type: 'custom-rect',
      x: 100,
      y: 100,
      text: 'default',
      properties: {
        width: 70,
        height: 70,
      },
    },
    {
      id: '2',
      type: 'custom-rect',
      x: 300,
      y: 100,
      text: 'pass',
      properties: {
        statu: 'pass', // 业务属性
        width: 100, // 形状属性
        height: 100,
        radius: 20,
        style: {
          // 样式属性
          strokeWidth: 3,
        },
      },
    },
    {
      id: '3',
      type: 'custom-rect',
      x: 500,
      y: 100,
      text: 'reject',
      properties: {
        statu: 'reject',
        width: 130,
        height: 130,
      },
    },
  ],
};
