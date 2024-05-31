import LogicFlow from '@logicflow/core'
import '@logicflow/core/es/index.css'

import { Card } from 'antd'
import { useEffect, useRef } from 'react'
import styles from './index.less'
import theme from './theme'

const config: Partial<LogicFlow.Options> = {
  isSilentMode: false,
  stopScrollGraph: true,
  stopZoomGraph: true,
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
    // TODO: 解决线段中间弯折问题
    {
      sourceNodeId: '1',
      targetNodeId: '3',
      startPoint: {
        x: 150,
        y: 60,
      },
      endPoint: {
        x: 550,
        y: 50,
      },
      text: '333',
      type: 'polyline',
    },
    {
      sourceNodeId: '3',
      targetNodeId: '4',
      type: 'line',
    },
    {
      sourceNodeId: '3',
      targetNodeId: '5',
      type: 'bezier',
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
        grid: {
          size: 10,
        },
      })
      lf.setTheme(theme)
      lf.render(data)
      lfRef.current = lf
    }
  }, [])

  return (
    <Card title="内置基础节点">
      <div ref={containerRef} id="graph" className={styles.viewport}></div>
    </Card>
  )
}
