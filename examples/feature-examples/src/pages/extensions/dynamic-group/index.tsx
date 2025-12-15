import LogicFlow from '@logicflow/core'
import {
  Control,
  DndPanel,
  ShapeItem,
  DynamicGroup,
  SelectionSelect,
} from '@logicflow/extension'

import { Button, Card, Divider, Flex, message } from 'antd'
import { useEffect, useRef } from 'react'
// import { customGroup, subProcess } from './nodes'
import GraphConfigData = LogicFlow.GraphConfigData

import '@logicflow/core/es/index.css'
import '@logicflow/extension/es/index.css'
import './index.less'

const config: Partial<LogicFlow.Options> = {
  // grid: true,
  multipleSelectKey: 'alt',
  autoExpand: false,
  allowResize: true,
  allowRotate: true,
  nodeTextDraggable: false,
  stopMoveGraph: true,
  grid: {
    size: 10,
  },
  snapGrid: false,
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
    icon: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/examples/extension/group/group.png',
  },
  {
    type: 'circle',
    label: '圆形',
    text: 'Circle',
    icon: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/examples/extension/group/circle.png',
  },
  {
    type: 'rect',
    label: '矩形',
    text: 'Rect',
    icon: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/examples/extension/group/rect.png',
  },
  // {
  //   type: 'sub-process',
  //   label: '子流程-展开',
  //   text: 'SubProcess',
  //   icon: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/examples/extension/group/subprocess-expanded.png',
  // },
  // {
  //   type: 'sub-process',
  //   label: '子流程-收起',
  //   text: 'SubProcess',
  //   icon: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/examples/extension/group/subprocess-collapsed.png',
  // },
]

const getDndPanelConfig = (lf: LogicFlow): ShapeItem[] => [
  {
    label: '单次框选',
    icon: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/examples/extension/bpmn/select.png',
    callback: () => {
      lf.openSelectionSelect()
      lf.once('selection:selected', () => {
        lf.closeSelectionSelect()
      })
    },
  },
  {
    label: '开启框选',
    icon: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/examples/extension/bpmn/select.png',
    callback: () => {
      lf.openSelectionSelect()
    },
  },
  {
    label: '关闭框选',
    icon: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/examples/extension/bpmn/select.png',
    callback: () => {
      lf.closeSelectionSelect()
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
        iconClass: 'lf-control-move',
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
        key: 'add-child',
        iconClass: 'lf-control-add',
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
          },
          {
            id: 'dynamic-group_2',
            type: 'dynamic-group',
            x: 544,
            y: 376,
            text: 'dynamic-group_2',
            resizable: true,
            properties: {
              transformWithContainer: true,
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
          // #2041 - 演示动态添加子节点的功能
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
      }
      lf.render(graphData)
      // lf.setSelectionSelectMode(true)

      // 添加事件监听
      lf.on('node:properties-change', (event: unknown) => {
        console.log('node:properties-change', event)
      })

      lf.on('dynamicGroup:collapse', ({ collapse, nodeModel }) => {
        message.info(`分组${nodeModel.id} ${collapse ? '收起' : '展开'}`)
      })

      lfRef.current = lf
    }
  }, [])

  const getGraphData = () => {
    const graphData = lfRef.current?.getGraphRawData()
    console.log('cur graph data:', graphData)
  }

  const rerender = () => {}

  // 导出当前图数据为 JSON 文件
  const handleExportGraph = () => {
    const lf = lfRef.current
    if (!lf) return
    const data = lf.getGraphRawData() as GraphConfigData
    try {
      const json = JSON.stringify(data, null, 2)
      const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'dynamic-group-graph.json'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      message.success('导出成功')
    } catch (err) {
      console.error('导出失败:', err)
      message.error('导出失败，请查看控制台日志')
    }
  }

  // 从本地 JSON 文件导入图数据
  const handleImportGraph = () => {
    const lf = lfRef.current
    if (!lf) return
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json,application/json'
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        try {
          const text = String(reader.result || '')
          const parsed = JSON.parse(text) as GraphConfigData
          // 简单校验结构
          if (!parsed || typeof parsed !== 'object') {
            throw new Error('无效的图数据')
          }
          // 渲染导入数据
          lf.clearData()
          lf.render(parsed)
          message.success('导入成功')
        } catch (err) {
          console.error('导入失败:', err)
          message.error('导入失败：JSON 格式不合法或数据结构错误')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

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
        <Button type="primary" key="export" onClick={handleExportGraph}>
          导出 JSON
        </Button>
        <Button type="primary" key="import" onClick={handleImportGraph}>
          导入 JSON
        </Button>
      </Flex>
      <Divider />
      <div ref={containerRef} id="graph" className="viewport"></div>
    </Card>
  )
}
