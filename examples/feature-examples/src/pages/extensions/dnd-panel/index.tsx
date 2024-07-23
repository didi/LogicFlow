import LogicFlow from '@logicflow/core'
import { DndPanel } from '@logicflow/extension'

import { Card } from 'antd'
import { useEffect, useRef } from 'react'

import EndNode from './nodes/end'
import StartNode from './nodes/start'

import '@logicflow/core/es/index.css'
import '@logicflow/extension/es/index.css'
import styles from './index.less'

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

export default function DndPanelExtension() {
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
        plugins: [DndPanel],
      })

      lf.render({
        nodes: [],
        edges: [],
      })

      lf.register(StartNode)
      lf.register(EndNode)
      // lf.batchRegister([StartNode, EndNode])

      // lf.extension.dndPanel.setPatternItems([])
      lf.setPatternItems([
        {
          type: 'start',
          text: '开始',
          label: '开始节点',
          icon: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/core/start.png',
        },
        {
          type: 'rect',
          label: '系统任务',
          icon: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/core/rect.png',
          className: 'import_icon',
        },
        {
          type: 'diamond',
          label: '条件判断',
          icon: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/core/diamond.png',
        },
        {
          type: 'end',
          text: '结束',
          label: '结束节点',
          icon: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/core/end.png',
        },
      ])

      lfRef.current = lf
    }
  }, [])

  return (
    <Card title="LogicFlow Extension - DndPanel">
      <div ref={containerRef} id="graph" className={styles.viewport}></div>
    </Card>
  )
}
