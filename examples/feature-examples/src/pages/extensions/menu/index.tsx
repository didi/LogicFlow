import LogicFlow from '@logicflow/core'
import { Menu } from '@logicflow/extension'

import { Card } from 'antd'
import { useEffect, useRef } from 'react'
import styles from './index.less'

import '@logicflow/core/es/index.css'
// import '@logicflow/extension/es/index.css'

import EdgeData = LogicFlow.EdgeData
import NodeData = LogicFlow.NodeData

const config: Partial<LogicFlow.Options> = {
  isSilentMode: false,
  stopScrollGraph: true,
  stopZoomGraph: true,
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
  },
}

const data = {
  nodes: [
    {
      id: '1',
      type: 'rect',
      x: 150,
      y: 100,
      text: '矩形',
    },
    {
      id: '2',
      type: 'circle',
      x: 350,
      y: 100,
      text: '圆形',
    },
    {
      id: '3',
      type: 'ellipse',
      x: 550,
      y: 100,
      text: '椭圆',
    },
    {
      id: '4',
      type: 'polygon',
      x: 150,
      y: 250,
      text: '多边形',
    },
    {
      id: '5',
      type: 'diamond',
      x: 350,
      y: 250,
      text: '菱形',
    },
    {
      id: '6',
      type: 'text',
      x: 550,
      y: 250,
      text: '纯文本节点',
    },
    {
      id: '7',
      type: 'html',
      x: 150,
      y: 400,
      text: 'html节点',
    },
  ],
  edges: [
    {
      // type: 'polyline',
      sourceNodeId: '1',
      targetNodeId: '2',
    },
  ],
}

export default function MenuExtension() {
  const lfRef = useRef<LogicFlow>()
  const containerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    console.log('Menu --->>>', Menu)

    if (!lfRef.current) {
      const lf = new LogicFlow({
        ...config,
        container: containerRef.current as HTMLElement,
        // container: document.querySelector('#graph') as HTMLElement,
        grid: {
          size: 10,
        },
        plugins: [Menu],
      })

      lf.addMenuConfig({
        nodeMenu: [
          {
            text: '分享',
            callback() {
              alert('分享成功！')
            },
          },
          {
            text: '属性',
            callback(node: NodeData) {
              alert(`
                节点id：${node.id}
                节点类型：${node.type}
                节点坐标：(x: ${node.x}, y: ${node.y})
              `)
            },
          },
        ],
        edgeMenu: [
          {
            text: '属性',
            callback(edge: EdgeData) {
              const {
                id,
                type,
                startPoint,
                endPoint,
                sourceNodeId,
                targetNodeId,
              } = edge
              alert(`
                边id：${id}
                边类型：${type}
                边起点坐标：(startPoint: [${startPoint.x}, ${startPoint.y}])
                边终点坐标：(endPoint: [${endPoint.x}, ${endPoint.y}])
                源节点id：${sourceNodeId}
                目标节点id：${targetNodeId}
              `)
            },
          },
        ],
        graphMenu: [
          {
            text: '分享',
            callback() {
              alert('分享成功！')
            },
          },
          {
            text: '添加节点',
            callback(data: LogicFlow.Position) {
              lf.addNode({
                type: 'rect',
                x: data.x,
                y: data.y,
              })
            },
          },
        ],
      })

      lf.render(data)
      lfRef.current = lf
    }
  }, [])

  return (
    <Card title="LogicFlow Extension - Menu">
      <div ref={containerRef} id="graph" className={styles.viewport}></div>
    </Card>
  )
}
