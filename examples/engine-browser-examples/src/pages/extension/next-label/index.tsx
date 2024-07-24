import LogicFlow from '@logicflow/core'
import { NextLabel } from '@logicflow/extension'
import '@logicflow/core/es/index.css'
import '@logicflow/extension/es/index.css'

import { Card } from 'antd'
import { useEffect, useRef } from 'react'
import './index.less'

const config: Partial<LogicFlow.Options> = {
  allowResize: true,
  allowRotate: true,
  isSilentMode: false,
  stopScrollGraph: false,
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
      properties: {
        _label: [
          {
            x: 150,
            y: 100,
            value: '矩形 label1',
            content: '矩形 label1',
            draggable: true,
          },
          {
            x: 100,
            y: 50,
            value: '矩形 label2',
            content: '矩形 label2',
            draggable: true,
          },
        ],
        _labelOption: {
          isMultiple: true,
        },
      },
    },
    {
      id: '2',
      type: 'circle',
      x: 350,
      y: 100,
      properties: {},
      text: {
        x: 350,
        y: 100,
        value: '圆形',
      },
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
      sourceNodeId: '3',
      targetNodeId: '2',
      type: 'polyline',
      text: 'edge 1',
    },
  ],
}

export default function BasicNode() {
  const lfRef = useRef<LogicFlow>()
  const containerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!lfRef.current) {
      const lf = new LogicFlow({
        ...config,
        container: containerRef.current as HTMLElement,
        // container: document.querySelector('#graph') as HTMLElement,
        plugins: [NextLabel],
        grid: {
          size: 10,
        },
      })

      lf.render(data)
      lfRef.current = lf
    }
  }, [])

  return (
    <Card title="Next Label 插件">
      <div ref={containerRef} id="graph" className="viewport"></div>
    </Card>
  )
}
