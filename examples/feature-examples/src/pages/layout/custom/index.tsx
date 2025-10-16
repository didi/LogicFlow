import LogicFlow, { createUuid } from '@logicflow/core'
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
  keyboard: {
    enabled: true,
  },
}

const data = {
  nodes: [
    {
      id: '7fb84451-30c5-48f7-827f-bc18bfa20320',
      type: 'start',
      x: 202,
      y: 131,
      properties: {
        nodeName: '开始',
        width: 190,
        height: 44,
      },
    },
    {
      id: 'd9eede1a-de12-4baf-92ef-4e51356cabb1',
      type: 'task',
      x: 798,
      y: 64,
      properties: {
        nodeName: '任务',
        nodeContent: '任务详情：请求接口，拿到资源后进行处理',
        width: 190,
        height: 100,
      },
    },
    {
      id: 'd5207d6a-cb03-4fe0-802a-89a775644fc7',
      type: 'task',
      x: 773,
      y: 255,
      properties: {
        nodeName: '任务',
        nodeContent: '任务详情：请求接口，拿到资源后进行处理',
        width: 190,
        height: 100,
      },
    },
    {
      id: 'e4f6fbfa-9656-4961-b9c3-b9f8f3cc9852',
      type: 'end',
      x: 1528,
      y: 272,
      properties: {
        nodeName: '结束',
        width: 190,
        height: 44,
      },
    },
    {
      id: '4132e2ad-524c-4d28-bb7f-00b6c01a5c7d',
      type: 'task',
      x: 1067,
      y: 63.80078125,
      properties: {
        nodeName: '任务',
        nodeContent: '任务详情：请求接口，拿到资源后进行处理',
        width: 190,
        height: 100,
      },
    },
    {
      id: '473e0af0-705f-47c6-823c-d4492c6731b7',
      type: 'task',
      x: 1197,
      y: 202.80078125,
      properties: {
        nodeName: '任务',
        nodeContent: '任务详情：请求接口，拿到资源后进行处理',
        width: 190,
        height: 100,
      },
    },
    {
      id: 'b624b416-18dc-4cc8-9ade-cca48295139f',
      type: 'end',
      x: 867.5,
      y: 394.701171875,
      properties: {
        nodeName: '结束',
        width: 190,
        height: 44,
      },
    },
    {
      id: 'c6c53dca-5e7d-40f7-8289-15c95532c2d1',
      type: 'judge',
      x: 503,
      y: 120.0517578125,
      properties: {
        nodeName: '条件',
        branches: [
          {
            anchorId: 'e8cfd494-b5ef-4e06-826c-483c3ee48568_right',
            branchName: '分支1条件分支1条件',
            conditions: [],
          },
          {
            anchorId: 'c505a9f6-6902-44a3-bef2-37ba5dfb0787_right',
            branchName: '分支2条件',
            conditions: [],
          },
        ],
        width: 190,
        height: 124,
      },
    },
  ],
  edges: [
    {
      id: 'ab662c71-88a1-47d3-8a81-cb11a6f2c44d',
      type: 'polyline',
      properties: {},
      sourceNodeId: 'd9eede1a-de12-4baf-92ef-4e51356cabb1',
      targetNodeId: '4132e2ad-524c-4d28-bb7f-00b6c01a5c7d',
      sourceAnchorId: 'd9eede1a-de12-4baf-92ef-4e51356cabb1_1_right',
      targetAnchorId: '4132e2ad-524c-4d28-bb7f-00b6c01a5c7d_1_left',
      startPoint: {
        x: 893,
        y: 64,
      },
      endPoint: {
        x: 972,
        y: 63.80078125,
      },
      pointsList: [
        {
          x: 893,
          y: 64,
        },
        {
          x: 932.5,
          y: 64,
        },
        {
          x: 932.5,
          y: 63.80078125,
        },
        {
          x: 972,
          y: 63.80078125,
        },
      ],
    },
    {
      id: '7ac1fc4c-b086-4116-81ae-1486e47d18a4',
      type: 'polyline',
      properties: {},
      sourceNodeId: '4132e2ad-524c-4d28-bb7f-00b6c01a5c7d',
      targetNodeId: '473e0af0-705f-47c6-823c-d4492c6731b7',
      sourceAnchorId: '4132e2ad-524c-4d28-bb7f-00b6c01a5c7d_1_right',
      targetAnchorId: '473e0af0-705f-47c6-823c-d4492c6731b7_1_left',
      startPoint: {
        x: 1162,
        y: 63.80078125,
      },
      endPoint: {
        x: 1102,
        y: 202.80078125,
      },
      pointsList: [
        {
          x: 1162,
          y: 63.80078125,
        },
        {
          x: 1192,
          y: 63.80078125,
        },
        {
          x: 1192,
          y: 133.30078125,
        },
        {
          x: 1072,
          y: 133.30078125,
        },
        {
          x: 1072,
          y: 202.80078125,
        },
        {
          x: 1102,
          y: 202.80078125,
        },
      ],
    },
    {
      id: 'eb22a6c0-80f0-4f41-8732-c29cfd4834c5',
      type: 'polyline',
      properties: {},
      sourceNodeId: '473e0af0-705f-47c6-823c-d4492c6731b7',
      targetNodeId: 'e4f6fbfa-9656-4961-b9c3-b9f8f3cc9852',
      sourceAnchorId: '473e0af0-705f-47c6-823c-d4492c6731b7_1_right',
      targetAnchorId: 'e4f6fbfa-9656-4961-b9c3-b9f8f3cc9852_1_left',
      startPoint: {
        x: 1292,
        y: 202.80078125,
      },
      endPoint: {
        x: 1433,
        y: 272,
      },
      pointsList: [
        {
          x: 1292,
          y: 202.80078125,
        },
        {
          x: 1403,
          y: 202.80078125,
        },
        {
          x: 1403,
          y: 272,
        },
        {
          x: 1433,
          y: 272,
        },
      ],
    },
    {
      id: '8cbc0b81-1f9c-49b7-8d03-a9bfd9109c0a',
      type: 'polyline',
      properties: {},
      sourceNodeId: 'd5207d6a-cb03-4fe0-802a-89a775644fc7',
      targetNodeId: 'b624b416-18dc-4cc8-9ade-cca48295139f',
      sourceAnchorId: 'd5207d6a-cb03-4fe0-802a-89a775644fc7_1_right',
      targetAnchorId: 'b624b416-18dc-4cc8-9ade-cca48295139f_1_left',
      startPoint: {
        x: 868,
        y: 255,
      },
      endPoint: {
        x: 772.5,
        y: 394.701171875,
      },
      pointsList: [
        {
          x: 868,
          y: 255,
        },
        {
          x: 992.5,
          y: 255,
        },
        {
          x: 992.5,
          y: 446.701171875,
        },
        {
          x: 742.5,
          y: 446.701171875,
        },
        {
          x: 742.5,
          y: 394.701171875,
        },
        {
          x: 772.5,
          y: 394.701171875,
        },
      ],
    },
    {
      id: '26fb52c6-76a4-4546-a5a7-17968ddb05e6',
      type: 'polyline',
      properties: {},
      sourceNodeId: '7fb84451-30c5-48f7-827f-bc18bfa20320',
      targetNodeId: 'c6c53dca-5e7d-40f7-8289-15c95532c2d1',
      sourceAnchorId: '7fb84451-30c5-48f7-827f-bc18bfa20320_1_right',
      targetAnchorId: 'c6c53dca-5e7d-40f7-8289-15c95532c2d1_1_left',
      startPoint: {
        x: 297,
        y: 131,
      },
      endPoint: {
        x: 408,
        y: 120.0517578125,
      },
      pointsList: [
        {
          x: 297,
          y: 131,
        },
        {
          x: 352.5,
          y: 131,
        },
        {
          x: 352.5,
          y: 120.0517578125,
        },
        {
          x: 408,
          y: 120.0517578125,
        },
      ],
    },
    {
      id: '1bd05a8f-622b-463c-a802-e4230ebba0b3',
      type: 'polyline',
      properties: {},
      sourceNodeId: 'c6c53dca-5e7d-40f7-8289-15c95532c2d1',
      targetNodeId: 'd9eede1a-de12-4baf-92ef-4e51356cabb1',
      sourceAnchorId: 'e8cfd494-b5ef-4e06-826c-483c3ee48568_right',
      targetAnchorId: 'd9eede1a-de12-4baf-92ef-4e51356cabb1_1_left',
      startPoint: {
        x: 598,
        y: 108.0517578125,
      },
      endPoint: {
        x: 703,
        y: 64,
      },
      pointsList: [
        {
          x: 598,
          y: 108.0517578125,
        },
        {
          x: 650.5,
          y: 108.0517578125,
        },
        {
          x: 650.5,
          y: 64,
        },
        {
          x: 703,
          y: 64,
        },
      ],
    },
    {
      id: '4dced4a5-d77c-4ec4-95f7-ed26f2dacc51',
      type: 'polyline',
      properties: {},
      sourceNodeId: 'c6c53dca-5e7d-40f7-8289-15c95532c2d1',
      targetNodeId: 'd5207d6a-cb03-4fe0-802a-89a775644fc7',
      sourceAnchorId: 'c505a9f6-6902-44a3-bef2-37ba5dfb0787_right',
      targetAnchorId: 'd5207d6a-cb03-4fe0-802a-89a775644fc7_1_left',
      startPoint: {
        x: 598,
        y: 138.0517578125,
      },
      endPoint: {
        x: 678,
        y: 255,
      },
      pointsList: [
        {
          x: 598,
          y: 138.0517578125,
        },
        {
          x: 648,
          y: 138.0517578125,
        },
        {
          x: 648,
          y: 255,
        },
        {
          x: 678,
          y: 255,
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
        const newNode: any = lf.cloneNode(data.id)
        // 重新生成判断节点properties.branches中的anchorId
        const nodeModel: any = lf.graphModel.getNodeModelById(newNode.id)
        if (nodeModel.type === 'judge') {
          const { properties } = nodeModel
          const newBranches = (properties.branches || []).map((branch: any) => {
            branch.anchorId = `${createUuid()}_right`
            return branch
          })
          nodeModel.setProperties({
            ...properties,
            branches: newBranches,
          })
        }
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
        isDefaultAnchor: false,
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
