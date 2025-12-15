import { forEach, map } from 'lodash-es'
import LogicFlow, {
  ElementState,
  OverlapMode,
  ModelType,
} from '@logicflow/core'
import '@logicflow/core/es/index.css'
import {
  Control,
  DndPanel,
  DynamicGroup,
  SelectionSelect,
  Menu,
  MiniMap,
} from '@logicflow/extension'
import '@logicflow/extension/es/index.css'

import { register, ReactNodeProps } from '@logicflow/react-node-registry'
import '@logicflow/react-node-registry/es/index.css'

import { Button, Card, Divider, Flex, Drawer } from 'antd'
import { useEffect, useRef, useState } from 'react'
import { combine, square, star, uml, user } from './nodes'
import { animation, connection } from './edges'

import customCircle from '@/components/nodes/custom-circle'
import customRect from '@/components/nodes/custom-rect'
import customEllipse from '@/components/nodes/custom-ellipse'
import customDiamond from '@/components/nodes/custom-diamond'
import customPolygon from '@/components/nodes/custom-polygon'
import centerAnchorRect from './nodes/centerAnchorRect'

import GraphData = LogicFlow.GraphData
import styles from './index.less'

import OnDragNodeConfig = LogicFlow.OnDragNodeConfig

const NodeComponent: FC<ReactNodeProps> = ({ node }) => {
  const data = node.getData()
  if (!data.properties) data.properties = {}

  return (
    <div className="react-algo-node">
      <img src={require('@/assets/didi.png')} alt="滴滴出行" />
      <span>{data.properties.name as string}</span>
    </div>
  )
}

const config: Partial<LogicFlow.Options> = {
  isSilentMode: false,
  // stopScrollGraph: true,
  // stopZoomGraph: true,
  // textDraggable: true, // TODO: 节点旋转状态下，拖动文本移动是有问题的！！！
  edgeTextDraggable: true,
  // style: {
  //   rect: {
  //     rx: 5,
  //     ry: 5,
  //     strokeWidth: 2,
  //   },
  //   circle: {
  //     fill: '#f5f5f5',
  //     stroke: '#666',
  //   },
  //   ellipse: {
  //     fill: '#dae8fc',
  //     stroke: '#6c8ebf',
  //   },
  //   polygon: {
  //     fill: '#d5e8d4',
  //     stroke: '#82b366',
  //   },
  //   diamond: {
  //     fill: '#ffe6cc',
  //     stroke: '#d79b00',
  //   },
  //   text: {
  //     color: '#b85450',
  //     fontSize: 12,
  //   },
  //   // 下面的 style 移动到此处，不然会覆盖上面设置的各图形的主题样式
  //   inputText: {
  //     background: 'black',
  //     color: 'white',
  //   },
  // },
}

// const customTheme: Partial<LogicFlow.Theme> = {
//   baseNode: {
//     stroke: '#4E93F5',
//   },
//   nodeText: {
//     overflowMode: 'ellipsis',
//     lineHeight: 1.5,
//     fontSize: 13,
//   },
//   edgeText: {
//     overflowMode: 'ellipsis',
//     lineHeight: 1.5,
//     fontSize: 13,
//     textWidth: 100,
//   }, // 确认 textWidth 是否必传 ❓
//   // polyline: {
//   //   stroke: 'red',
//   // },
//   rect: {
//     width: 200,
//     height: 40,
//   },
//   arrow: {
//     offset: 4, // 箭头长度
//     verticalLength: 2, // 箭头垂直于边的距离
//   },
// }
const data = {
  nodes: [
    {
      id: '1',
      type: 'rect',
      x: -150.484375,
      y: -53.17578125,
      properties: {
        width: 100,
        height: 80,
      },
      text: {
        x: -150.484375,
        y: -53.17578125,
        value: '矩形',
      },
    },
    {
      id: '2',
      type: 'circle',
      x: 175.7890625,
      y: 31.359375,
      properties: {
        width: 100,
        height: 100,
      },
      text: {
        x: 175.7890625,
        y: 31.359375,
        value: '圆形',
      },
    },
    {
      id: '3',
      type: 'ellipse',
      x: 550,
      y: 100,
      properties: {
        width: 60,
        height: 90,
      },
      text: {
        x: 550,
        y: 100,
        value: '椭圆',
      },
    },
    {
      id: '4',
      type: 'polygon',
      x: 17.796875,
      y: 256.41796875,
      properties: {
        width: 100,
        height: 100,
      },
      text: {
        x: 17.796875,
        y: 256.41796875,
        value: '多边形',
      },
    },
    {
      id: '5',
      type: 'diamond',
      x: 428.47265625,
      y: 298.89453125,
      properties: {
        width: 60,
        height: 100,
      },
      text: {
        x: 428.47265625,
        y: 298.89453125,
        value: '菱形',
      },
    },
    {
      id: '6',
      type: 'text',
      x: 717.21875,
      y: 102.1328125,
      properties: {
        width: 63,
        height: 17,
      },
      text: {
        x: 717.21875,
        y: 102.1328125,
        value: '纯文本节点',
      },
    },
    {
      id: '7',
      type: 'html',
      x: -184.58203125,
      y: 408.37890625,
      properties: {
        width: 100,
        height: 80,
      },
      text: {
        x: -184.58203125,
        y: 408.37890625,
        value: 'html节点',
      },
    },
    {
      id: 'react-node-1',
      type: 'custom-react-node',
      x: 735.21875,
      y: 471.765625,
      properties: {
        name: '今日出行',
        width: 120,
        height: 26,
      },
    },
    {
      id: 'react-node-2',
      type: 'custom-react-node',
      x: 960.1875,
      y: 225.33984375,
      properties: {
        name: '今日出行',
        width: 160,
        height: 44,
        _showTitle: true,
        _title: '展示icon',
        _expanded: true,
        style: {
          overflow: 'visible',
        },
      },
    },
    {
      id: '8',
      type: 'dynamic-group',
      x: 299.83203125,
      y: 502.328125,
      properties: {
        isCollapsed: false,
        width: 400,
        height: 230,
        children: [],
      },
      text: {
        x: 299.83203125,
        y: 402.328125,
        value: '动态分组节点',
      },
      children: [],
    },
  ],
  edges: [
    {
      id: '1',
      type: 'polyline',
      properties: {},
      sourceNodeId: '1',
      targetNodeId: '2',
      sourceAnchorId: '1_1',
      targetAnchorId: '2_3',
      startPoint: {
        x: -100.484375,
        y: -53.17578125,
      },
      endPoint: {
        x: 125.7890625,
        y: 31.359375,
      },
      text: {
        x: 20.15234375,
        y: 31.39453125,
        value: '默认圆角 + 默认边距（offset）',
      },
      pointsList: [
        {
          x: -100.484375,
          y: -53.17578125,
        },
        {
          x: -85.484375,
          y: -53.17578125,
        },
        {
          x: -85.484375,
          y: 31.359375,
        },
        {
          x: 125.7890625,
          y: 31.359375,
        },
      ],
    },
    {
      id: '2',
      type: 'polyline',
      properties: {
        radius: 10,
        offset: 10,
      },
      sourceNodeId: '2',
      targetNodeId: '3',
      sourceAnchorId: '2_1',
      targetAnchorId: '3_3',
      startPoint: {
        x: 225.7890625,
        y: 31.359375,
      },
      endPoint: {
        x: 520,
        y: 100,
      },
      text: {
        x: 380.39453125,
        y: 100,
        value: '10圆角 + 10边距（offset）',
      },
      pointsList: [
        {
          x: 225.7890625,
          y: 31.359375,
        },
        {
          x: 240.7890625,
          y: 31.359375,
        },
        {
          x: 240.7890625,
          y: 100,
        },
        {
          x: 520,
          y: 100,
        },
      ],
    },
    {
      id: '9',
      type: 'polyline',
      properties: {
        radius: 20,
        offset: 20,
      },
      sourceNodeId: 'react-node-1',
      targetNodeId: 'react-node-2',
      sourceAnchorId: 'react-node-1_1',
      targetAnchorId: 'react-node-2_3',
      startPoint: {
        x: 795.21875,
        y: 471.765625,
      },
      endPoint: {
        x: 880.1875,
        y: 225.33984375,
      },
      text: {
        x: 847.62890625,
        y: 471.890625,
        value: '20圆角 + 20边距（offset）',
      },
      pointsList: [
        {
          x: 795.21875,
          y: 471.765625,
        },
        {
          x: 865.1875,
          y: 471.765625,
        },
        {
          x: 865.1875,
          y: 225.33984375,
        },
        {
          x: 880.1875,
          y: 225.33984375,
        },
      ],
    },
    {
      id: 'polyline_0.49045578156978475',
      type: 'polyline',
      properties: {
        radius: 30,
        offset: 30,
      },
      sourceNodeId: '7',
      targetNodeId: '8',
      sourceAnchorId: '7_1',
      targetAnchorId: '8_3',
      text: '30圆角 + 30边距（offset）',
      startPoint: {
        x: -134.58203125,
        y: 408.37890625,
      },
      endPoint: {
        x: 99.83203125,
        y: 502.328125,
      },
      pointsList: [
        {
          x: -134.58203125,
          y: 408.37890625,
        },
        {
          x: -119.58203125,
          y: 408.37890625,
        },
        {
          x: -119.58203125,
          y: 502.328125,
        },
        {
          x: 99.83203125,
          y: 502.328125,
        },
      ],
    },
    {
      id: 'polyline_0.5264201201781769',
      type: 'polyline',
      properties: {
        radius: 40,
        offset: 40,
      },
      sourceNodeId: '8',
      targetNodeId: 'react-node-1',
      sourceAnchorId: '8_1',
      targetAnchorId: 'react-node-1_3',
      text: '40圆角 + 40边距（offset）',
      startPoint: {
        x: 499.83203125,
        y: 502.328125,
      },
      endPoint: {
        x: 675.21875,
        y: 471.765625,
      },
      pointsList: [
        {
          x: 499.83203125,
          y: 502.328125,
        },
        {
          x: 660.21875,
          y: 502.328125,
        },
        {
          x: 660.21875,
          y: 471.765625,
        },
        {
          x: 675.21875,
          y: 471.765625,
        },
      ],
    },
    {
      id: 'polyline_0.6108247521670321',
      type: 'polyline',
      properties: {
        radius: 50,
        offset: 50,
      },
      sourceNodeId: '3',
      targetNodeId: '5',
      sourceAnchorId: '3_2',
      targetAnchorId: '5_1',
      text: '50圆角 + 50边距（offset）',
      startPoint: {
        x: 550,
        y: 145,
      },
      endPoint: {
        x: 458.47265625,
        y: 298.89453125,
      },
      pointsList: [
        {
          x: 550,
          y: 145,
        },
        {
          x: 550,
          y: 298.89453125,
        },
        {
          x: 458.47265625,
          y: 298.89453125,
        },
      ],
    },
    {
      id: 'polyline_0.6781490701384516',
      type: 'polyline',
      properties: {
        radius: 60,
        offset: 60,
      },
      sourceNodeId: '5',
      targetNodeId: '4',
      sourceAnchorId: '5_3',
      targetAnchorId: '4_1',
      text: '60圆角 + 60边距（offset）',
      startPoint: {
        x: 398.47265625,
        y: 298.89453125,
      },
      endPoint: {
        x: 67.796875,
        y: 256.41796875,
      },
      pointsList: [
        {
          x: 398.47265625,
          y: 298.89453125,
        },
        {
          x: 233.134765625,
          y: 298.89453125,
        },
        {
          x: 233.134765625,
          y: 256.41796875,
        },
        {
          x: 67.796875,
          y: 256.41796875,
        },
      ],
    },
    {
      id: 'polyline_0.9512266825324852',
      type: 'polyline',
      properties: {
        radius: 100,
        offset: 100,
      },
      sourceNodeId: '4',
      targetNodeId: '7',
      sourceAnchorId: '4_3',
      targetAnchorId: '7_0',
      text: '100圆角 + 100边距（offset）',
    },
  ],
}

export default function BasicNode() {
  const lfRef = useRef<LogicFlow>()
  const containerRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  const onClose = () => {
    setOpen(false)
  }

  const registerElements = (lf: LogicFlow) => {
    const elements: LogicFlow.RegisterConfig[] = [
      // edges
      animation,
      connection,
      // nodes
      combine,
      square,
      star,
      uml,
      user,
      customCircle,
      customRect,
      customEllipse,
      customDiamond,
      customPolygon,
      centerAnchorRect,
    ]

    map(elements, (customElement) => {
      lf.register(customElement as LogicFlow.RegisterConfig)
    })
  }
  const registerEvents = (lf: LogicFlow) => {
    lf.on('history:change', () => {
      const data = lf.getGraphData()
      console.log('history:change', data)
    })

    lf.on('blank:drop', (data) => {
      console.log('blank:drop', data)
    })

    lf.on('edge:click', (data) => {
      console.log('edge:click', data)
    })
    lf.on('node:click', (data) => {
      console.log('node:click', data)
      // setOpen(true)
    })
  }

  useEffect(() => {
    if (!lfRef.current) {
      const lf = new LogicFlow({
        ...config,
        container: containerRef.current as HTMLElement,
        // hideAnchors: true,
        // width: 800,
        // height: 400,
        // adjustNodePosition: false,
        // isSilentMode: true,
        // overlapMode: 1,
        // hoverOutline: false,
        // nodeSelectedOutline: false,
        multipleSelectKey: 'shift',
        disabledTools: ['multipleSelect'],
        autoExpand: true,
        // metaKeyMultipleSelected: false,
        // adjustEdgeMiddle: true,
        // stopMoveGraph: true,
        adjustEdgeStartAndEnd: true,
        // adjustEdge: false,
        allowRotate: true,
        allowResize: true,
        edgeTextEdit: true,
        keyboard: {
          enabled: true,
          shortcuts: [
            {
              keys: ['backspace'],
              callback: () => {
                const r = window.confirm('确定要删除吗？')
                if (r) {
                  const elements = lf.getSelectElements(true)
                  lf.clearSelectElements()
                  elements.edges.forEach((edge) => lf.deleteEdge(edge.id))
                  elements.nodes.forEach((node) => lf.deleteNode(node.id))
                  const graphData = lf.getGraphData()
                  console.log(42, graphData, graphData.nodes.length)
                }
                // console.log(1)
              },
            },
          ],
        },
        partial: true,
        background: {
          color: '#FFFFFF',
          // backgroundImage:
          //   "url('https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/core/rect.png')",
        },
        grid: true,
        edgeTextDraggable: true,
        edgeType: 'polyline',
        // 全局自定义id
        edgeGenerator: (sourceNode, targetNode, currentEdge) => {
          console.log('edgeGenerator currentEdge', currentEdge)
          // 起始节点类型 rect 时使用 自定义的边 custom-edge
          if (sourceNode.type === 'rect') return 'bezier'
          if (currentEdge) return currentEdge.type
          return 'polyline'
        },
        idGenerator(type) {
          return type + '_' + Math.random()
        },
        themeMode: 'retro',
        plugins: [
          Control,
          DndPanel,
          DynamicGroup,
          SelectionSelect,
          Menu,
          MiniMap,
        ],
      })
      lf.setPatternItems([
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
        {
          type: 'dynamic-group',
          label: '内置动态分组',
          text: 'DynamicGroup',
          icon: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/examples/extension/group/group.png',
        },
      ])
      // lf.setTheme(customTheme)
      // 注册节点 or 边
      registerElements(lf)
      // 注册事件
      registerEvents(lf)

      register(
        {
          type: 'custom-react-node',
          component: NodeComponent,
        },
        lf,
      )

      lf.render(data)
      // lf.render(customData)

      lfRef.current = lf
      lfRef.current.extension.miniMap?.show()
      ;(window as any).lf = lf
    }
  }, [])
  const handleRandomEdgeOffset = () => {
    if (lfRef.current) {
      const { edges } = lfRef.current.getGraphData() as GraphData
      forEach(edges, (edge) => {
        if (edge.type !== 'polyline') return
        const offset = Math.random() * 100
        console.log('handleRandomEdgeOffset offset', offset)
        lfRef.current?.setProperties(edge.id, {
          offset,
        })
      })
    }
  }
  const setArrow = (arrowName: string) => {
    const lf = lfRef.current
    if (lf) {
      const { edges } = lf.getSelectElements()
      edges.forEach(({ id, properties }) => {
        console.log(4444, properties)
        lf.setProperties(id, {
          arrowType: arrowName,
        })
      })
    }
  }
  const handleRandomEdgeRadius = () => {
    if (lfRef.current) {
      const { edges } = lfRef.current.getGraphData() as GraphData
      forEach(edges, (edge) => {
        if (edge.type !== 'polyline') return
        const radius = Math.random() * 100
        console.log('handleRandomEdgeRadius radius', radius)
        lfRef.current?.setProperties(edge.id, {
          radius,
        })
      })
    }
  }
  const focusOn = () => {
    lfRef?.current?.focusOn({
      id: 'custom-node-1',
    })
  }

  const handleChangeNodeType = () => {
    const lf = lfRef.current
    if (lf) {
      const { nodes } = lf.getSelectElements()
      nodes.forEach(({ id, type }) => {
        lf.setNodeType(id, type === 'rect' ? 'star' : 'rect')
      })
    }
  }
  const handleChangeSize = () => {
    const lf = lfRef.current
    if (lf) {
      if (lf.graphModel.isContainerHeight || lf.graphModel.isContainerWidth) {
        console.log('resize by width,height')
        lf.resize(300, 100)
      } else {
        console.log('resize by container')
        lf.resize()
      }
      console.log(
        'current is container',
        lf.graphModel.isContainerHeight,
        lf.graphModel.isContainerWidth,
      )
      console.log('current option size', lf.options.width, lf.options.height)
      console.log(
        'current griphModel size',
        lf.graphModel.width,
        lf.graphModel.height,
      )
    }
  }
  const handleChangeEditConfig = () => {
    const isSilentMode = lfRef.current?.options.isSilentMode
    lfRef?.current?.updateEditConfig({
      isSilentMode: !isSilentMode,
    })
  }

  const handleCancelEdit = () =>
    lfRef?.current?.graphModel.textEditElement?.setElementState(
      ElementState.DEFAULT,
    )

  const handleChangeId = () => {
    const lf = lfRef.current
    if (lf) {
      const { edges } = lf.getSelectElements()
      edges.forEach(({ id }) => {
        lf.setEdgeId(id, 'newId')
      })
    }
  }

  // overlapMode 测试逻辑
  const setOverlapMode = (mode: OverlapMode) => {
    const lf = lfRef.current
    if (!lf) return
    lf.setOverlapMode(mode)
    const order = lf.graphModel.sortElements.map((m) => m.id)
    console.log('[overlapMode]', mode, '排序结果:', order)
  }
  const setOverlapModeStatic = () => setOverlapMode(OverlapMode.STATIC)
  const setOverlapModeDefault = () => setOverlapMode(OverlapMode.DEFAULT)
  const setOverlapModeIncrease = () => setOverlapMode(OverlapMode.INCREASE)
  const setOverlapModeEdgeTop = () => setOverlapMode(OverlapMode.EDGE_TOP)

  const addOverlapNode = () => {
    const lf = lfRef.current
    if (!lf) return
    lf.addNode({
      id: 'overlap-node',
      text: 'overlap-node',
      type: 'rect',
      x: 400,
      y: 150,
      properties: { width: 60, height: 60 },
    })
  }
  const deleteOverlapNode = () => {
    lfRef.current?.deleteNode('overlap-node')
  }
  const selectFirstEdge = () => {
    const lf = lfRef.current
    if (!lf) return
    const data = lf.getGraphData() as GraphData
    const edgeId = data.edges?.[0]?.id
    if (edgeId) {
      lf.selectElementById(edgeId)
      lf.toFront(edgeId)
      console.log('选中并置顶首条边:', edgeId)
    }
  }
  const selectOverlapNode = () => {
    const lf = lfRef.current
    if (!lf) return
    const id = 'overlap-node'
    lf.selectElementById(id)
    lf.toFront(id)
    console.log('选中并置顶重叠节点:', id)
  }
  const clearSelection = () => {
    lfRef.current?.clearSelectElements()
  }

  // 其他演示用处理函数
  const handleActiveElements = () => {
    const lf = lfRef.current
    if (!lf) return
    const { nodes, edges } = lf.getSelectElements()
    nodes.forEach(({ id }) => {
      lf.setProperties(id, { isHovered: true })
    })
    edges.forEach(({ id }) => {
      lf.setProperties(id, { isHovered: true })
    })
  }

  const handleTurnAnimationOn = () => {
    const lf = lfRef.current
    if (!lf) return
    const { edges } = lf.getGraphData() as GraphData
    forEach(edges, (edge) => {
      if ((edge as any).id) lf.openEdgeAnimation((edge as any).id)
    })
  }

  const handleTurnAnimationOff = () => {
    const lf = lfRef.current
    if (!lf) return
    const { edges } = lf.getGraphData() as GraphData
    forEach(edges, (edge) => {
      if ((edge as any).id) lf.closeEdgeAnimation((edge as any).id)
    })
  }

  const handleDragItem = (cfg: OnDragNodeConfig) => {
    const lf = lfRef.current
    if (!lf) return
    lf.dnd?.startDrag(cfg)
  }

  const handleRefreshGraph = () => {
    const lf = lfRef.current
    if (!lf) return
    const raw = lf.getGraphRawData?.()
    console.log('当前原始数据:', raw || lf.getGraphData())
  }

  const handleChangeColor = () => {
    const lf = lfRef.current
    if (!lf) return
    const { edges } = lf.getSelectElements()
    edges.forEach(({ id }) => {
      lf.setProperties(id, { style: { stroke: '#ff4d4f' } })
    })
  }

  const changeNodeBorderColor = () => {
    const lf = lfRef.current
    if (!lf) return
    const { nodes } = lf.getSelectElements()
    nodes.forEach(({ id }) => {
      lf.setProperties(id, { style: { stroke: '#ff4d4f' } })
    })
  }

  return (
    <Card title="Graph">
      <Flex wrap="wrap" gap="small">
        {/* overlapMode 测试控制 */}
        <Button
          key="overlap-static"
          type="primary"
          onClick={setOverlapModeStatic}
        >
          静态堆叠模式
        </Button>
        <Button
          key="overlap-default"
          type="primary"
          onClick={setOverlapModeDefault}
        >
          默认堆叠模式
        </Button>
        <Button
          key="overlap-increase"
          type="primary"
          onClick={setOverlapModeIncrease}
        >
          递增堆叠模式
        </Button>
        <Button
          key="overlap-edge-top"
          type="primary"
          onClick={setOverlapModeEdgeTop}
        >
          边置顶模式
        </Button>
        <Button
          key="print-sort"
          type="primary"
          onClick={() => {
            const lf = lfRef.current
            if (!lf) return
            const order = lf.graphModel.sortElements.map((m) =>
              m.modelType === ModelType.EDGE ? 'edge' : 'node',
            )
            console.log('当前渲染排序:', order)
          }}
        >
          打印渲染排序
        </Button>
        <Button key="add-overlap-node" type="primary" onClick={addOverlapNode}>
          添加重叠节点
        </Button>
        <Button
          key="delete-overlap-node"
          type="primary"
          onClick={deleteOverlapNode}
        >
          删除重叠节点
        </Button>
        <Button
          key="select-first-edge"
          type="primary"
          onClick={selectFirstEdge}
        >
          选中并置顶首条边
        </Button>
        <Button
          key="select-overlap-node"
          type="primary"
          onClick={selectOverlapNode}
        >
          选中并置顶重叠节点
        </Button>
        <Button key="clear-selection" type="primary" onClick={clearSelection}>
          取消选中
        </Button>
      </Flex>
      <Divider orientation="left" orientationMargin="5" plain></Divider>
      <Flex wrap="wrap" gap="small">
        <Button key="arrow1" type="primary" onClick={() => setArrow('half')}>
          箭头 1
        </Button>
        <Button key="arrow2" type="primary" onClick={() => setArrow('empty')}>
          箭头 2
        </Button>
        <Button key="focusOn" type="primary" onClick={focusOn}>
          定位到五角星
        </Button>
        <Button
          key="undo"
          type="primary"
          onClick={() => lfRef?.current?.undo()}
        >
          上一步
        </Button>
        <Button
          key="redo"
          type="primary"
          onClick={() => lfRef?.current?.redo()}
        >
          下一步
        </Button>
        <Button
          key="clearData"
          type="primary"
          onClick={() => lfRef?.current?.clearData()}
        >
          清空数据
        </Button>
        <Button key="changeType" type="primary" onClick={handleChangeNodeType}>
          切换节点为五角星
        </Button>

        <Button
          key="changeConfig"
          type="primary"
          onClick={handleChangeEditConfig}
        >
          修改配置
        </Button>
        <Button key="cancelEdit" type="primary" onClick={handleCancelEdit}>
          取消编辑
        </Button>
        <Button key="changeEdgeId" type="primary" onClick={handleChangeId}>
          修改边 ID
        </Button>
        <Button
          key="changeEdgeColor"
          type="primary"
          onClick={handleChangeColor}
        >
          修改边 颜色
        </Button>
        <Button
          key="changeNodeBorderColor"
          type="primary"
          onClick={changeNodeBorderColor}
        >
          修改选中节点边框颜色
        </Button>
      </Flex>
      <Divider orientation="left" orientationMargin="5" plain></Divider>
      <Flex wrap="wrap" gap="small">
        <Button
          key="getData"
          type="primary"
          onClick={() => console.log(lfRef?.current?.getGraphData())}
        >
          获取数据
        </Button>
        <Button
          key="getRefreshData"
          type="primary"
          onClick={handleRefreshGraph}
        >
          属性流程图节点 ID
        </Button>
        <Button
          key="setProperties"
          type="primary"
          onClick={handleActiveElements}
        >
          设置属性
        </Button>
        <Button
          key="setZoom"
          type="primary"
          onClick={() => lfRef.current?.zoom(0.6, [400, 400])}
        >
          设置大小
        </Button>
        <Button
          key="selectElement"
          type="primary"
          onClick={() => lfRef.current?.selectElementById('custom-node-1')}
        >
          选中指定节点
        </Button>
        <Button key="triggerLine" type="primary">
          触发边
        </Button>
        <Button
          key="translateCenter"
          type="primary"
          onClick={() => lfRef.current?.translateCenter()}
        >
          居中
        </Button>
        <Button
          key="fitView"
          type="primary"
          onClick={() => lfRef.current?.fitView()}
        >
          适应屏幕
        </Button>
        <Button key="getNodeEdges" type="primary" onClick={() => {}}>
          获取节点所有的边
        </Button>
        <Button
          key="openEdgeAnimation"
          type="primary"
          onClick={handleTurnAnimationOn}
        >
          开启边动画
        </Button>
        <Button
          key="randomEdgeOffset"
          type="primary"
          onClick={handleRandomEdgeOffset}
        >
          随机修改折线边offset
        </Button>
        <Button
          key="randomEdgeRadius"
          type="primary"
          onClick={handleRandomEdgeRadius}
        >
          随机修改折线边radius
        </Button>
        <Button
          key="closeEdgeAnimation"
          type="primary"
          onClick={handleTurnAnimationOff}
        >
          关闭边动画
        </Button>
        <Button key="showCanvas" type="primary">
          显示流程图
        </Button>
        <Button
          key="deleteNode"
          type="primary"
          onClick={() => lfRef.current?.deleteNode('custom-node-1')}
        >
          删除节点
        </Button>
        <Button
          key="allowResize"
          type="primary"
          onClick={() => {
            if (lfRef.current) {
              const graphData = lfRef.current?.getEditConfig()
              const { allowResize } = graphData
              lfRef.current.updateEditConfig({
                allowResize: !allowResize,
              })
            }
          }}
        >
          切换allowResize
        </Button>
        <Button key="resizeGraph" type="primary" onClick={handleChangeSize}>
          更新画布大小
        </Button>
        <Button
          key="resizeGraph"
          type="primary"
          onClick={() => {
            if (lfRef.current) {
              const graphData = lfRef.current?.getEditConfig()
              const { snapGrid } = graphData
              lfRef.current.updateEditConfig({
                snapGrid: !snapGrid,
              })
            }
          }}
        >
          修改网格对齐状态
        </Button>
        <Button
          key="resizeGraph"
          type="primary"
          onClick={() => {
            if (lfRef.current) {
              const theme = lfRef.current?.graphModel.themeMode
              lfRef.current.setTheme(
                {},
                theme === 'default' ? 'retro' : 'default',
              )
            }
          }}
        >
          主题切换
        </Button>
      </Flex>
      <Divider orientation="left" orientationMargin="5" plain>
        节点面板
      </Divider>
      <Flex wrap="wrap" gap="small" justify="center" align="center">
        <div
          className="dnd-item wrapper"
          onMouseDown={() =>
            handleDragItem({
              type: 'rect',
              text: 'rect',
            })
          }
        >
          rect
        </div>
        <div
          className="dnd-item wrapper"
          onMouseDown={() => {
            handleDragItem({
              type: 'circle',
              text: 'circle',
            })
          }}
        >
          circle
        </div>
        <div
          className="dnd-item wrapper"
          onMouseDown={() => {
            handleDragItem({
              type: 'diamond',
              text: 'diamond',
            })
          }}
        >
          diamond
        </div>
        <div
          className="dnd-item wrapper"
          onMouseDown={() => {
            handleDragItem({
              type: 'ellipse',
              text: 'ellipse',
              properties: {
                rx: 40,
                ry: 80,
              },
            })
          }}
        >
          ellipse
        </div>
        <div
          className="dnd-item wrapper"
          onMouseDown={() => {
            handleDragItem({
              type: 'html',
              text: 'html',
            })
          }}
        >
          html
        </div>
        <div
          className="dnd-item wrapper"
          onMouseDown={() => {
            handleDragItem({
              type: 'polygon',
              text: 'polygon',
              properties: {
                width: 110,
                height: 100,
                style: {
                  fill: '#ffd591',
                  stroke: '#ffa940',
                  strokeWidth: 2,
                  fillRule: 'evenodd',
                },
              },
            })
          }}
        >
          polygon
        </div>
        <div
          className="dnd-item text"
          onMouseDown={() => {
            handleDragItem({
              type: 'text',
              text: '文本',
            })
          }}
        >
          文本
        </div>
      </Flex>
      <Divider />
      <div ref={containerRef} id="graph" className={styles.viewport}></div>
      <Drawer
        title="Basic Drawer"
        closable={{ 'aria-label': 'Close Button' }}
        onClose={onClose}
        open={open}
      >
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </Drawer>
    </Card>
  )
}
