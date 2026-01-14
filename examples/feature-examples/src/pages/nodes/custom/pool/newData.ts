// const data = {
//   nodes: [
//     {
//       id: 'pool-1',
//       type: 'pool',
//       x: 375,
//       y: 200,
//       properties: {
//         width: 300,
//         height: 300,
//         direction: 'vertical',
//       },
//     },
//     {
//       id: 'pool-2',
//       type: 'pool',
//       x: 800,
//       y: 200,
//       text: '水平泳池',
//       properties: {
//         width: 300,
//         height: 300,
//         direction: 'horizontal',
//         laneConfig: {
//           text: '水平泳道',
//         },
//       },
//       // text: {
//       //   x: 515,
//       //   y: 200,
//       //   value: '泳池示例',
//       // },
//     },
//     // {
//     //   id: '1-2',
//     //   type: 'rect',
//     //   x: 600,
//     //   y: 200,
//     //   properties: {
//     //     width: 300,
//     //     height: 300,
//     //   },
//     //   text: '其他元素',
//     // },
//   ],
//   edges: [],
// }

const data = {
  nodes: [
    {
      id: '9dfc6807-73f8-4741-8c69-e2d70f2ec934',
      type: 'pool',
      x: 511,
      y: 224.5,
      properties: {
        width: 400,
        height: 400,
        direction: 'horizontal',
        laneConfig: {
          text: '水平泳道',
        },
        isCollapsed: false,
        children: [
          'e5660bb9-12c7-4a2c-8be3-085eae9057be',
          '19c15ef0-8b61-4a8c-8544-3b9f975ace39',
        ],
      },
      text: {
        x: 341,
        y: 224.5,
        value: '横向泳池',
      },
      children: [
        'e5660bb9-12c7-4a2c-8be3-085eae9057be',
        '19c15ef0-8b61-4a8c-8544-3b9f975ace39',
      ],
    },
    {
      id: 'e5660bb9-12c7-4a2c-8be3-085eae9057be',
      type: 'lane',
      x: 541,
      y: 324.5,
      properties: {
        parent: '9dfc6807-73f8-4741-8c69-e2d70f2ec934',
        isHorizontal: true,
        isCollapsed: false,
        processRef: '',
        panels: ['processRef'],
        direction: 'vertical',
        width: 340,
        height: 200,
        children: [
          'e6cb89d0-01f9-4e76-82f7-09c25d5e1e07',
          '46e2c71b-31f6-4202-ab48-28eca90820bd',
        ],
      },
      text: {
        x: 381,
        y: 324.5,
        value: '水平泳道',
      },
      children: [
        'e6cb89d0-01f9-4e76-82f7-09c25d5e1e07',
        '46e2c71b-31f6-4202-ab48-28eca90820bd',
      ],
    },
    {
      id: '19c15ef0-8b61-4a8c-8544-3b9f975ace39',
      type: 'lane',
      x: 541,
      y: 124.5,
      properties: {
        isHorizontal: true,
        isCollapsed: false,
        processRef: '',
        panels: ['processRef'],
        direction: 'vertical',
        width: 340,
        height: 200,
        parent: '9dfc6807-73f8-4741-8c69-e2d70f2ec934',
        position: 'above',
        referenceLaneId: 'e5660bb9-12c7-4a2c-8be3-085eae9057be',
        children: [
          '9dbed2ef-581a-45e1-ad2e-c3b155bb8cf3',
          '324d535b-81d5-484f-aef7-1250e134fa76',
        ],
      },
      text: {
        x: 381,
        y: 124.5,
        value: '水平泳道',
      },
      children: [
        '9dbed2ef-581a-45e1-ad2e-c3b155bb8cf3',
        '324d535b-81d5-484f-aef7-1250e134fa76',
      ],
    },
    {
      id: 'e6cb89d0-01f9-4e76-82f7-09c25d5e1e07',
      type: 'rect',
      x: 458,
      y: 360.5,
      properties: {
        parent: 'e5660bb9-12c7-4a2c-8be3-085eae9057be',
        width: 100,
        height: 80,
      },
      text: {
        x: 458,
        y: 360.5,
        value: 'rect',
      },
    },
    {
      id: '46e2c71b-31f6-4202-ab48-28eca90820bd',
      type: 'rect',
      x: 612,
      y: 295.5,
      properties: {
        parent: 'e5660bb9-12c7-4a2c-8be3-085eae9057be',
        width: 100,
        height: 80,
      },
      text: {
        x: 612,
        y: 295.5,
        value: 'rect',
      },
    },
    {
      id: '9dbed2ef-581a-45e1-ad2e-c3b155bb8cf3',
      type: 'circle',
      x: 481,
      y: 149.5,
      properties: {
        parent: '19c15ef0-8b61-4a8c-8544-3b9f975ace39',
        width: 100,
        height: 100,
      },
      text: {
        x: 481,
        y: 149.5,
        value: 'circle',
      },
    },
    {
      id: '324d535b-81d5-484f-aef7-1250e134fa76',
      type: 'diamond',
      x: 624,
      y: 115.5,
      properties: {
        parent: '19c15ef0-8b61-4a8c-8544-3b9f975ace39',
        width: 60,
        height: 100,
      },
      text: {
        x: 624,
        y: 115.5,
        value: 'diamond',
      },
    },
  ],
  edges: [
    {
      id: '12e14434-6916-4198-a397-8470f4f6a15c',
      type: 'polyline',
      properties: {},
      sourceNodeId: 'e6cb89d0-01f9-4e76-82f7-09c25d5e1e07',
      targetNodeId: '46e2c71b-31f6-4202-ab48-28eca90820bd',
      sourceAnchorId: 'e6cb89d0-01f9-4e76-82f7-09c25d5e1e07_1',
      targetAnchorId: '46e2c71b-31f6-4202-ab48-28eca90820bd_3',
      startPoint: {
        x: 508,
        y: 360.5,
      },
      endPoint: {
        x: 562,
        y: 295.5,
      },
      pointsList: [
        {
          x: 508,
          y: 360.5,
        },
        {
          x: 538,
          y: 360.5,
        },
        {
          x: 538,
          y: 328,
        },
        {
          x: 532,
          y: 328,
        },
        {
          x: 532,
          y: 295.5,
        },
        {
          x: 562,
          y: 295.5,
        },
      ],
    },
    {
      id: '831c9bce-68be-45b5-9a24-012d226a0d45',
      type: 'polyline',
      properties: {},
      sourceNodeId: '9dbed2ef-581a-45e1-ad2e-c3b155bb8cf3',
      targetNodeId: '324d535b-81d5-484f-aef7-1250e134fa76',
      sourceAnchorId: '9dbed2ef-581a-45e1-ad2e-c3b155bb8cf3_1',
      targetAnchorId: '324d535b-81d5-484f-aef7-1250e134fa76_3',
      startPoint: {
        x: 531,
        y: 149.5,
      },
      endPoint: {
        x: 594,
        y: 115.5,
      },
      pointsList: [
        {
          x: 531,
          y: 149.5,
        },
        {
          x: 562.5,
          y: 149.5,
        },
        {
          x: 562.5,
          y: 115.5,
        },
        {
          x: 594,
          y: 115.5,
        },
      ],
    },
  ],
}

export default data
