import LogicFlow from '@logicflow/core'
import CustomCurvedEdge from '@/components/edges/custom-curved-polyline'
import { Button, Card } from 'antd'
import { useEffect, useRef } from 'react'
import styles from './index.less'

import '@logicflow/core/es/index.css'

const config: Partial<LogicFlow.Options> = {
  isSilentMode: false,
  stopScrollGraph: true,
  stopZoomGraph: true,
}

export default function CustomCurvedPolylineEdge() {
  const lfRef = useRef<LogicFlow>()
  const containerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!lfRef.current && containerRef.current) {
      const lf = new LogicFlow({
        ...config,
        container: containerRef.current as HTMLElement,
        grid: {
          size: 10,
        },
      })

      lf.register(CustomCurvedEdge)
      lf.setDefaultEdgeType('customCurvedEdge')

      lf.render({
        nodes: [
          {
            id: '1',
            type: 'rect',
            x: 150,
            y: 320,
            properties: {},
          },
          {
            id: '2',
            type: 'rect',
            x: 630,
            y: 320,
            properties: {},
          },
        ],
        edges: [
          {
            id: '1-2',
            type: 'customCurvedEdge',
            sourceNodeId: '1',
            targetNodeId: '2',
            startPoint: {
              x: 200,
              y: 320,
            },
            endPoint: {
              x: 580,
              y: 320,
            },
            properties: {
              textPosition: 'center',
            },
            text: {
              x: 390,
              y: 320,
              value: '边文本3',
            },
            pointsList: [
              {
                x: 200,
                y: 320,
              },
              {
                x: 580,
                y: 320,
              },
            ],
          },
          {
            id: '5b8fb346-eb4e-4627-abfa-463251db21bd',
            type: 'customCurvedEdge',
            sourceNodeId: '1',
            targetNodeId: '2',
            startPoint: {
              x: 150,
              y: 280,
            },
            endPoint: {
              x: 630,
              y: 280,
            },
            properties: {
              textPosition: 'center',
            },
            text: {
              x: 390,
              y: 197,
              value: '边文本2',
            },
            pointsList: [
              {
                x: 150,
                y: 280,
              },
              {
                x: 150,
                y: 197,
              },
              {
                x: 630,
                y: 197,
              },
              {
                x: 630,
                y: 280,
              },
            ],
          },
          {
            id: 'a9df1609-2511-4ffd-8caa-fdb9b76be358',
            type: 'customCurvedEdge',
            sourceNodeId: '2',
            targetNodeId: '1',
            startPoint: {
              x: 630,
              y: 360,
            },
            endPoint: {
              x: 150,
              y: 360,
            },
            properties: {
              textPosition: 'center',
            },
            text: {
              x: 390,
              y: 458,
              value: '边文本4',
            },
            pointsList: [
              {
                x: 630,
                y: 360,
              },
              {
                x: 630,
                y: 458,
              },
              {
                x: 150,
                y: 458,
              },
              {
                x: 150,
                y: 360,
              },
            ],
          },
          {
            id: '9033c248-f068-4a02-a0a2-d0a6f82321f5',
            type: 'customCurvedEdge',
            sourceNodeId: '1',
            targetNodeId: '2',
            startPoint: {
              x: 100,
              y: 320,
            },
            endPoint: {
              x: 680,
              y: 320,
            },
            properties: {
              textPosition: 'center',
            },
            text: {
              x: 390,
              y: 114,
              value: '边文本1',
            },
            pointsList: [
              {
                x: 100,
                y: 320,
              },
              {
                x: 70,
                y: 320,
              },
              {
                x: 70,
                y: 114,
              },
              {
                x: 760,
                y: 114,
              },
              {
                x: 760,
                y: 320,
              },
              {
                x: 680,
                y: 320,
              },
            ],
          },
        ],
      })

      lfRef.current = lf
    }
  }, [])

  return (
    <Card title="自定义圆角折线">
      <Button
        type="primary"
        className={styles.btn}
        onClick={() => {
          if (lfRef.current) {
            const graphData = lfRef.current?.getGraphRawData()
            console.log('graphData --->>>', graphData)
          }
        }}
      >
        获取当前图数据
      </Button>
      <div ref={containerRef} id="graph" className={styles.viewport}></div>
    </Card>
  )
}
