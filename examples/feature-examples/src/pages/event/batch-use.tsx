import { FC, useEffect, useRef, useState } from 'react'
import { Card, Button, Divider, message } from 'antd'
import '@logicflow/core/es/index.css'
import LogicFlow from '@logicflow/core'
import styles from './batch-use.less'

const Example: FC = () => {
  const [haRegist, setHaRegist] = useState(false)
  const refContainer = useRef<HTMLDivElement>(null)
  const lf = useRef<LogicFlow>()
  const [messageApi, contextHolder] = message.useMessage()

  useEffect(() => {
    const container = refContainer.current
    if (!container) {
      return
    }

    const instance = new LogicFlow({
      container,
    })

    instance.render({
      nodes: [
        {
          type: 'rect',
          x: 100,
          y: 100,
          text: '节点1',
          properties: {
            name: '矩形',
          },
        },
        {
          type: 'rect',
          x: 300,
          y: 100,
          text: '节点2',
          properties: {
            name: '矩形',
          },
        },
      ],
    })

    lf.current = instance
    return () => {
      instance.destroy()
    }
  }, [])

  const off = useRef(() => {})

  const registerEvent = () => {
    if (!lf.current) {
      return
    }
    off.current = lf.current.graphModel.eventCenter
      .on('node:click', () => {
        messageApi.info('node click')
      })
      .on('node:mouseenter', () => {
        messageApi.success('node mouseenter')
      })
      .on('node:mouseleave', () => {
        messageApi.warning('node mouseleave')
      })
  }

  const offEvent = () => {
    off.current()
  }

  const toggleEvent = () => {
    setHaRegist(!haRegist)
    if (haRegist) {
      offEvent()
    } else {
      registerEvent()
    }
  }
  return (
    <Card title="批量注册事件">
      {contextHolder}
      <div>
        <Button onClick={toggleEvent}>
          {haRegist ? '批量清除' : '批量注册'}
        </Button>
      </div>
      <Divider />
      <div ref={refContainer} className={styles.viewport}></div>
    </Card>
  )
}

export default Example
