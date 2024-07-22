import { forEach } from 'lodash-es'
import LogicFlow, { ElementState, LogicFlowUtil } from '@logicflow/core'
import { SelectionSelect, RichTextEditor, Label } from '@logicflow/extension'
import '@logicflow/core/es/index.css'
import '@logicflow/extension/es/index.css'
import { Button, Card, Divider, Flex } from 'antd'
import { useEffect, useRef } from 'react'

import GraphData = LogicFlow.GraphData
import './index.less'

import OnDragNodeConfig = LogicFlow.OnDragNodeConfig

const config: Partial<LogicFlow.Options> = {
  isSilentMode: false,
  stopScrollGraph: true,
  stopZoomGraph: true,
  stopMoveGraph: false,
  allowResize: true,
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
    inputText: {
      background: 'black',
      color: 'white',
    },
  },
  plugins: [SelectionSelect, RichTextEditor, Label],
  pluginsOptions: {
    Label: {
      nodeLabelVerticle: true,
      edgeLabelVerticle: true,
    },
    RichTextEditor: {
      enable: true,
      editorConfig: {
        toolbar: {
          buttons: [
            'colorpicker',
            'italic',
            'underline',
            'strikethrough',
            'quote',
            'justifyLeft',
            'justifyCenter',
            'justifyRight',
            'justifyFull',
            'superscript',
            'subscript',
            'orderedlist',
            'unorderedlist',
            'pre',
            'removeFormat',
            'outdent',
            'indent',
            'h2',
            'h3',
          ],
        },
      },
      inputs: ['.lf-text-input', '.lf-label-editor'],
    },
  },
}

const customTheme: Partial<LogicFlow.Theme> = {
  baseNode: {
    stroke: '#4E93F5',
  },
  // nodeText 样式设置
  nodeText: {
    overflowMode: 'ellipsis',
    lineHeight: 1,
    fontSize: 13,
    textWidth: 60,
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
      type: 'rect',
      // rotate: 1.1722738811284763,
      text: {
        x: 600,
        y: 200,
        value: 'node-1',
      },
      properties: {
        _textMode: 'text',
      },
      x: 600,
      y: 200,
    },
    {
      id: 'custom-node-2',
      type: 'rect',
      x: 600,
      y: 300,
      properties: {
        _textMode: 'label',
      },
      text: 'custom-node-2',
    },
    {
      id: 'custom-node-3',
      type: 'circle',
      properties: {
        _labelOptions: {
          multiple: true,
        },
        _label: [
          {
            value: '333331',
            x: 800,
            y: 50,
          },
          {
            value: '333332',
            x: 800,
            y: 150,
          },
        ],
      },
      x: 800,
      y: 100,
    },
    {
      id: 'custom-node-4',
      type: 'rect',
      x: 800,
      y: 300,
    },
    {
      id: 'custom-node-5',
      type: 'rect',
      x: 1000,
      y: 200,
      properties: {
        width: 80,
        height: 120,
      },
    },
  ],
  edges: [
    {
      sourceNodeId: 'custom-node-2',
      targetNodeId: 'custom-node-3',
      type: 'bezier',
      text: 'bezier',
      properties: {
        _textMode: 'text',
      },
    },
    {
      sourceNodeId: 'custom-node-3',
      targetNodeId: 'custom-node-5',
      type: 'bezier',
      label: ['label1', 'label2'],
      properties: {
        _textMode: 'label',
        _labelOptions: {
          multiple: true,
        },
      },
    },
    {
      sourceNodeId: 'custom-node-3',
      targetNodeId: 'custom-node-1',
      type: 'polyline',
      properties: {
        _textMode: 'label',
        _label: [
          'polyline3',
          'polyline4',
          // {
          //   value: 'polyline3',
          //   draggable: true,
          //   editable: false,
          //   x: 620,
          //   y: 90,
          // },
          // {
          //   value: 'polyline4',
          //   x: 520,
          //   y: 90,
          // },
          // {
          //   value: 'polyline5',
          //   x: 620,
          //   y: 50,
          // },
        ],
        _labelOptions: {
          multiple: true,
          max: 3,
        },
      },
    },
  ],
}

export default function BasicNode() {
  const lfRef = useRef<LogicFlow>()
  const containerRef = useRef<HTMLDivElement>(null)
  const registerEvents = (lf: LogicFlow) => {
    lf.on('history:change', () => {
      const data = lf.getGraphData()
      console.log('history:change', data)
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
        // allowResize: true,
        edgeTextEdit: true,
        nodeLabelVerticle: false,
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
        },
        grid: true,
        // grid: {
        //   size: 1,
        // },
        edgeTextDraggable: true,
        edgeType: 'bezier',
        // 全局自定义id
        // edgeGenerator: (sourceNode, targetNode, currentEdge) => {
        //   // 起始节点类型 rect 时使用 自定义的边 custom-edge
        //   if (sourceNode.type === 'rect') return 'bezier'
        //   if (currentEdge) return currentEdge.type
        //   return 'polyline'
        // },
        idGenerator(type) {
          return type + '_' + Math.random()
        },
      })

      lf.setTheme(customTheme)
      // 注册事件
      registerEvents(lf)
      lf.render(data)
      lfRef.current = lf
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

  const handleRefreshGraph = () => {
    const lf = lfRef.current
    if (lf) {
      const data = lf.getGraphRawData()
      console.log('current graph data', data)
      const refreshData = LogicFlowUtil.refreshGraphId(data)
      console.log('after refresh graphId', data)
      lf.render(refreshData)
    }
  }

  const handleActiveElements = () => {
    const lf = lfRef.current
    if (lf) {
      const { nodes, edges } = lf.getSelectElements()
      nodes.forEach(({ id }) => {
        lf.setProperties(id, {
          isHovered: true,
        })
      })
      edges.forEach(({ id }) => {
        lf.setProperties(id, {
          isHovered: true,
        })
      })
    }
  }

  const handleTurnAnimationOn = () => {
    if (lfRef.current) {
      const { edges } = lfRef.current.getGraphData() as GraphData
      forEach(edges, (edge) => {
        lfRef.current?.openEdgeAnimation(edge.id)
      })
    }
  }
  const handleTurnAnimationOff = () => {
    if (lfRef.current) {
      const { edges } = lfRef.current.getGraphData() as GraphData
      forEach(edges, (edge) => {
        lfRef.current?.closeEdgeAnimation(edge.id)
      })
    }
  }

  const handleDragItem = (node: OnDragNodeConfig) => {
    lfRef?.current?.dnd.startDrag(node)
  }

  return (
    <Card title="Graph" className="graph-container">
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
      <div ref={containerRef} id="graph" className="viewport"></div>
    </Card>
  )
}
