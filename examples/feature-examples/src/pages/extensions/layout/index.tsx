import LogicFlow from '@logicflow/core'
import { DndPanel } from '@logicflow/extension'
import { Dagre } from '@logicflow/layout'
import { Card, Flex, Form, Divider, Button, Select } from 'antd'
import { useEffect, useRef, useState } from 'react'
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
  { value: '', label: '居中对齐(undefined)' },
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
  style: {
    rect: {
      rx: 5,
      ry: 5,
      strokeWidth: 2,
    },
    circle: {
      r: 10,
      fill: '#f5f5f5',
      stroke: '#666',
    },
    ellipse: {
      fill: '#dae8fc',
      stroke: '#6c8ebf',
    },
    polygon: {
      fill: '#d5e8d4',
      stroke: '#82b366',
    },
    diamond: {
      fill: '#ffe6cc',
      stroke: '#d79b00',
    },
    text: {
      color: '#b85450',
      fontSize: 12,
    },
  },
  allowRotate: true,
  allowResize: true,
  keyboard: {
    enabled: true,
  },
}

const data = {
  nodes: [
    {
      id: 'ef88573b-4b3c-495c-bdee-6d2a789bfa94',
      type: 'circle',
      x: 139,
      y: 188,
      properties: {
        width: 100,
        height: 100,
      },
      text: {
        x: 139,
        y: 188,
        value: '开始',
      },
    },
    {
      id: '3235c699-be14-4f1b-8aa0-aef0d73b8ba5',
      type: 'rect',
      x: 336,
      y: 191,
      properties: {
        width: 100,
        height: 80,
      },
      text: {
        x: 336,
        y: 191,
        value: '任务1',
      },
    },
    {
      id: 'dff488e5-20c7-41c2-85c8-d50c6e8bca9d',
      type: 'diamond',
      x: 510,
      y: 189,
      properties: {
        width: 60,
        height: 100,
      },
      text: {
        x: 510,
        y: 189,
        value: '判断1',
      },
    },
    {
      id: '8b4fb286-c992-4165-aa26-3b430f6ed618',
      type: 'rect',
      x: 684,
      y: 107,
      properties: {
        width: 100,
        height: 80,
      },
      text: {
        x: 684,
        y: 107,
        value: '任务5',
      },
    },
    {
      id: '9f678bef-d0d9-47f7-9ca5-54f3b9afbd48',
      type: 'rect',
      x: 687,
      y: 318,
      properties: {
        width: 100,
        height: 80,
      },
      text: {
        x: 687,
        y: 318,
        value: '任务6',
      },
    },
    {
      id: '047c2579-6d8c-47e5-b1ac-5015da8d7e71',
      type: 'diamond',
      x: 895,
      y: 315,
      properties: {
        width: 60,
        height: 100,
      },
      text: {
        x: 895,
        y: 315,
        value: '判断3',
      },
    },
    {
      id: '9424948a-a4b7-418e-8e5a-b3f84ea6498f',
      type: 'circle',
      x: 1291.916666666667,
      y: 168.66666666666674,
      properties: {
        width: 100,
        height: 100,
      },
      text: {
        x: 1291.916666666667,
        y: 168.66666666666674,
        value: '结束',
      },
    },
    {
      id: '12832ef9-0ff2-4525-9842-7ce8f0b83af8',
      type: 'rect',
      x: 1080,
      y: 316,
      properties: {
        width: 100,
        height: 80,
      },
      text: {
        x: 1080,
        y: 316,
        value: '任务7',
      },
    },
    {
      id: '8e8860b9-52b9-4a77-9276-70981dd1cbc4',
      type: 'circle',
      x: 1301,
      y: 315,
      properties: {
        width: 100,
        height: 100,
      },
      text: {
        x: 1301,
        y: 315,
        value: '结束',
      },
    },
    {
      id: '747dc7b5-3faf-4738-b309-4f09eb5a9b96',
      type: 'rect',
      x: 682,
      y: -118,
      properties: {
        width: 100,
        height: 80,
      },
      text: {
        x: 682,
        y: -118,
        value: '任务2',
      },
    },
    {
      id: '1060c5e3-dc76-40a0-9efa-489f9cbee34f',
      type: 'diamond',
      x: 883,
      y: -125,
      properties: {
        width: 60,
        height: 100,
      },
      text: {
        x: 883,
        y: -125,
        value: '判断2',
      },
    },
    {
      id: '864a15d8-1cbe-4d97-a548-2ced1c7d6d61',
      type: 'rect',
      x: 1051,
      y: -216,
      properties: {
        width: 100,
        height: 80,
      },
      text: {
        x: 1051,
        y: -216,
        value: '任务3',
      },
    },
    {
      id: '8191c958-7e4b-4377-8026-f78983595b85',
      type: 'rect',
      x: 1052,
      y: 9,
      properties: {
        width: 100,
        height: 80,
      },
      text: {
        x: 1052,
        y: 9,
        value: '任务4',
      },
    },
    {
      id: '070d2171-eb56-4ad8-a8bf-bf1aa0f6efbb',
      type: 'circle',
      x: 1262,
      y: -96,
      properties: {
        width: 100,
        height: 100,
      },
      text: {
        x: 1262,
        y: -96,
        value: '结束',
      },
    },
    {
      id: 'eaf4149e-8ef6-4357-865a-9ede67999dd4',
      type: 'diamond',
      x: 838.5000000000001,
      y: 113.21744791666679,
      properties: {
        width: 60,
        height: 100.00000000000001,
      },
      text: {
        x: 838.5000000000001,
        y: 113.21744791666679,
        value: '判断',
      },
    },
    {
      id: 'd14c2677-1195-4bd1-9d4a-8700c2d69577',
      type: 'rect',
      x: 1084.3333333333337,
      y: 169.46744791666683,
      properties: {
        width: 100,
        height: 80,
      },
      text: {
        x: 1084.3333333333337,
        y: 169.46744791666683,
        value: '任务',
      },
    },
  ],
  edges: [
    {
      id: '0cd08f79-29bc-4731-b170-2790b1fa2e3f',
      type: 'polyline',
      properties: {},
      sourceNodeId: 'ef88573b-4b3c-495c-bdee-6d2a789bfa94',
      targetNodeId: '3235c699-be14-4f1b-8aa0-aef0d73b8ba5',
      sourceAnchorId: 'ef88573b-4b3c-495c-bdee-6d2a789bfa94_1',
      targetAnchorId: '3235c699-be14-4f1b-8aa0-aef0d73b8ba5_3',
      startPoint: {
        x: 189,
        y: 188,
      },
      endPoint: {
        x: 286,
        y: 191,
      },
      pointsList: [
        {
          x: 189,
          y: 188,
        },
        {
          x: 237.5,
          y: 188,
        },
        {
          x: 237.5,
          y: 191,
        },
        {
          x: 286,
          y: 191,
        },
      ],
    },
    {
      id: 'e6145581-1d0c-4bbf-9fd4-fa73d7af20b7',
      type: 'polyline',
      properties: {},
      sourceNodeId: '3235c699-be14-4f1b-8aa0-aef0d73b8ba5',
      targetNodeId: 'dff488e5-20c7-41c2-85c8-d50c6e8bca9d',
      sourceAnchorId: '3235c699-be14-4f1b-8aa0-aef0d73b8ba5_1',
      targetAnchorId: 'dff488e5-20c7-41c2-85c8-d50c6e8bca9d_3',
      startPoint: {
        x: 386,
        y: 191,
      },
      endPoint: {
        x: 480,
        y: 189,
      },
      pointsList: [
        {
          x: 386,
          y: 191,
        },
        {
          x: 433,
          y: 191,
        },
        {
          x: 433,
          y: 189,
        },
        {
          x: 480,
          y: 189,
        },
      ],
    },
    {
      id: '61a32b64-1ed4-4623-a1fe-bea26389d206',
      type: 'polyline',
      properties: {},
      sourceNodeId: 'dff488e5-20c7-41c2-85c8-d50c6e8bca9d',
      targetNodeId: '8b4fb286-c992-4165-aa26-3b430f6ed618',
      sourceAnchorId: 'dff488e5-20c7-41c2-85c8-d50c6e8bca9d_1',
      targetAnchorId: '8b4fb286-c992-4165-aa26-3b430f6ed618_3',
      startPoint: {
        x: 540,
        y: 189,
      },
      endPoint: {
        x: 634,
        y: 107,
      },
      pointsList: [
        {
          x: 540,
          y: 189,
        },
        {
          x: 604,
          y: 189,
        },
        {
          x: 604,
          y: 107,
        },
        {
          x: 634,
          y: 107,
        },
      ],
    },
    {
      id: '25c7265e-1c82-4630-8c90-da4cb99a03d1',
      type: 'polyline',
      properties: {},
      sourceNodeId: 'dff488e5-20c7-41c2-85c8-d50c6e8bca9d',
      targetNodeId: '9f678bef-d0d9-47f7-9ca5-54f3b9afbd48',
      sourceAnchorId: 'dff488e5-20c7-41c2-85c8-d50c6e8bca9d_1',
      targetAnchorId: '9f678bef-d0d9-47f7-9ca5-54f3b9afbd48_3',
      startPoint: {
        x: 540,
        y: 189,
      },
      endPoint: {
        x: 637,
        y: 318,
      },
      pointsList: [
        {
          x: 540,
          y: 189,
        },
        {
          x: 607,
          y: 189,
        },
        {
          x: 607,
          y: 318,
        },
        {
          x: 637,
          y: 318,
        },
      ],
    },
    {
      id: '9898d447-763e-44dc-a13c-29f7804b307e',
      type: 'polyline',
      properties: {},
      sourceNodeId: '9f678bef-d0d9-47f7-9ca5-54f3b9afbd48',
      targetNodeId: '047c2579-6d8c-47e5-b1ac-5015da8d7e71',
      sourceAnchorId: '9f678bef-d0d9-47f7-9ca5-54f3b9afbd48_1',
      targetAnchorId: '047c2579-6d8c-47e5-b1ac-5015da8d7e71_3',
      startPoint: {
        x: 737,
        y: 318,
      },
      endPoint: {
        x: 865,
        y: 315,
      },
      pointsList: [
        {
          x: 737,
          y: 318,
        },
        {
          x: 801,
          y: 318,
        },
        {
          x: 801,
          y: 315,
        },
        {
          x: 865,
          y: 315,
        },
      ],
    },
    {
      id: '69633625-ffc3-4cd0-bfbf-7d5e674096ce',
      type: 'polyline',
      properties: {},
      sourceNodeId: '047c2579-6d8c-47e5-b1ac-5015da8d7e71',
      targetNodeId: '12832ef9-0ff2-4525-9842-7ce8f0b83af8',
      sourceAnchorId: '047c2579-6d8c-47e5-b1ac-5015da8d7e71_1',
      targetAnchorId: '12832ef9-0ff2-4525-9842-7ce8f0b83af8_3',
      startPoint: {
        x: 925,
        y: 315,
      },
      endPoint: {
        x: 1030,
        y: 316,
      },
      pointsList: [
        {
          x: 925,
          y: 315,
        },
        {
          x: 977.5,
          y: 315,
        },
        {
          x: 977.5,
          y: 316,
        },
        {
          x: 1030,
          y: 316,
        },
      ],
    },
    {
      id: '170f4bd3-4eda-4f6e-b9df-f706f87836b3',
      type: 'polyline',
      properties: {},
      sourceNodeId: '12832ef9-0ff2-4525-9842-7ce8f0b83af8',
      targetNodeId: '8e8860b9-52b9-4a77-9276-70981dd1cbc4',
      sourceAnchorId: '12832ef9-0ff2-4525-9842-7ce8f0b83af8_1',
      targetAnchorId: '8e8860b9-52b9-4a77-9276-70981dd1cbc4_3',
      startPoint: {
        x: 1130,
        y: 316,
      },
      endPoint: {
        x: 1251,
        y: 315,
      },
      pointsList: [
        {
          x: 1130,
          y: 316,
        },
        {
          x: 1190.5,
          y: 316,
        },
        {
          x: 1190.5,
          y: 315,
        },
        {
          x: 1251,
          y: 315,
        },
      ],
    },
    {
      id: 'c1bdd729-9692-4db6-bd05-2e4806e35c10',
      type: 'polyline',
      properties: {},
      sourceNodeId: 'dff488e5-20c7-41c2-85c8-d50c6e8bca9d',
      targetNodeId: '747dc7b5-3faf-4738-b309-4f09eb5a9b96',
      sourceAnchorId: 'dff488e5-20c7-41c2-85c8-d50c6e8bca9d_0',
      targetAnchorId: '747dc7b5-3faf-4738-b309-4f09eb5a9b96_3',
      startPoint: {
        x: 510,
        y: 139,
      },
      endPoint: {
        x: 632,
        y: -118,
      },
      pointsList: [
        {
          x: 510,
          y: 139,
        },
        {
          x: 510,
          y: -118,
        },
        {
          x: 632,
          y: -118,
        },
      ],
    },
    {
      id: 'dce7423d-8357-45d5-a310-b2bed06b8b8a',
      type: 'polyline',
      properties: {},
      sourceNodeId: '747dc7b5-3faf-4738-b309-4f09eb5a9b96',
      targetNodeId: '1060c5e3-dc76-40a0-9efa-489f9cbee34f',
      sourceAnchorId: '747dc7b5-3faf-4738-b309-4f09eb5a9b96_1',
      targetAnchorId: '1060c5e3-dc76-40a0-9efa-489f9cbee34f_3',
      startPoint: {
        x: 732,
        y: -118,
      },
      endPoint: {
        x: 853,
        y: -125,
      },
      pointsList: [
        {
          x: 732,
          y: -118,
        },
        {
          x: 792.5,
          y: -118,
        },
        {
          x: 792.5,
          y: -125,
        },
        {
          x: 853,
          y: -125,
        },
      ],
    },
    {
      id: '877a0a4b-eb4a-4e08-a231-94087fe6e977',
      type: 'polyline',
      properties: {},
      sourceNodeId: '1060c5e3-dc76-40a0-9efa-489f9cbee34f',
      targetNodeId: '864a15d8-1cbe-4d97-a548-2ced1c7d6d61',
      sourceAnchorId: '1060c5e3-dc76-40a0-9efa-489f9cbee34f_1',
      targetAnchorId: '864a15d8-1cbe-4d97-a548-2ced1c7d6d61_3',
      startPoint: {
        x: 913,
        y: -125,
      },
      endPoint: {
        x: 1001,
        y: -216,
      },
      pointsList: [
        {
          x: 913,
          y: -125,
        },
        {
          x: 971,
          y: -125,
        },
        {
          x: 971,
          y: -216,
        },
        {
          x: 1001,
          y: -216,
        },
      ],
    },
    {
      id: 'ea1ec1d1-02a9-42aa-bd90-02f17d71561a',
      type: 'polyline',
      properties: {},
      sourceNodeId: '1060c5e3-dc76-40a0-9efa-489f9cbee34f',
      targetNodeId: '8191c958-7e4b-4377-8026-f78983595b85',
      sourceAnchorId: '1060c5e3-dc76-40a0-9efa-489f9cbee34f_1',
      targetAnchorId: '8191c958-7e4b-4377-8026-f78983595b85_3',
      startPoint: {
        x: 913,
        y: -125,
      },
      endPoint: {
        x: 1002,
        y: 9,
      },
      pointsList: [
        {
          x: 913,
          y: -125,
        },
        {
          x: 972,
          y: -125,
        },
        {
          x: 972,
          y: 9,
        },
        {
          x: 1002,
          y: 9,
        },
      ],
    },
    {
      id: '22cf9055-23e0-4171-8886-34f3b241b1a6',
      type: 'polyline',
      properties: {},
      sourceNodeId: '864a15d8-1cbe-4d97-a548-2ced1c7d6d61',
      targetNodeId: '070d2171-eb56-4ad8-a8bf-bf1aa0f6efbb',
      sourceAnchorId: '864a15d8-1cbe-4d97-a548-2ced1c7d6d61_1',
      targetAnchorId: '070d2171-eb56-4ad8-a8bf-bf1aa0f6efbb_3',
      startPoint: {
        x: 1101,
        y: -216,
      },
      endPoint: {
        x: 1212,
        y: -96,
      },
      pointsList: [
        {
          x: 1101,
          y: -216,
        },
        {
          x: 1182,
          y: -216,
        },
        {
          x: 1182,
          y: -96,
        },
        {
          x: 1212,
          y: -96,
        },
      ],
    },
    {
      id: '785c6c19-5291-4770-b580-5cb23bca4503',
      type: 'polyline',
      properties: {},
      sourceNodeId: '8191c958-7e4b-4377-8026-f78983595b85',
      targetNodeId: '070d2171-eb56-4ad8-a8bf-bf1aa0f6efbb',
      sourceAnchorId: '8191c958-7e4b-4377-8026-f78983595b85_1',
      targetAnchorId: '070d2171-eb56-4ad8-a8bf-bf1aa0f6efbb_3',
      startPoint: {
        x: 1102,
        y: 9,
      },
      endPoint: {
        x: 1212,
        y: -96,
      },
      pointsList: [
        {
          x: 1102,
          y: 9,
        },
        {
          x: 1182,
          y: 9,
        },
        {
          x: 1182,
          y: -96,
        },
        {
          x: 1212,
          y: -96,
        },
      ],
    },
    {
      id: 'e9b31fcd-e851-47f8-a9b0-f945bbe06c74',
      type: 'polyline',
      properties: {},
      sourceNodeId: '047c2579-6d8c-47e5-b1ac-5015da8d7e71',
      targetNodeId: '3235c699-be14-4f1b-8aa0-aef0d73b8ba5',
      sourceAnchorId: '047c2579-6d8c-47e5-b1ac-5015da8d7e71_2',
      targetAnchorId: '3235c699-be14-4f1b-8aa0-aef0d73b8ba5_2',
      startPoint: {
        x: 895,
        y: 365,
      },
      endPoint: {
        x: 336,
        y: 231,
      },
      pointsList: [
        {
          x: 895,
          y: 365,
        },
        {
          x: 895,
          y: 395,
        },
        {
          x: 336,
          y: 395,
        },
        {
          x: 336,
          y: 231,
        },
      ],
    },
    {
      id: 'caf31c49-0bdb-4e21-95af-9ef2d3410f14',
      type: 'polyline',
      properties: {},
      sourceNodeId: '8b4fb286-c992-4165-aa26-3b430f6ed618',
      targetNodeId: 'eaf4149e-8ef6-4357-865a-9ede67999dd4',
      sourceAnchorId: '8b4fb286-c992-4165-aa26-3b430f6ed618_1',
      targetAnchorId: 'eaf4149e-8ef6-4357-865a-9ede67999dd4_3',
      startPoint: {
        x: 734,
        y: 107,
      },
      endPoint: {
        x: 808.5000000000001,
        y: 113.21744791666679,
      },
      pointsList: [
        {
          x: 734,
          y: 107,
        },
        {
          x: 771.25,
          y: 107,
        },
        {
          x: 771.25,
          y: 113.21744791666679,
        },
        {
          x: 808.5000000000001,
          y: 113.21744791666679,
        },
      ],
    },
    {
      id: '85ba96f1-a75d-4d60-bfdc-926fe51bbe90',
      type: 'polyline',
      properties: {},
      sourceNodeId: 'eaf4149e-8ef6-4357-865a-9ede67999dd4',
      targetNodeId: 'd14c2677-1195-4bd1-9d4a-8700c2d69577',
      sourceAnchorId: 'eaf4149e-8ef6-4357-865a-9ede67999dd4_1',
      targetAnchorId: 'd14c2677-1195-4bd1-9d4a-8700c2d69577_3',
      startPoint: {
        x: 868.5000000000001,
        y: 113.21744791666679,
      },
      endPoint: {
        x: 1034.3333333333337,
        y: 169.46744791666683,
      },
      pointsList: [
        {
          x: 868.5000000000001,
          y: 113.21744791666679,
        },
        {
          x: 951.416666666667,
          y: 113.21744791666679,
        },
        {
          x: 951.416666666667,
          y: 169.46744791666683,
        },
        {
          x: 1034.3333333333337,
          y: 169.46744791666683,
        },
      ],
    },
    {
      id: '76c73b43-f458-4405-b9b3-680de8ee4c2f',
      type: 'polyline',
      properties: {},
      sourceNodeId: 'd14c2677-1195-4bd1-9d4a-8700c2d69577',
      targetNodeId: '9424948a-a4b7-418e-8e5a-b3f84ea6498f',
      sourceAnchorId: 'd14c2677-1195-4bd1-9d4a-8700c2d69577_1',
      targetAnchorId: '9424948a-a4b7-418e-8e5a-b3f84ea6498f_3',
      startPoint: {
        x: 1134.3333333333337,
        y: 169.46744791666683,
      },
      endPoint: {
        x: 1241.916666666667,
        y: 168.66666666666674,
      },
      pointsList: [
        {
          x: 1134.3333333333337,
          y: 169.46744791666683,
        },
        {
          x: 1188.1250000000005,
          y: 169.46744791666683,
        },
        {
          x: 1188.1250000000005,
          y: 168.66666666666674,
        },
        {
          x: 1241.916666666667,
          y: 168.66666666666674,
        },
      ],
    },
    {
      id: '8dca9e99-6320-4e36-b87f-dcf077fa5d1c',
      type: 'polyline',
      properties: {},
      sourceNodeId: '1060c5e3-dc76-40a0-9efa-489f9cbee34f',
      targetNodeId: '3235c699-be14-4f1b-8aa0-aef0d73b8ba5',
      sourceAnchorId: '1060c5e3-dc76-40a0-9efa-489f9cbee34f_0',
      targetAnchorId: '3235c699-be14-4f1b-8aa0-aef0d73b8ba5_0',
      startPoint: {
        x: 883,
        y: -175,
      },
      endPoint: {
        x: 336,
        y: 151,
      },
      pointsList: [
        {
          x: 883,
          y: -175,
        },
        {
          x: 883,
          y: -205,
        },
        {
          x: 336,
          y: -205,
        },
        {
          x: 336,
          y: 151,
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
    align: 'UL',
    changeAnchor: true,
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
      lf.setPatternItems([
        {
          type: 'circle',
          text: '开始',
          label: '开始节点',
          icon: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/core/start.png',
        },
        {
          type: 'rect',
          text: '任务',
          label: '系统任务',
          icon: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/core/rect.png',
        },
        {
          type: 'diamond',
          text: '判断',
          label: '条件判断',
          icon: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/core/diamond.png',
        },
        {
          type: 'circle',
          text: '结束',
          label: '结束节点',
          icon: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/core/end.png',
        },
      ])
      lf.render(data)
      lf.translateCenter()
      lfRef.current = lf
    }
  }, [])

  // 执行布局
  const applyLayout = () => {
    console.log('111', lfRef.current?.getGraphRawData())
    if (lfRef.current?.extension.dagre) {
      ;(lfRef.current.extension.dagre as Dagre)?.layout({
        rankdir: layoutConfig.rankdir as any,
        align: layoutConfig.align || undefined,
        changeAnchor: layoutConfig.changeAnchor,
      })
    }
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

          <Form.Item label="自动调整锚点">
            <Select
              style={{ width: 120 }}
              options={[
                { value: true, label: '是' },
                { value: false, label: '否' },
              ]}
              value={layoutConfig.changeAnchor}
              onChange={(value) => handleConfigChange('changeAnchor', value)}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" onClick={applyLayout}>
              应用布局
            </Button>
          </Form.Item>
        </Form>
      </Flex>
      <Divider />
      <div ref={containerRef} id="graph" className={styles.viewport}></div>
    </Card>
  )
}
