import LogicFlow from '@logicflow/core'
import '@logicflow/core/es/index.css'
import CloudImageNode from './Cloud'

import { Card } from 'antd'
import { useEffect, useRef } from 'react'
import styles from './index.less'

const config: Partial<LogicFlow.Options> = {
  isSilentMode: false,
  stopScrollGraph: true,
  stopZoomGraph: true,
}

const data = {
  nodes: [
    {
      id: '1',
      type: 'imageCloud',
      x: 150,
      y: 100,
      text: '心形 ❤️',
      properties: {
        width: 80,
        height: 60,
        style: {
          fill: '#d75a4a',
          stroke: '#9254de',
        },
      },
    },
    {
      id: '2',
      type: 'imageCloud',
      x: 350,
      y: 100,
      text: '星星 ✨',
      properties: {
        width: 80,
        height: 60,
        style: {
          fill: '#ed8a19',
          stroke: '#9254de',
        },
      },
    },
    {
      id: '3',
      type: 'imageCloud',
      x: 550,
      y: 100,
      text: '音符 🎵',
      properties: {
        width: 80,
        height: 60,
        style: {
          fill: '#eb2f96',
          stroke: '#9254de',
        },
      },
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

      lf.register(CloudImageNode)

      lf.render(data)
      lfRef.current = lf
    }
  }, [])

  return (
    <Card title="自定义 Image 节点">
      <div ref={containerRef} id="graph" className={styles.viewport}></div>
    </Card>
  )
}
