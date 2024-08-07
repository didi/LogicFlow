import { Card, Divider } from 'antd'
import LogicFlow from '@logicflow/core'
import { useEffect, useRef } from 'react'
import { InsertNodeInPolyline, DndPanel } from '@logicflow/extension'
import NotAllowConnectRect from './NotAllowConnectRect'

import './index.less'
import '@logicflow/core/es/index.css'
import '@logicflow/extension/es/index.css'

import data from './data'

const config: Partial<LogicFlow.Options> = {
  grid: {
    type: 'dot',
    size: 20,
  },
}

export default function HighLightExtension() {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    LogicFlow.use(InsertNodeInPolyline)
    LogicFlow.use(DndPanel)
    const lf: LogicFlow = new LogicFlow({
      container: containerRef.current!,
      ...config,
    })
    lf.register(NotAllowConnectRect as any)
    lf.on('connection:not-allowed', ({ msg }) => {
      console.error('connection:not-allowed的原因是', msg)
    })
    ;(lf.extension.dndPanel as any).setPatternItems([
      {
        type: 'circle',
        label: '圆形',
        className: 'circle',
      },
      {
        type: 'rect',
        label: '矩形',
        className: 'rect',
      },
      {
        type: 'not-allow-connect',
        label: '不允许插入',
        className: 'circle',
      },
    ])
    lf.render(data)
  }, [])
  return (
    <Card
      title="LogicFlow Extension - InsertNodeInPolyline"
      className="insert-node-in-polyline"
    >
      <p>边上插入节点，拖动节点到边中间，自动成为边中间的点。</p>
      <Divider />
      <div id="graph" ref={containerRef} />
    </Card>
  )
}
