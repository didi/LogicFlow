const data = {
  nodes: [
    {
      id: 'pool-1',
      type: 'pool',
      x: 375,
      y: 200,
      properties: {
        width: 300,
        height: 300,
        direction: 'vertical',
      },
    },
    {
      id: 'pool-2',
      type: 'pool',
      x: 800,
      y: 200,
      properties: {
        width: 300,
        height: 300,
        direction: 'horizontal',
        laneConfig: {
          text: '60泳道',
        },
      },
      // text: {
      //   x: 515,
      //   y: 200,
      //   value: '泳池示例',
      // },
    },
    // {
    //   id: '1-2',
    //   type: 'rect',
    //   x: 600,
    //   y: 200,
    //   properties: {
    //     width: 300,
    //     height: 300,
    //   },
    //   text: '其他元素',
    // },
  ],
  edges: [],
}

export default data
