
export const approveUser = [
  {
    label: '直接上级',
    value: 'leader'
  },
  {
    label: 'T3领导',
    value: 't3Leader'
  },
  {
    label: 'T2领导',
    value: 't2Leader'
  },
  {
    label: 'T1领导',
    value: 't1Leader'
  },
]

// 主题
export const themeApprove = {
  rect: { // 矩形样式
    radius: 8,
  },
  circle: {
    r: 25,
  },
  // polyline: {
  //   strokeWidth: 1,
  // },
  edgeText: {
    background: {
      fill: 'white',
    },
  },
}
export const nodeType = {
  apply: '申请',
  approver: '审核',
  jugement: '判断',
  finsh: '结束'
}

export const data = {
  "nodes": [
    {
      "id": "28df2fbe-f32b-4a9b-b544-7e70d7187b33",
      "type": "apply",
      "x": 210,
      "y": 210,
      "text": { "x": 210, "y": 210, "value": "张三" },
      "properties": {
        "usernameZh": '张三',
        "username": 'zhangsan',
        "time": '2020-12-01 10:23:34',
        "result": '',
        "desc": '活动费用',
        "status": 1,
      }
    },
    {
      "id": "64179bd7-c60e-433c-8df7-97c8e98f855d",
      "type": "approver",
      "x": 350,
      "y": 210,
      "text": { "x": 350, "y": 210, "value": "李四" },
      "properties": {
        "labelColor": "#000000",
        "approveTypeLabel": "直接上级",
        "approveType": "leader",
        "usernameZh": '李四',
        "username": 'zhangsan',
        "time": '2020-12-01 11:23:34',
        "result": '通过',
        "desc": '',
        "status": 1,
      }
    },
    {
      "id": "fcb96f10-720e-40e5-8ed0-ebdd0a46f234",
      "type": "jugement",
      "x": 510,
      "y": 210,
      "text": { "x": 510, "y": 210, "value": "判断报销是否\n大于1000元" },
      "properties": {
        "api": "",
        "status": 1,
        "usenameZh": "系统",
        "desc": '判断报销是否大于1000元'
      },
    },
    {
      "id": "9f119df3-c449-4e5d-a67a-cb351b9cbdb5",
      "type": "approver",
      "x": 670,
      "y": 210,
      "text": { "x": 670, "y": 210, "value": "王五" },
      "properties": {
        "labelColor": "#000000",
        "approveTypeLabel": "T2领导",
        "approveType": "t2Leader",
        "usernameZh": '王五',
        "username": 'wangwu',
        "time": '2020-12-01 12:23:34',
        "result": '驳回',
        "desc": '',
        "status": 2,
      }
    },
    {
      "id": "ef34f09c-38ea-4ad4-acd2-cc2f464a2be6",
      "type": "finsh",
      "x": 850,
      "y": 210,
      "text": { "x": 850, "y": 210, "value": "结束" },
      "properties": {
        "status": 2,
      },
    }
  ],
  "edges": [
    {
      "id": "0d87b1eb-2389-445a-9f34-6227940b2072",
      "type": "action",
      "sourceNodeId": "28df2fbe-f32b-4a9b-b544-7e70d7187b33",
      "targetNodeId": "64179bd7-c60e-433c-8df7-97c8e98f855d",
      "startPoint": { "x": 235, "y": 210 },
      "endPoint": { "x": 300, "y": 210 },
      "text": { "x": 51.25, "y": 0, "value": "" },
      "properties": {
        "status": 1,
      },
      "pointsList": [
        { "x": 235, "y": 210 },
        { "x": 300, "y": 210 }
      ]
    },
    {
      "id": "d99e7451-b379-411e-b0da-df11be8be20a",
      "type": "action",
      "sourceNodeId": "64179bd7-c60e-433c-8df7-97c8e98f855d",
      "targetNodeId": "fcb96f10-720e-40e5-8ed0-ebdd0a46f234",
      "startPoint": { "x": 400, "y": 210 },
      "endPoint": { "x": 475, "y": 210 },
      "text": { "x": 437.5, "y": 210, "value": "通过" },
      "properties": {
        "status": 1,
      },
      "pointsList": [
        { "x": 400, "y": 210 },
        { "x": 475, "y": 210 }
      ]
    },
    {
      "id": "4c615802-15d8-442c-be22-b65430286123",
      "type": "action",
      "sourceNodeId": "fcb96f10-720e-40e5-8ed0-ebdd0a46f234",
      "targetNodeId": "9f119df3-c449-4e5d-a67a-cb351b9cbdb5",
      "startPoint": { "x": 545, "y": 210 },
      "endPoint": { "x": 620, "y": 210 },
      "text": { "x": 582.5, "y": 210, "value": "是" },
      "properties": {
        "status": 1,
      },
      "pointsList": [
        { "x": 545, "y": 210 },
        { "x": 620, "y": 210 }
      ]
    },
    {
      "id": "934ae03a-6ee0-4568-a2b4-8bcede565e0b",
      "type": "action",
      "sourceNodeId": "9f119df3-c449-4e5d-a67a-cb351b9cbdb5",
      "targetNodeId": "ef34f09c-38ea-4ad4-acd2-cc2f464a2be6",
      "startPoint": { "x": 720, "y": 210 },
      "endPoint": { "x": 825, "y": 210 },
      "text": { "x": -10, "y": 0, "value": "驳回" },
      "properties": {
        "status": 2,
      },
      "pointsList": [
        { "x": 720, "y": 210 },
        { "x": 825, "y": 210 }
      ]
    },
  ]
}

