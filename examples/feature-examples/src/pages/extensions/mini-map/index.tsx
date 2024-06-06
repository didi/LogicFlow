import LogicFlow from '@logicflow/core'
import { Control, MiniMap } from '@logicflow/extension'

import { Button, Card, Flex, Divider } from 'antd'
import { useState, useEffect, useRef } from 'react'
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
}

const nodes: LogicFlow.NodeConfig[] = []
const edges: LogicFlow.EdgeConfig[] = []

for (let i = 0; i < 200; i++) {
  const nodeStartId = `${i * 2 + 1}`
  const nodeEndId = `${i * 2 + 2}`
  const nodeStart: LogicFlow.NodeConfig = {
    id: nodeStartId,
    type: 'rect',
    x: 400 * (i % 10) - 200,
    y: 100 * Math.floor(i / 10) - 500,
    text: `${i}-start`,
  }
  const nodeEnd: LogicFlow.NodeConfig = {
    id: nodeEndId,
    type: 'rect',
    x: 400 * (i % 10),
    y: 100 * Math.floor(i / 10) - 500,
    text: `${i}-end`,
  }
  const edge: LogicFlow.EdgeConfig = {
    id: `e_${i}`,
    type: 'polyline',
    sourceNodeId: nodeStartId,
    targetNodeId: nodeEndId,
  }
  nodes.push(nodeStart)
  nodes.push(nodeEnd)
  edges.push(edge)
}

const data: LogicFlow.GraphConfigData = {
  nodes,
  edges,
}

export default function MiniMapExtension() {
  const lfRef = useRef<LogicFlow>()
  const containerRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!lfRef.current) {
      const lf = new LogicFlow({
        ...config,
        container: containerRef.current as HTMLElement,
        grid: {
          size: 20,
        },
        plugins: [Control, MiniMap],
        pluginsOptions: {
          MiniMap: {
            isShowHeader: false,
            isShowCloseIcon: true,
            headerTitle: 'MiniMap',
            width: 200,
            height: 120,
          },
        },
      })

      lf.render(data)
      lfRef.current = lf
    }
  }, [])

  const toggleVisible = () => {
    if (lfRef.current) {
      const miniMap = lfRef.current.extension.miniMap as MiniMap
      if (visible) {
        miniMap.hide()
      } else {
        miniMap.show(0, 0)
      }
      setVisible(!visible)
    }
  }

  const handleReset = () => {
    if (lfRef.current) {
      ;(lfRef.current.extension.miniMap as MiniMap).reset()
    }
  }

  return (
    <Card title="LogicFlow Extension - MiniMap">
      <Flex wrap="wrap" gap="small">
        <Button onClick={toggleVisible}>
          {visible ? '隐藏' : '显示'}小地图
        </Button>
        {visible && <Button onClick={handleReset}>重置</Button>}
      </Flex>
      <Divider />
      <div ref={containerRef} id="graph" className={styles.viewport}></div>
    </Card>
  )
}
