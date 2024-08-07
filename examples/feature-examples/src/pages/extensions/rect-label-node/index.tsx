import { Card, Divider } from 'antd'
import LogicFlow from '@logicflow/core'
import { useEffect, useRef } from 'react'
import { RectLabelNode } from '@logicflow/extension'

import '@logicflow/core/es/index.css'
import '@logicflow/extension/es/index.css'

const config: Partial<LogicFlow.Options> = {
  stopScrollGraph: true,
  stopZoomGraph: true,
  edgeTextDraggable: true, // 允许边文本可拖拽
  nodeTextDraggable: true, // 允许节点文本可拖拽
  grid: {
    type: 'dot',
    size: 20,
  },
  plugins: [RectLabelNode],
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
    lf.render({
      nodes: [
        {
          id: 'rect-label-1',
          type: 'rect-label',
          x: 100,
          y: 100,
          text: 'rect-label',
          resizable: true,
          properties: {
            moreText: '测试文本：',
          },
        },
        {
          id: 'text-1',
          type: 'text',
          x: 150,
          y: 100,
          text: 'text',
        },
      ],
    })
    lf.translateCenter()
  }, [])
  return (
    <Card title="LogicFlow Extension - RectLabelNode" id="card">
      <p>带锚点的文本节点插件，可存在性存疑</p>
      <p></p>
      <Divider />
      <div ref={containerRef} id="graph"></div>
    </Card>
  )
}
