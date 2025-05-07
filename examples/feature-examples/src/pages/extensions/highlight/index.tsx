import { Card, Divider, Radio, Tag } from 'antd'
import LogicFlow from '@logicflow/core'
import { useEffect, useRef, useState } from 'react'
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
}

export default function HighLightExtension() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [highlightMode, setHighlightMode] = useState('path')
  const lfRef = useRef<LogicFlow | null>(null)

  useEffect(() => {
    const lf: LogicFlow = new LogicFlow({
      container: containerRef.current!,
      ...config,
      pluginsOptions: {
        highlight: {
          mode: highlightMode,
        },
      },
    })
    lfRef.current = lf
    lfRef.current.render(data)
    lfRef.current.translateCenter()
    lfRef.current.on('highlight:single', ({ model }) => {
      console.log('highlight:single', model)
    })
    lfRef.current.on('highlight:neighbours', ({ data, relateElements }) => {
      console.log('highlight:neighbours', data, relateElements)
    })
    lfRef.current.on('highlight:path', ({ data, relateElements }) => {
      console.log('highlight:path', data, relateElements)
    })
  }, [])
  useEffect(() => {
    ;(lfRef.current?.extension.highlight as Highlight)?.setMode(
      highlightMode as any,
    )
  }, [highlightMode])
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
      <Radio.Group
        value={highlightMode}
        onChange={(e) => {
          setHighlightMode(e.target.value)
        }}
        style={{ marginBottom: 16 }}
      >
        <Radio.Button value="path">全路径高亮</Radio.Button>
        <Radio.Button value="single">单元素高亮</Radio.Button>
        <Radio.Button value="neighbour">相邻元素高亮</Radio.Button>
      </Radio.Group>
      <Divider />
      <div ref={containerRef} id="graph"></div>
    </Card>
  )
}
