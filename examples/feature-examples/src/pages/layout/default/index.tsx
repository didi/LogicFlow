import LogicFlow from '@logicflow/core'
import { DndPanel } from '@logicflow/extension'
import { Dagre } from '@logicflow/layout'
import { Card, Flex, Form, Divider, Button, Select, message } from 'antd'
import { useEffect, useRef, useState } from 'react'
import registerNode from './registerNodeConfig'
import styles from './index.less'

import '@logicflow/core/es/index.css'
import '@logicflow/extension/es/index.css'

// 布局方向选项
const rankdirOptions = [
  { value: 'LR', label: '从左到右(LR)' },
  { value: 'TB', label: '从上到下(TB)' },
  { value: 'BT', label: '从下到上(BT)' },
  { value: 'RL', label: '从右到左(RL)' },
]

// 节点对齐选项
const alignOptions = [
  { value: '', label: '居中对齐' },
  { value: 'UL', label: '上左对齐(UL)' },
  { value: 'UR', label: '上右对齐(UR)' },
  { value: 'DL', label: '下左对齐(DL)' },
  { value: 'DR', label: '下右对齐(DR)' },
]

const config: Partial<LogicFlow.Options> = {
  isSilentMode: false,
  stopScrollGraph: false,
  stopZoomGraph: false,
  stopMoveGraph: true,
  textEdit: false,
  nodeTextEdit: false,
  edgeTextEdit: false,
  keyboard: {
    enabled: true,
  },
}

const data = {
  nodes: [
    {
      id: 'b69942a1-dcd9-44bc-8708-f92745c4bd8a',
      type: 'start',
      x: 260,
      y: 230,
      properties: {
        nodeName: '开始',
        width: 190,
        height: 44,
      },
    },
    {
      id: 'b1bb3a79-0d8e-4d0b-a351-c742d70aab0f',
      type: 'judge',
      x: 512,
      y: 238,
      properties: {
        nodeName: '条件',
        branches: [
          {
            branchName: '分支1条件分支1条件分支1条件',
            conditions: [],
          },
          {
            branchName: '分支2条件',
            conditions: [],
          },
          {
            branchName: '分支3条件',
            conditions: [],
          },
          {
            branchName: '分支4条件',
            conditions: [],
          },
          {
            branchName: '分支5条件',
            conditions: [],
          },
        ],
        width: 190,
        height: 214,
      },
    },
    {
      id: '7e28dd91-b136-4d25-8b16-8f85166fd774',
      type: 'task',
      x: 787,
      y: 108,
      properties: {
        nodeName: '任务',
        nodeContent: '任务详情：请求接口，拿到资源后进行处理',
        width: 190,
        height: 100,
      },
    },
    {
      id: 'ef41e7c5-5c0a-41f6-99f9-a12d5b323d0d',
      type: 'end',
      x: 1038,
      y: 218,
      properties: {
        nodeName: '结束',
        width: 190,
        height: 44,
      },
    },
    {
      id: '48615781-3286-4dc7-a588-909cd8ef8e74',
      type: 'task',
      x: 784,
      y: 236,
      properties: {
        nodeName: '任务',
        nodeContent: '任务详情：请求接口，拿到资源后进行处理',
        width: 190,
        height: 100,
      },
    },
    {
      id: 'd4e8c6fa-e359-4d6d-8364-c601cb80ac77',
      type: 'task',
      x: 801,
      y: 334,
      properties: {
        nodeName: '任务',
        nodeContent: '任务详情：请求接口，拿到资源后进行处理',
        width: 190,
        height: 100,
      },
    },
    {
      id: '592f24fb-528c-49e8-8203-825502dd0505',
      type: 'task',
      x: 802,
      y: 457,
      properties: {
        nodeName: '任务',
        nodeContent: '任务详情：请求接口，拿到资源后进行处理',
        width: 190,
        height: 100,
      },
    },
    {
      id: 'e35c5fc9-5ff6-4879-a973-ebf1e60e7258',
      type: 'task',
      x: 821,
      y: 559,
      properties: {
        nodeName: '任务',
        nodeContent: '任务详情：请求接口，拿到资源后进行处理',
        width: 190,
        height: 100,
      },
    },
    {
      id: 'e3d9081f-4313-400f-a892-eb2e638b8c6a',
      type: 'judge',
      x: 1075,
      y: 324.30078125,
      properties: {
        nodeName: '条件',
        branches: [
          {
            branchName: '分支1条件',
            conditions: [],
          },
          {
            branchName: '分支2条件',
            conditions: [],
          },
        ],
        width: 190,
        height: 124,
      },
    },
    {
      id: '8332608a-cc27-4b3f-b94f-1790a4f02b7c',
      type: 'task',
      x: 1313,
      y: 301.30078125,
      properties: {
        nodeName: '任务',
        nodeContent: '任务详情：请求接口，拿到资源后进行处理',
        width: 190,
        height: 100,
      },
    },
    {
      id: 'ed78deed-bc25-4ec1-9098-d6c07f386a1a',
      type: 'task',
      x: 1326,
      y: 412.30078125,
      properties: {
        nodeName: '任务',
        nodeContent: '任务详情：请求接口，拿到资源后进行处理',
        width: 190,
        height: 100,
      },
    },
    {
      id: 'd1a5c08f-b50f-42d8-894c-de46ad69e94d',
      type: 'end',
      x: 1584,
      y: 336.30078125,
      properties: {
        nodeName: '结束',
        width: 190,
        height: 44,
      },
    },
  ],
  edges: [
    {
      id: '05021060-cd1d-4953-8267-1bc04ccbc306',
      type: 'polyline',
      properties: {},
      sourceNodeId: 'b69942a1-dcd9-44bc-8708-f92745c4bd8a',
      targetNodeId: 'b1bb3a79-0d8e-4d0b-a351-c742d70aab0f',
      sourceAnchorId: 'b69942a1-dcd9-44bc-8708-f92745c4bd8a_1_right',
      targetAnchorId: 'b1bb3a79-0d8e-4d0b-a351-c742d70aab0f_1_left',
      startPoint: {
        x: 355,
        y: 230,
      },
      endPoint: {
        x: 417,
        y: 238,
      },
      pointsList: [
        {
          x: 355,
          y: 230,
        },
        {
          x: 386,
          y: 230,
        },
        {
          x: 386,
          y: 238,
        },
        {
          x: 417,
          y: 238,
        },
      ],
    },
    {
      id: '73976957-7fe0-4540-9d6d-1a2a2cbb88bf',
      type: 'polyline',
      properties: {},
      sourceNodeId: 'b1bb3a79-0d8e-4d0b-a351-c742d70aab0f',
      targetNodeId: '7e28dd91-b136-4d25-8b16-8f85166fd774',
      sourceAnchorId: 'b1bb3a79-0d8e-4d0b-a351-c742d70aab0f_1_right',
      targetAnchorId: '7e28dd91-b136-4d25-8b16-8f85166fd774_1_left',
      startPoint: {
        x: 607,
        y: 238,
      },
      endPoint: {
        x: 692,
        y: 108,
      },
      pointsList: [
        {
          x: 607,
          y: 238,
        },
        {
          x: 662,
          y: 238,
        },
        {
          x: 662,
          y: 108,
        },
        {
          x: 692,
          y: 108,
        },
      ],
    },
    {
      id: '76f29917-2050-4b13-8054-492748f8ce10',
      type: 'polyline',
      properties: {},
      sourceNodeId: '7e28dd91-b136-4d25-8b16-8f85166fd774',
      targetNodeId: 'ef41e7c5-5c0a-41f6-99f9-a12d5b323d0d',
      sourceAnchorId: '7e28dd91-b136-4d25-8b16-8f85166fd774_1_right',
      targetAnchorId: 'ef41e7c5-5c0a-41f6-99f9-a12d5b323d0d_1_left',
      startPoint: {
        x: 882,
        y: 108,
      },
      endPoint: {
        x: 943,
        y: 218,
      },
      pointsList: [
        {
          x: 882,
          y: 108,
        },
        {
          x: 913,
          y: 108,
        },
        {
          x: 913,
          y: 218,
        },
        {
          x: 943,
          y: 218,
        },
      ],
    },
    {
      id: 'fead7b8e-2625-475e-bfd6-1803bf085750',
      type: 'polyline',
      properties: {},
      sourceNodeId: 'b1bb3a79-0d8e-4d0b-a351-c742d70aab0f',
      targetNodeId: '48615781-3286-4dc7-a588-909cd8ef8e74',
      sourceAnchorId: 'b1bb3a79-0d8e-4d0b-a351-c742d70aab0f_1_right',
      targetAnchorId: '48615781-3286-4dc7-a588-909cd8ef8e74_1_left',
      startPoint: {
        x: 607,
        y: 238,
      },
      endPoint: {
        x: 689,
        y: 236,
      },
      pointsList: [
        {
          x: 607,
          y: 238,
        },
        {
          x: 648,
          y: 238,
        },
        {
          x: 648,
          y: 236,
        },
        {
          x: 689,
          y: 236,
        },
      ],
    },
    {
      id: '88ff339a-f8b9-4619-8e97-ad85beed2edf',
      type: 'polyline',
      properties: {},
      sourceNodeId: 'b1bb3a79-0d8e-4d0b-a351-c742d70aab0f',
      targetNodeId: 'd4e8c6fa-e359-4d6d-8364-c601cb80ac77',
      sourceAnchorId: 'b1bb3a79-0d8e-4d0b-a351-c742d70aab0f_1_right',
      targetAnchorId: 'd4e8c6fa-e359-4d6d-8364-c601cb80ac77_1_left',
      startPoint: {
        x: 607,
        y: 238,
      },
      endPoint: {
        x: 706,
        y: 334,
      },
      pointsList: [
        {
          x: 607,
          y: 238,
        },
        {
          x: 676,
          y: 238,
        },
        {
          x: 676,
          y: 334,
        },
        {
          x: 706,
          y: 334,
        },
      ],
    },
    {
      id: 'f6a80466-8449-4d69-ad81-76062f86302d',
      type: 'polyline',
      properties: {},
      sourceNodeId: 'b1bb3a79-0d8e-4d0b-a351-c742d70aab0f',
      targetNodeId: '592f24fb-528c-49e8-8203-825502dd0505',
      sourceAnchorId: 'b1bb3a79-0d8e-4d0b-a351-c742d70aab0f_1_right',
      targetAnchorId: '592f24fb-528c-49e8-8203-825502dd0505_1_left',
      startPoint: {
        x: 607,
        y: 238,
      },
      endPoint: {
        x: 707,
        y: 457,
      },
      pointsList: [
        {
          x: 607,
          y: 238,
        },
        {
          x: 677,
          y: 238,
        },
        {
          x: 677,
          y: 457,
        },
        {
          x: 707,
          y: 457,
        },
      ],
    },
    {
      id: '45d3e6f3-94b3-4a87-8d8b-60ae20e35ee9',
      type: 'polyline',
      properties: {},
      sourceNodeId: 'b1bb3a79-0d8e-4d0b-a351-c742d70aab0f',
      targetNodeId: 'e35c5fc9-5ff6-4879-a973-ebf1e60e7258',
      sourceAnchorId: 'b1bb3a79-0d8e-4d0b-a351-c742d70aab0f_1_right',
      targetAnchorId: 'e35c5fc9-5ff6-4879-a973-ebf1e60e7258_1_left',
      startPoint: {
        x: 607,
        y: 238,
      },
      endPoint: {
        x: 726,
        y: 559,
      },
      pointsList: [
        {
          x: 607,
          y: 238,
        },
        {
          x: 696,
          y: 238,
        },
        {
          x: 696,
          y: 559,
        },
        {
          x: 726,
          y: 559,
        },
      ],
    },
    {
      id: 'f5e4d17e-f805-4823-9863-fb99cf90938d',
      type: 'polyline',
      properties: {},
      sourceNodeId: '48615781-3286-4dc7-a588-909cd8ef8e74',
      targetNodeId: 'ef41e7c5-5c0a-41f6-99f9-a12d5b323d0d',
      sourceAnchorId: '48615781-3286-4dc7-a588-909cd8ef8e74_1_right',
      targetAnchorId: 'ef41e7c5-5c0a-41f6-99f9-a12d5b323d0d_1_left',
      startPoint: {
        x: 879,
        y: 236,
      },
      endPoint: {
        x: 943,
        y: 218,
      },
      pointsList: [
        {
          x: 879,
          y: 236,
        },
        {
          x: 911,
          y: 236,
        },
        {
          x: 911,
          y: 218,
        },
        {
          x: 943,
          y: 218,
        },
      ],
    },
    {
      id: 'da75efe7-2950-42e8-9b72-bb5e8193f8ab',
      type: 'polyline',
      properties: {},
      sourceNodeId: '592f24fb-528c-49e8-8203-825502dd0505',
      targetNodeId: 'ef41e7c5-5c0a-41f6-99f9-a12d5b323d0d',
      sourceAnchorId: '592f24fb-528c-49e8-8203-825502dd0505_1_right',
      targetAnchorId: 'ef41e7c5-5c0a-41f6-99f9-a12d5b323d0d_1_left',
      startPoint: {
        x: 897,
        y: 457,
      },
      endPoint: {
        x: 943,
        y: 218,
      },
      pointsList: [
        {
          x: 897,
          y: 457,
        },
        {
          x: 913,
          y: 457,
        },
        {
          x: 913,
          y: 218,
        },
        {
          x: 943,
          y: 218,
        },
      ],
    },
    {
      id: 'a75db105-697a-457b-8d0a-4c9b2df2ef4e',
      type: 'polyline',
      properties: {},
      sourceNodeId: 'e35c5fc9-5ff6-4879-a973-ebf1e60e7258',
      targetNodeId: 'ef41e7c5-5c0a-41f6-99f9-a12d5b323d0d',
      sourceAnchorId: 'e35c5fc9-5ff6-4879-a973-ebf1e60e7258_1_right',
      targetAnchorId: 'ef41e7c5-5c0a-41f6-99f9-a12d5b323d0d_1_left',
      startPoint: {
        x: 916,
        y: 559,
      },
      endPoint: {
        x: 943,
        y: 218,
      },
      pointsList: [
        {
          x: 916,
          y: 559,
        },
        {
          x: 946,
          y: 559,
        },
        {
          x: 946,
          y: 388.5,
        },
        {
          x: 913,
          y: 388.5,
        },
        {
          x: 913,
          y: 218,
        },
        {
          x: 943,
          y: 218,
        },
      ],
    },
    {
      id: 'a7f2f6b9-ea5d-4f1e-ac70-f9a38aaec797',
      type: 'polyline',
      properties: {},
      sourceNodeId: '8332608a-cc27-4b3f-b94f-1790a4f02b7c',
      targetNodeId: 'd1a5c08f-b50f-42d8-894c-de46ad69e94d',
      sourceAnchorId: '8332608a-cc27-4b3f-b94f-1790a4f02b7c_1_right',
      targetAnchorId: 'd1a5c08f-b50f-42d8-894c-de46ad69e94d_1_left',
      startPoint: {
        x: 1408,
        y: 301.30078125,
      },
      endPoint: {
        x: 1489,
        y: 336.30078125,
      },
      pointsList: [
        {
          x: 1408,
          y: 301.30078125,
        },
        {
          x: 1448.5,
          y: 301.30078125,
        },
        {
          x: 1448.5,
          y: 336.30078125,
        },
        {
          x: 1489,
          y: 336.30078125,
        },
      ],
    },
    {
      id: '6dd341ef-af0f-45fb-9e45-10eace3cc4d6',
      type: 'polyline',
      properties: {},
      sourceNodeId: 'ed78deed-bc25-4ec1-9098-d6c07f386a1a',
      targetNodeId: 'd1a5c08f-b50f-42d8-894c-de46ad69e94d',
      sourceAnchorId: 'ed78deed-bc25-4ec1-9098-d6c07f386a1a_1_right',
      targetAnchorId: 'd1a5c08f-b50f-42d8-894c-de46ad69e94d_1_left',
      startPoint: {
        x: 1421,
        y: 412.30078125,
      },
      endPoint: {
        x: 1489,
        y: 336.30078125,
      },
      pointsList: [
        {
          x: 1421,
          y: 412.30078125,
        },
        {
          x: 1459,
          y: 412.30078125,
        },
        {
          x: 1459,
          y: 336.30078125,
        },
        {
          x: 1489,
          y: 336.30078125,
        },
      ],
    },
    {
      id: '3594ec5c-2284-4da9-adb0-3153f87b0369',
      type: 'polyline',
      properties: {},
      sourceNodeId: 'e3d9081f-4313-400f-a892-eb2e638b8c6a',
      targetNodeId: '8332608a-cc27-4b3f-b94f-1790a4f02b7c',
      sourceAnchorId: 'e3d9081f-4313-400f-a892-eb2e638b8c6a_1_right',
      targetAnchorId: '8332608a-cc27-4b3f-b94f-1790a4f02b7c_1_left',
      startPoint: {
        x: 1170,
        y: 324.30078125,
      },
      endPoint: {
        x: 1218,
        y: 301.30078125,
      },
      pointsList: [
        {
          x: 1170,
          y: 324.30078125,
        },
        {
          x: 1200,
          y: 324.30078125,
        },
        {
          x: 1200,
          y: 312.80078125,
        },
        {
          x: 1188,
          y: 312.80078125,
        },
        {
          x: 1188,
          y: 301.30078125,
        },
        {
          x: 1218,
          y: 301.30078125,
        },
      ],
    },
    {
      id: 'e85e78f9-15d3-4b62-915f-3316020b3e4c',
      type: 'polyline',
      properties: {},
      sourceNodeId: 'e3d9081f-4313-400f-a892-eb2e638b8c6a',
      targetNodeId: 'ed78deed-bc25-4ec1-9098-d6c07f386a1a',
      sourceAnchorId: 'e3d9081f-4313-400f-a892-eb2e638b8c6a_1_right',
      targetAnchorId: 'ed78deed-bc25-4ec1-9098-d6c07f386a1a_1_left',
      startPoint: {
        x: 1170,
        y: 324.30078125,
      },
      endPoint: {
        x: 1231,
        y: 412.30078125,
      },
      pointsList: [
        {
          x: 1170,
          y: 324.30078125,
        },
        {
          x: 1201,
          y: 324.30078125,
        },
        {
          x: 1201,
          y: 412.30078125,
        },
        {
          x: 1231,
          y: 412.30078125,
        },
      ],
    },
    {
      id: 'b16d5ed8-7373-462b-b19f-3443c9eb3588',
      type: 'polyline',
      properties: {},
      sourceNodeId: 'd4e8c6fa-e359-4d6d-8364-c601cb80ac77',
      targetNodeId: 'e3d9081f-4313-400f-a892-eb2e638b8c6a',
      sourceAnchorId: 'd4e8c6fa-e359-4d6d-8364-c601cb80ac77_1_right',
      targetAnchorId: 'e3d9081f-4313-400f-a892-eb2e638b8c6a_1_left',
      startPoint: {
        x: 896,
        y: 334,
      },
      endPoint: {
        x: 980,
        y: 324.30078125,
      },
      pointsList: [
        {
          x: 896,
          y: 334,
        },
        {
          x: 938,
          y: 334,
        },
        {
          x: 938,
          y: 324.30078125,
        },
        {
          x: 980,
          y: 324.30078125,
        },
      ],
    },
    {
      id: '5fb5aed7-0567-4147-9804-d80046974346',
      type: 'polyline',
      properties: {},
      sourceNodeId: 'e3d9081f-4313-400f-a892-eb2e638b8c6a',
      targetNodeId: 'b1bb3a79-0d8e-4d0b-a351-c742d70aab0f',
      sourceAnchorId: 'e3d9081f-4313-400f-a892-eb2e638b8c6a_0',
      targetAnchorId: 'b1bb3a79-0d8e-4d0b-a351-c742d70aab0f_0',
      startPoint: {
        x: 1075,
        y: 262.30078125,
      },
      endPoint: {
        x: 512,
        y: 131,
      },
      pointsList: [
        {
          x: 1075,
          y: 262.30078125,
        },
        {
          x: 1075,
          y: 29,
        },
        {
          x: 512,
          y: 29,
        },
        {
          x: 512,
          y: 131,
        },
      ],
    },
  ],
}

export default function SelectionSelectExample() {
  const lfRef = useRef<LogicFlow>()
  const containerRef = useRef<HTMLDivElement>(null)
  // 布局配置状态
  const [layoutConfig, setLayoutConfig] = useState({
    rankdir: 'LR',
    align: '',
  })

  // 初始化 LogicFlow
  useEffect(() => {
    if (!lfRef.current) {
      const lf = new LogicFlow({
        ...config,
        container: containerRef.current!,
        grid: {
          size: 20,
        },
        plugins: [DndPanel, Dagre],
      })
      lf.setTheme({
        polyline: {
          stroke: '#2961ef',
          strokeWidth: 1,
        },
      })
      registerNode(lf)
      lf.setPatternItems([
        {
          type: 'start',
          label: '开始节点',
          icon: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/core/start.png',
          properties: {
            nodeName: '开始',
          },
        },
        {
          type: 'judge',
          label: '条件节点',
          icon: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/core/diamond.png',
          properties: {
            nodeName: '条件',
            branches: [
              {
                branchName: '分支1条件',
                conditions: [],
              },
              {
                branchName: '分支2条件',
                conditions: [],
              },
            ],
          },
        },
        {
          type: 'task',
          label: '任务节点',
          icon: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/core/rect.png',
          properties: {
            nodeName: '任务',
            nodeContent: '任务详情：请求接口，拿到资源后进行处理',
          },
        },
        {
          type: 'end',
          label: '结束节点',
          icon: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/core/end.png',
          properties: {
            nodeName: '结束',
          },
        },
      ])
      // 边的连接不允许
      lf.on('connection:not-allowed', (data) => {
        const { msg } = data
        message.error(msg)
      })
      // 复制ID
      lf.on('CopyId', (data) => {
        const ele = document.createElement('textarea')
        document.body.appendChild(ele)
        ele.value = `${data.id}`
        ele.select()
        document.execCommand('copy')
        document.body.removeChild(ele)
        message.success('ID复制成功！')
      })
      // 复制节点
      lf.on('CopyNode', async (data) => {
        lf.cloneNode(data.id)
      })
      // 删除节点
      lf.on('DeleteNode', (data) => {
        lf.deleteNode(data.id)
      })
      lf.render(data)
      lf.translateCenter()
      lfRef.current = lf
    }
  }, [])

  // 执行布局
  const applyLayout = () => {
    if (lfRef.current?.extension.dagre) {
      ;(lfRef.current.extension.dagre as Dagre)?.layout({
        ranksep: 100,
        nodesep: 50,
        rankdir: layoutConfig.rankdir as any,
        align: layoutConfig.align || undefined,
        isDefaultAnchor: true,
      })
      lfRef.current.fitView()
    }
  }

  const getData = () => {
    console.log('当前data数据', lfRef.current?.getGraphRawData())
  }

  // 处理配置项变更
  const handleConfigChange = (key: string, value: any) => {
    setLayoutConfig((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  return (
    <Card title="LogicFlow - 自动布局">
      <Flex wrap="wrap" gap="middle" align="center" justify="space-between">
        <Form layout="inline">
          <Form.Item label="布局方向">
            <Select
              style={{ width: 160 }}
              options={rankdirOptions}
              value={layoutConfig.rankdir}
              onChange={(value) => handleConfigChange('rankdir', value)}
            />
          </Form.Item>

          <Form.Item label="对齐方式">
            <Select
              style={{ width: 160 }}
              options={alignOptions}
              value={layoutConfig.align}
              onChange={(value) => handleConfigChange('align', value)}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={applyLayout}>
              应用布局
            </Button>
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={getData}>
              获取数据
            </Button>
          </Form.Item>
        </Form>
      </Flex>
      <Divider />
      <div ref={containerRef} id="graph" className={styles.viewport}></div>
    </Card>
  )
}
