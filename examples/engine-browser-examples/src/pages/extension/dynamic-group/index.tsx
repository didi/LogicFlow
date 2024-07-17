import LogicFlow from '@logicflow/core'
import {
  Control,
  DndPanel,
  ShapeItem,
  // Group,
  DynamicGroup,
  SelectionSelect,
} from '@logicflow/extension'

import { Button, Card, Divider, Flex } from 'antd'
import { useEffect, useRef } from 'react'
// import { customGroup, subProcess } from './nodes'
import GraphConfigData = LogicFlow.GraphConfigData

import '@logicflow/core/es/index.css'
import '@logicflow/extension/es/index.css'
import './index.less'
import { getImageUrl } from '@/utls.ts'

const config: Partial<LogicFlow.Options> = {
  grid: true,
  multipleSelectKey: 'alt',
  autoExpand: false,
  allowResize: true,
  keyboard: {
    enabled: true,
  },
  plugins: [DynamicGroup, Control, DndPanel, SelectionSelect],
}

const customDndConfig: ShapeItem[] = [
  {
    type: 'dynamic-group',
    label: '内置动态分组',
    text: 'DynamicGroup',
    icon: getImageUrl('/group/group.png'),
  },
  {
    type: 'circle',
    label: '圆形',
    text: 'Circle',
    icon: getImageUrl('/group/circle.png'),
  },
  {
    type: 'rect',
    label: '矩形',
    text: 'Rect',
    icon: getImageUrl('/group/rect.png'),
  },
  // {
  //   type: 'sub-process',
  //   label: '子流程-展开',
  //   text: 'SubProcess',
  //   icon: getImageUrl('/group/subprocess-expanded.png'),
  // },
  // {
  //   type: 'sub-process',
  //   label: '子流程-收起',
  //   text: 'SubProcess',
  //   icon: getImageUrl('/group/subprocess-collapsed.png'),
  // },
]

const getDndPanelConfig = (lf: LogicFlow): ShapeItem[] => [
  {
    label: '选区',
    icon: getImageUrl('/bpmn/select.png'),
    callback: () => {
      lf.openSelectionSelect()
      lf.once('selection:selected', () => {
        lf.closeSelectionSelect()
      })
    },
  },
  ...customDndConfig,
]

export default function BPMNExtension() {
  const lfRef = useRef<LogicFlow>()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!lfRef.current) {
      const lf = new LogicFlow({
        ...config,
        container: containerRef.current as HTMLElement,
      })

      const dndPanelConfig = getDndPanelConfig(lf)
      lf.setPatternItems(dndPanelConfig)

      // lf.register(customGroup)
      // lf.register(subProcess)

      // 获取渲染数据
      const graphData: GraphConfigData = {
        nodes: [
          // {
          //   type: "custom-group",
          //   x: 400,
          //   y: 400,
          //   text: 'custom-group1',
          //   children: ["circle_1"]
          // },
          // {
          //   id: "circle_1",
          //   type: "circle",
          //   x: 400,
          //   y: 400
          // },
          // {
          //   id: "rect_1",
          //   type: "rect",
          //   x: 200,
          //   y: 100
          // },
          // {
          //   id: "circle_2",
          //   type: "circle",
          //   x: 800,
          //   y: 140
          // },
          // {
          //   id: 'group_1',
          //   type: 'sub-process',
          //   x: 300,
          //   y: 120,
          //   // children: ["rect_3"],
          //   text: 'sub-process-1',
          //   properties: {
          //     isFolded: false,
          //   },
          // },
          {
            id: 'dynamic-group_1',
            type: 'dynamic-group',
            x: 500,
            y: 140,
            // children: ["rect_3"],
            text: 'dynamic-group_1',
            resizable: true,
            properties: {
              // resizable: true,
              collapsible: true,
              width: 420,
              height: 250,
              radius: 5,
              isCollapsed: false,
            },
          },
          {
            id: 'dynamic-group_2',
            type: 'dynamic-group',
            x: 500,
            y: 420,
            // children: ["rect_3"],
            text: 'dynamic-group_2',
            resizable: true,
            properties: {
              width: 420,
              height: 250,
              radius: 5,
              collapsible: false,
              isCollapsed: false,
            },
          },
          // {
          //   id: "group_2",
          //   type: "sub-process",
          //   x: 800,
          //   y: 120,
          //   children: ["circle_4"],
          //   text: 'sub-process-2',
          //   properties: {
          //     isFolded: true
          //   }
          // }
        ],
        edges: [],
      }
      lf.render(graphData)

      lfRef.current = lf
    }
  }, [])

  const getGraphData = () => {
    const graphData = lfRef.current?.getGraphRawData()
    console.log('cur graph data:', graphData)
  }

  const rerender = () => {}

  return (
    <Card
      title="LogicFlow Extension - DynamicGroup"
      className="control-container"
    >
      <Flex wrap="wrap" gap="small">
        <Button type="primary" key="getData" onClick={getGraphData}>
          获取数据
        </Button>
        <Button type="primary" key="rerender" onClick={rerender}>
          重新渲染
        </Button>
      </Flex>
      <Divider />
      <div ref={containerRef} id="graph" className="viewport"></div>
    </Card>
  )
}
