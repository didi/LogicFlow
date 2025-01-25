import LogicFlow from '@logicflow/core'
import {
  Control,
  DndPanel,
  ShapeItem,
  DynamicGroup,
  SelectionSelect,
} from '@logicflow/extension'

import { Button, Card, Divider, Flex } from 'antd'
import { useEffect, useRef } from 'react'
// import { customGroup, subProcess } from './nodes'
import GraphConfigData = LogicFlow.GraphConfigData

import '@logicflow/core/es/index.css'
// import '@logicflow/extension/es/index.css'
import './index.less'
import { getImageUrl } from '@/utls.ts'

const config: Partial<LogicFlow.Options> = {
  grid: true,
  multipleSelectKey: 'alt',
  autoExpand: false,
  allowResize: true,
  allowRotate: true,
  nodeTextDraggable: false,
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

export default function DynamicGroupDemo() {
  const lfRef = useRef<LogicFlow>()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!lfRef.current) {
      const lf = new LogicFlow({
        ...config,
        container: containerRef.current as HTMLElement,
      })
      ;(lf.extension.control as Control).addItem({
        key: 'move-group',
        iconClass: 'custom-minimap',
        title: '',
        text: '右移分组',
        onClick: (lf) => {
          const { nodes } = lf.getSelectElements()
          const selectedNode = nodes[0]
          if (!selectedNode) {
            return
          }
          const isGroup = lf.getModelById(selectedNode.id)?.isGroup
          if (!isGroup) {
            return
          }
          lf.graphModel.moveNode(selectedNode.id, 10, 0)
        },
      })
      ;(lf.extension.control as Control).addItem({
        key: 'move-group',
        iconClass: 'custom-minimap',
        title: '',
        text: 'addChild',
        onClick: (lf) => {
          const groupModel = lf.getNodeModelById('#2041_dynamic-group_1')
          groupModel?.addChild('#2041_circle_1')
          groupModel?.addChild('#2041_circle_2')
        },
      })

      const dndPanelConfig = getDndPanelConfig(lf)
      lf.setPatternItems(dndPanelConfig)

      // lf.register(customGroup)
      // lf.register(subProcess)

      // 获取渲染数据
      const graphData: GraphConfigData = {
        nodes: [
          {
            id: 'circle_2',
            type: 'circle',
            x: 800,
            y: 140,
            text: {
              value: 'circle_2',
              x: 800,
              y: 140,
              editable: false,
              draggable: true,
            },
          },
          {
            id: 'circle_3',
            type: 'circle',
            x: 544,
            y: 94,
            properties: {},
            text: {
              x: 544,
              y: 94,
              value: 'Circle',
            },
          },
          {
            id: 'dynamic-group_1',
            type: 'dynamic-group',
            x: 500,
            y: 140,
            text: 'dynamic-group_1',
            resizable: true,
            properties: {
              collapsible: true,
              width: 420,
              height: 250,
              radius: 5,
              isCollapsed: true,
              children: ['circle_3', 'circle_2'],
            },
          },
          {
            id: 'rect_1',
            type: 'rect',
            x: 455,
            y: 243,
            properties: {
              width: 40,
              height: 40,
            },
            // text: {
            //   x: 455,
            //   y: 213,
            //   value: 'Rect',
            // },
          },
          {
            id: 'dynamic-group_2',
            type: 'dynamic-group',
            x: 544,
            y: 376,
            text: 'dynamic-group_2',
            resizable: true,
            properties: {
              transformWithContainer: false,
              width: 520,
              height: 350,
              radius: 5,
              collapsible: false,
              isCollapsed: false,
              isRestrict: false,
              children: ['rect_1', 'dynamic-group-inner-2'],
            },
          },
          {
            id: 'dynamic-group-inner-2',
            type: 'dynamic-group',
            x: 544,
            y: 376,
            text: 'dynamic-group-inner-2',
            resizable: true,
            properties: {
              transformWithContainer: false,
              width: 320,
              height: 150,
              radius: 5,
              collapsible: false,
              isCollapsed: false,
              isRestrict: false,
              children: ['inner-rect'],
            },
          },
          {
            id: 'inner-rect',
            type: 'rect',
            x: 452,
            y: 357,
            properties: {
              width: 100,
              height: 80,
            },
            text: {
              x: 452,
              y: 357,
              value: 'Rect',
            },
          },
          // #2041
          {
            id: '#2041_circle_1',
            type: 'circle',
            x: 1022,
            y: 170,
            text: {
              value: 'circle_1',
              x: 1022,
              y: 170,
              draggable: true,
            },
          },
          {
            id: '#2041_circle_2',
            type: 'circle',
            x: 1180,
            y: 170,
            text: {
              value: 'circle_2',
              x: 1180,
              y: 170,
              draggable: true,
            },
          },
          {
            id: '#2041_dynamic-group_1',
            type: 'dynamic-group',
            x: 1042,
            y: 189,
            text: 'dynamic-group_fix_#2041',
            resizable: true,
            properties: {
              width: 420,
              height: 250,
              radius: 5,
            },
          },
        ],
        edges: [],
        // 'nodes': [
        //   {
        //     'id': 'circle_2',
        //     'type': 'circle',
        //     'x': 800,
        //     'y': 140,
        //     'properties': {},
        //     'text': {
        //       'x': 800,
        //       'y': 140,
        //       'value': 'circle_2',
        //     },
        //   },
        //   {
        //     'id': 'dynamic-group_1',
        //     'type': 'dynamic-group',
        //     'x': 330,
        //     'y': 45,
        //     'properties': {
        //       'collapsible': true,
        //       'width': 420,
        //       'height': 250,
        //       'radius': 5,
        //       'isCollapsed': true,
        //       'children': [],
        //     },
        //     'text': {
        //       'x': 330,
        //       'y': 45,
        //       'value': 'dynamic-group_1',
        //     },
        //     'children': [],
        //   },
        //   {
        //     'id': 'dynamic-group_2',
        //     'type': 'dynamic-group',
        //     'x': 500,
        //     'y': 220,
        //     'properties': {
        //       'width': 420,
        //       'height': 250,
        //       'radius': 5,
        //       'collapsible': false,
        //       'isCollapsed': false,
        //       'children': [
        //         '60cff3ff-c20d-461f-9643-ee6a3b9badfc',
        //         '37869799-e2ee-45b8-9150-b38ccc8e65d3',
        //       ],
        //     },
        //     'text': {
        //       'x': 500,
        //       'y': 220,
        //       'value': 'dynamic-group_2',
        //     },
        //     'children': [
        //       '60cff3ff-c20d-461f-9643-ee6a3b9badfc',
        //       '37869799-e2ee-45b8-9150-b38ccc8e65d3',
        //     ],
        //   },
        //   {
        //     'id': '60cff3ff-c20d-461f-9643-ee6a3b9badfc',
        //     'type': 'circle',
        //     'x': 552,
        //     'y': 194,
        //     'properties': {},
        //     'text': {
        //       'x': 552,
        //       'y': 194,
        //       'value': 'Circle',
        //     },
        //   },
        //   {
        //     'id': '37869799-e2ee-45b8-9150-b38ccc8e65d3',
        //     'type': 'rect',
        //     'x': 390,
        //     'y': 214,
        //     'properties': {},
        //     'text': {
        //       'x': 390,
        //       'y': 214,
        //       'value': 'Rect',
        //     },
        //   },
        // ],
        // 'edges': [],
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
