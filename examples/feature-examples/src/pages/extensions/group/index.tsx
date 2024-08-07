import LogicFlow from '@logicflow/core'
import {
  Control,
  DndPanel,
  ShapeItem,
  Group,
  SelectionSelect,
} from '@logicflow/extension'

import { Button, Card, Divider, Flex } from 'antd'
import { useEffect, useRef } from 'react'
import { customGroup, subProcess } from './nodes'
import GraphConfigData = LogicFlow.GraphConfigData

import '@logicflow/core/es/index.css'
import '@logicflow/extension/es/index.css'
import styles from './index.less'

const config: Partial<LogicFlow.Options> = {
  grid: true,
  multipleSelectKey: 'alt',
  allowResize: true,
  autoExpand: false,
  keyboard: {
    enabled: true,
  },
  plugins: [Group, Control, DndPanel, SelectionSelect],
}

const customDndConfig: ShapeItem[] = [
  {
    type: 'custom-group',
    label: '自定义分组',
    text: 'CustomGroup',
    icon: require('@/assets/group/group.png'),
  },
  {
    type: 'circle',
    label: '圆形',
    text: 'Circle',
    icon: require('@/assets/group/circle.png'),
  },
  {
    type: 'rect',
    label: '矩形',
    text: 'Rect',
    icon: require('@/assets/group/rect.png'),
  },
  {
    type: 'sub-process',
    label: '子流程-展开',
    text: 'SubProcess',
    icon: require('@/assets/group/subprocess-expanded.png'),
  },
  {
    type: 'sub-process',
    label: '子流程-收起',
    text: 'SubProcess',
    icon: require('@/assets/group/subprocess-collapsed.png'),
  },
]

const getDndPanelConfig = (lf: LogicFlow): ShapeItem[] => [
  {
    label: '选区',
    icon: require('@/assets/bpmn/select.png'),
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

      lf.register(customGroup)
      lf.register(subProcess)

      // 获取渲染数据
      const graphData: GraphConfigData = {
        nodes: [
          {
            id: 'rect_3',
            type: 'rect',
            x: 400,
            y: 400,
            text: 'custom-group1',
          },
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
          {
            id: 'group_1',
            type: 'sub-process',
            x: 300,
            y: 120,
            children: ['rect_3'],
            text: 'sub-process-1',
            properties: {
              isFolded: false,
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
    if (lfRef.current) {
      const graphData = lfRef.current?.getGraphRawData()
      console.log('graphData --->>>', graphData)
    }
  }

  const rerender = () => {
    lfRef.current &&
      lfRef.current.render({
        nodes: [
          {
            id: 'group_1',
            type: 'sub-process',
            x: 300,
            y: 120,
            text: 'sub-process-1',
            properties: {
              isFolded: false,
            },
          },
        ],
        edges: [],
      })
  }

  return (
    <Card title="LogicFlow Extension - DndPanel" className="control-container">
      <Flex wrap="wrap" gap="small">
        <Button type="primary" key="getData" onClick={getGraphData}>
          获取数据
        </Button>
        <Button type="primary" key="rerender" onClick={rerender}>
          重新渲染
        </Button>
      </Flex>
      <Divider />
      <div ref={containerRef} id="graph" className={styles.viewport}></div>
    </Card>
  )
}
