import { useEffect, useRef } from 'react'
import { Card, Divider, message } from 'antd'
import LogicFlow from '@logicflow/core'
import { DndPanel } from '@logicflow/extension'

import './index.less'
import '@logicflow/core/es/index.css'
import '@logicflow/extension/es/index.css'
import Start from './Start'
import UserTask from './UserTask'
import data from './data'
import { circle as circleSvgUrl, rect as rectSvgUrl } from './svg'

const config: Partial<LogicFlow.Options> = {
  grid: {
    type: 'dot',
    size: 20,
  },
}

export default function HighLightExtension() {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    LogicFlow.use(DndPanel)
    const lf: LogicFlow = new LogicFlow({
      container: containerRef.current!,
      ...config,
    })
    lf.register(Start)
    lf.register(UserTask)
    lf.render(data)
    lf.on('connection:not-allowed', ({ msg }) => {
      message.error(msg)
    })
    ;(lf.extension.dndPanel as any).setPatternItems([
      {
        type: 'start',
        text: '开始',
        label: '开始',
        icon: circleSvgUrl,
      },
      {
        type: 'user-task',
        text: '用户节点',
        label: '用户节点',
        icon: rectSvgUrl,
      },
    ])
  }, [])
  return (
    <Card title="LogicFlow Extension - Rules" className="rules-graph">
      <p>可对节点配置规则，如开始节点不允许作为边的终点。</p>
      <Divider />
      <div id="graph" ref={containerRef} />
    </Card>
  )
}
