import LogicFlow from '@logicflow/core'
import CustomPolyline from '@/components/edges/custom-polyline'
import { Button, Card, Select } from 'antd'
import { useEffect, useRef } from 'react'
import styles from './index.less'

import '@logicflow/core/es/index.css'

const config: Partial<LogicFlow.Options> = {
  isSilentMode: false,
  stopScrollGraph: true,
  stopZoomGraph: true,
}

export default function CustomPolylineEdge() {
  const lfRef = useRef<LogicFlow>()
  const containerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!lfRef.current && containerRef.current) {
      const lf = new LogicFlow({
        ...config,
        container: containerRef.current as HTMLElement,
        grid: {
          size: 20,
        },
      })

      lf.register(CustomPolyline)
      lf.setDefaultEdgeType('customPolyline')

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
            type: 'customPolyline',
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
            type: 'customPolyline',
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
            type: 'customPolyline',
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
            type: 'customPolyline',
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

  function setTextPosition(textPosition: string) {
    if (lfRef.current) {
      const { edges } = lfRef.current.getGraphRawData()
      edges.forEach((edge) => {
        const edgeModel =
          lfRef.current && lfRef.current.getEdgeModelById(edge.id)
        if (edgeModel) {
          edgeModel.setProperties({
            textPosition,
          })
          const textNewPosition = edgeModel.getTextPosition()
          edgeModel.text = {
            ...edgeModel.text,
            ...textNewPosition,
          }
        }
      })
    }
  }

  return (
    <Card title="自定义折线">
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
      <Button
        type="primary"
        className={styles.btn}
        onClick={() => {
          if (lfRef.current) {
            const { edges } = lfRef.current.getGraphRawData()
            edges.forEach((edge) => {
              const edgeModel =
                lfRef.current && lfRef.current.getEdgeModelById(edge.id)
              if (edgeModel) {
                edgeModel.setProperties({
                  edgeWeight: !edge.properties?.edgeWeight,
                })
              }
            })
          }
        }}
      >
        切换边粗细
      </Button>
      <Button
        type="primary"
        className={styles.btn}
        onClick={() => {
          if (lfRef.current) {
            const { edges } = lfRef.current.getGraphRawData()
            edges.forEach((edge) => {
              const edgeModel =
                lfRef.current && lfRef.current.getEdgeModelById(edge.id)
              if (edgeModel) {
                edgeModel.setProperties({
                  highlight: !edge.properties?.highlight,
                })
              }
            })
          }
        }}
      >
        切换边颜色
      </Button>
      <Button
        type="primary"
        className={styles.btn}
        onClick={() => {
          if (lfRef.current) {
            const { edges } = lfRef.current.getGraphRawData()
            edges.forEach((edge) => {
              const edgeModel =
                lfRef.current && lfRef.current.getEdgeModelById(edge.id)
              if (edgeModel) {
                edgeModel.setProperties({
                  openAnimation: !edge.properties?.openAnimation,
                })
              }
            })
          }
        }}
      >
        开关动画
      </Button>
      <Button
        key="resizeGraph"
        type="primary"
        onClick={() => {
          if (lfRef.current) {
            const graphData = lfRef.current?.getEditConfig()
            const { snapGrid } = graphData
            console.log('snapGrid --->>>', snapGrid)
            lfRef.current.updateEditConfig({
              snapGrid: !snapGrid,
            })
            console.log('snapGrid after --->>>', lfRef.current)
          }
        }}
      >
        修改网格对齐状态
      </Button>
      <Select
        placeholder="修改边文本位置"
        className={styles.select}
        onChange={(val) => {
          setTextPosition(val)
        }}
        defaultValue="center"
      >
        <Select.Option value="center">默认文本位置</Select.Option>
        <Select.Option value="start">文本位置在边的起点处</Select.Option>
        <Select.Option value="end">文本位置在边的终点处</Select.Option>
      </Select>
      <Select
        placeholder="修改边锚点形状"
        className={styles.select}
        onChange={(val) => {
          if (lfRef.current) {
            const { edges } = lfRef.current.getGraphRawData()
            edges.forEach((edge) => {
              const edgeModel =
                lfRef.current && lfRef.current.getEdgeModelById(edge.id)
              if (edgeModel) {
                edgeModel.setProperties({
                  arrowType: val,
                })
              }
            })
          }
        }}
        defaultValue=""
      >
        <Select.Option value="empty">空心箭头</Select.Option>
        <Select.Option value="half">半箭头</Select.Option>
        <Select.Option value="">默认箭头</Select.Option>
      </Select>
      <div ref={containerRef} id="graph" className={styles.viewport}></div>
    </Card>
  )
}
