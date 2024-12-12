import LogicFlow from '@logicflow/core'
import { NodeSelection } from '@logicflow/extension'

import { Card, Button } from 'antd'
import { useEffect, useRef } from 'react'
import styles from './index.less'

import '@logicflow/core/es/index.css'
import '@logicflow/extension/es/index.css'

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
  multipleSelectKey: 'shift',
  disabledTools: ['multipleSelect'],
  allowResize: true,
}

const data = {
  nodes: [
    {
      id: '1',
      type: 'rect',
      x: 300,
      y: 200,
      text: 'rect1',
    },
    {
      id: '2',
      type: 'rect',
      x: 700,
      y: 200,
      text: 'rect2',
    },
    {
      id: '3',
      type: 'rect',
      x: 700,
      y: 500,
      text: 'rect3',
    },
    {
      id: '4',
      type: 'rect',
      x: 300,
      y: 500,
      text: 'rect4',
    },
    {
      id: '5',
      type: 'rect',
      x: 500,
      y: 350,
      text: 'rect5',
    },
    {
      id: '6',
      type: 'node-selection',
      x: 0,
      y: 0,
      properties: {
        node_selection_ids: ['2', '3'],
        labelText: '方案1',
        strokeColor: 'blue',
        disabledDelete: false,
      },
    },
  ],
}

export default function MenuExtension() {
  const lfRef = useRef<LogicFlow>()
  const containerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!lfRef.current) {
      const lf = new LogicFlow({
        ...config,
        container: containerRef.current as HTMLElement,
        grid: {
          size: 10,
        },
        plugins: [NodeSelection],
      })

      lf.render(data)
      lfRef.current = lf
    }
  }, [])

  return (
    <Card title="LogicFlow Extension - NodeSelection">
      <div>按住shift，点击多个节点</div>
      <Button
        type="primary"
        className={styles.btn}
        onClick={() => {
          if (lfRef.current) {
            const graphData = lfRef.current?.getGraphRawData()
            console.log('graphData --->>>', graphData)
          }
        }}
      >
        获取当前图数据
      </Button>
      <div ref={containerRef} id="graph" className={styles.viewport}></div>
    </Card>
  )
}
