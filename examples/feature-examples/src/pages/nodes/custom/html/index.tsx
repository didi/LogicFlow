import { CustomHtml } from '@/components/nodes/custom-html'
import LogicFlow from '@logicflow/core'
import '@logicflow/core/es/index.css'

import { Card } from 'antd'
import { useEffect, useRef } from 'react'
import data from './data'
import styles from './index.less'
import './style.css'

const config: Partial<LogicFlow.Options> = {
  isSilentMode: false,
  stopScrollGraph: true,
  stopZoomGraph: true,
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

      lf.register(CustomHtml)

      lf.render(data)
      lf.on('custom:button-click', (model: any) => {
        lf.setProperties(model.id, {
          body: 'LogicFlow',
        })
      })
      lfRef.current = lf
    }
  }, [])

  return (
    <Card title="自定义 HTML 节点">
      <div ref={containerRef} id="graph" className={styles.viewport}></div>
    </Card>
  )
}
