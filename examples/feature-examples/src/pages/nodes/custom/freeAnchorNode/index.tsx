import FreeAnchorRect from '@/components/nodes/freeAnchor-rect'
import FreeAnchorCircle from '@/components/nodes/freeAnchor-circle'
import LogicFlow from '@logicflow/core'
import { Card } from 'antd'
import { useEffect, useRef } from 'react'
import styles from './index.less'

import '@logicflow/core/es/index.css'

const config: Partial<LogicFlow.Options> = {
  isSilentMode: false,
  stopScrollGraph: true,
  stopZoomGraph: true,
  style: {
    rect: {
      width: 100,
      height: 50,
      rx: 2,
      ry: 2,
    },
  },
}

const data = {
  nodes: [
    {
      id: '10',
      type: 'freeAnchorNode',
      x: 150,
      y: 70,
      text: '矩形',
    },
    {
      id: '20',
      type: 'freeAnchorCircle',
      x: 350,
      y: 70,
      text: '圆形',
    },
  ],
}

export default function RectNode() {
  const lfRef = useRef<LogicFlow>()
  const containerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!lfRef.current && containerRef.current) {
      const lf = new LogicFlow({
        ...config,
        container: containerRef.current as HTMLElement,
        // container: document.querySelector('#graph') as HTMLElement,
        grid: {
          size: 10,
        },
      })

      lf.register(FreeAnchorRect)
      lf.register(FreeAnchorCircle)
      lf.render(data)

      lfRef.current = lf
    }
  }, [])

  return (
    <Card title="自定义矩形节点">
      <div ref={containerRef} id="graph" className={styles.viewport}></div>
    </Card>
  )
}
