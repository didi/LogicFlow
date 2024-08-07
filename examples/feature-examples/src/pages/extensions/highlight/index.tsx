import { Card, Divider, Tag } from 'antd'
import LogicFlow from '@logicflow/core'
import { useEffect, useRef } from 'react'
import { Highlight } from '@logicflow/extension'

import './index.less'
import '@logicflow/core/es/index.css'
import '@logicflow/extension/es/index.css'

import data from './data'

const config: Partial<LogicFlow.Options> = {
  stopScrollGraph: true,
  stopZoomGraph: true,
  edgeTextDraggable: true, // 允许边文本可拖拽
  nodeTextDraggable: true, // 允许节点文本可拖拽
  grid: {
    type: 'dot',
    size: 20,
  },
  plugins: [Highlight],
  snapline: true, // 是否开启辅助对齐线
  pluginsOptions: {
    highlight: {
      mode: 'neighbour',
    },
  },
}

export default function HighLightExtension() {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const lf: LogicFlow = new LogicFlow({
      container: containerRef.current!,
      ...config,
    })

    lf.render(data)
    lf.translateCenter()
  }, [])
  return (
    <Card title="LogicFlow Extension - Highlight" id="card">
      <p>
        鼠标{' '}
        <Tag color="processing" bordered={false}>
          hover
        </Tag>{' '}
        到节点或边上会高亮与这个节点或边相关的节点和边
      </p>
      <p>节点：高亮这个节点前后相关的所有边和节点</p>
      <p>边：高亮这个边指向的节点前后相关的所有边和节点</p>
      <Divider />
      <div ref={containerRef} id="graph"></div>
    </Card>
  )
}
