import { forEach, map } from 'lodash-es'
import LogicFlow, {
  ElementState,
  OverlapMode,
  ModelType,
} from '@logicflow/core'
import '@logicflow/core/es/index.css'

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

const config: Partial<LogicFlow.Options> = {
  isSilentMode: false,
  // stopScrollGraph: true,
  // stopZoomGraph: true,
  // textDraggable: true, // TODO: 节点旋转状态下，拖动文本移动是有问题的！！！
  edgeTextDraggable: true,
  style: {
    rect: {
      rx: 5,
      ry: 5,
      strokeWidth: 2,
    },
    circle: {
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
    // 下面的 style 移动到此处，不然会覆盖上面设置的各图形的主题样式
    inputText: {
      background: 'black',
      color: 'white',
    },
  },
}

const customTheme: Partial<LogicFlow.Theme> = {
  baseNode: {
    stroke: '#4E93F5',
  },
  nodeText: {
    overflowMode: 'ellipsis',
    lineHeight: 1.5,
    fontSize: 13,
  },
  edgeText: {
    overflowMode: 'ellipsis',
    lineHeight: 1.5,
    fontSize: 13,
    textWidth: 100,
  }, // 确认 textWidth 是否必传 ❓
  polyline: {
    stroke: 'red',
  },
  rect: {
    width: 200,
    height: 40,
  },
  arrow: {
    offset: 4, // 箭头长度
    verticalLength: 2, // 箭头垂直于边的距离
  },
}
const data = {
  nodes: [
    {
      id: 'custom-node-1',
      // rotate: 1.1722738811284763,
      text: {
        x: 600,
        y: 200,
        value: 'node-1',
      },
      type: 'rect',
      x: 600,
      y: 200,

      properties: {
        width: 80,
        height: 120,
        radius: 20,
      },
    },
    {
      id: 'custom-node-2',
      text: 'node-2',
      type: 'polygon',
      x: 90,
      y: 94,
    },
    {
      id: 'custom-node-3',
      text: 'node-3',
      type: 'centerAnchorRect',
      x: 360,
      y: 280,
    },
  ],
  edges: [
    {
      id: 'bezier-1',
      type: 'bezier',
      sourceNodeId: 'custom-node-1',
      targetNodeId: 'custom-node-2',
      properties: {
        style: {
          stroke: 'red',
        },
      },
    },
    {
      id: 'bezier-2',
      type: 'bezier',
      sourceNodeId: 'custom-node-2',
      targetNodeId: 'custom-node-3',
      properties: {
        style: {
          stroke: 'blue',
        },
      },
    },
  ],
}

// const customData = {
//   nodes: [
//     {
//       id: 'custom-circle',
//       text: 'custom-circle',
//       type: 'customCircle',
//       x: 100,
//       y: 100,
//     },
//     {
//       id: 'custom-rect',
//       text: 'custom-rect',
//       type: 'customRect',
//       x: 300,
//       y: 100,
//     },
//     {
//       id: 'custom-ellipse',
//       text: 'custom-ellipse',
//       type: 'customEllipse',
//       x: 500,
//       y: 100,
//     },
//     {
//       id: 'custom-diamond',
//       text: 'custom-diamond',
//       type: 'customDiamond',
//       x: 700,
//       y: 100,
//     },
//     {
//       id: 'custom-polygon',
//       text: 'custom-polygon',
//       type: 'customPolygon',
//       x: 100,
//       y: 300,
//     },
//   ]
// }

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
      setOpen(true)
    })
  }

  useEffect(() => {
    if (!lfRef.current) {
      const lf = new LogicFlow({
        ...config,
        container: containerRef.current as HTMLElement,
        // hideAnchors: true,
        width: 800,
        height: 400,
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
          // shortcuts: [
          //   {
          //     keys: ["backspace"],
          //     callback: () => {
          //       const r = window.confirm("确定要删除吗？");
          //       if (r) {
          //         const elements = lf.getSelectElements(true);
          //         lf.clearSelectElements();
          //         elements.edges.forEach((edge) => lf.deleteEdge(edge.id));
          //         elements.nodes.forEach((node) => lf.deleteNode(node.id));
          //         const graphData = lf.getGraphData()
          //         console.log(42, graphData, graphData.nodes.length)
          //       }
          //       // console.log(1)
          //     }
          //   }
          // ]
        },
        partial: true,
        background: {
          color: '#FFFFFF',
          // backgroundImage:
          //   "url('https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/core/rect.png')",
        },
        // grid: true,
        grid: {
          size: 60,
        },
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
      })

      lf.setTheme(customTheme)
      // 注册节点 or 边
      registerElements(lf)
      // 注册事件
      registerEvents(lf)

      lf.render(data)
      // lf.render(customData)

      lfRef.current = lf
      ;(window as any).lf = lf
    }
  }, [])

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
