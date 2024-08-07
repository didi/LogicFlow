import CustomEllipse from '@/components/nodes/custom-ellipse'
import LogicFlow from '@logicflow/core'
import { Button, Card } from 'antd'
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

      lf.register(CustomEllipse)
      lf.render({})

      // row 1
      lf.addNode({
        id: '10',
        type: 'customEllipse',
        x: 150,
        y: 70,
        text: 'ellipse',
        properties: {
          rx: 60,
          ry: 30,
        },
      })

      lf.addNode({
        id: '11',
        type: 'customEllipse',
        x: 350,
        y: 70,
        text: 'Ellipse',
        properties: {
          rx: 60,
          ry: 30,
          style: {
            fill: '#efdbff',
            stroke: '#9254de',
          },
        },
      })

      lf.addNode({
        id: '12',
        type: 'customEllipse',
        x: 550,
        y: 70,
        text: 'Ellipse',
        properties: {
          rx: 60,
          ry: 30,
          style: {
            fill: '#f8cecc',
            stroke: '#b85450',
          },
        },
      })

      lf.addNode({
        id: '13',
        type: 'customEllipse',
        x: 730,
        y: 70,
        text: 'Ellipse',
        properties: {
          rx: 30,
          ry: 30,
          style: {
            fill: '#ffe6cc',
            stroke: '#d79b00',
          },
          textStyle: {
            textAnchor: 'middle',
            dominantBaseline: 'middle',
          },
        },
      })

      // row 2
      lf.addNode({
        id: '20',
        type: 'customEllipse',
        x: 150,
        y: 200,
        text: 'Ellipse',
        properties: {
          rx: 60,
          ry: 30,
          refX: -25,
          refY: -10,
        },
      })

      lf.addNode({
        id: '21',
        type: 'customEllipse',
        x: 350,
        y: 200,
        text: 'Ellipse',
        properties: {
          rx: 60,
          ry: 30,
          refX: -25,
          style: {
            fill: '#efdbff',
            stroke: '#9254de',
          },
        },
      })

      lf.addNode({
        id: '22',
        type: 'customEllipse',
        x: 550,
        y: 200,
        text: 'Ellipse',
        properties: {
          rx: 60,
          ry: 30,
          refX: -25,
          refY: 10,
          style: {
            fill: '#f8cecc',
            stroke: '#b85450',
          },
        },
      })

      lf.addNode({
        id: '23',
        type: 'customEllipse',
        x: 730,
        y: 200,
        text: 'Ellipse',
        properties: {
          rx: 30,
          ry: 30,
          refY: -40,
          style: {
            fill: '#ffe6cc',
            stroke: '#d79b00',
          },
          textStyle: {
            textAnchor: 'middle',
            dominantBaseline: 'middle',
          },
        },
      })

      // row 3
      lf.addNode({
        id: '30',
        type: 'customEllipse',
        x: 150,
        y: 330,
        text: 'Ellipse',
        properties: {
          rx: 60,
          ry: 30,
          refY: -10,
        },
      })

      lf.addNode({
        id: '31',
        type: 'customEllipse',
        x: 350,
        y: 330,
        text: 'Ellipse',
        properties: {
          rx: 60,
          ry: 30,
          style: {
            fill: '#efdbff',
            stroke: '#9254de',
          },
        },
      })

      lf.addNode({
        id: '32',
        type: 'customEllipse',
        x: 550,
        y: 330,
        text: 'Ellipse',
        properties: {
          rx: 60,
          ry: 30,
          refY: 10,
          style: {
            fill: '#f8cecc',
            stroke: '#b85450',
          },
        },
      })

      lf.addNode({
        id: '33',
        type: 'customEllipse',
        x: 730,
        y: 330,
        text: 'Ellipse',
        properties: {
          rx: 30,
          ry: 30,
          refX: 50,
          style: {
            fill: '#ffe6cc',
            stroke: '#d79b00',
          },
          textStyle: {
            textAnchor: 'middle',
            dominantBaseline: 'middle',
          },
        },
      })

      // row 4
      lf.addNode({
        id: '40',
        type: 'customEllipse',
        x: 150,
        y: 460,
        text: 'Ellipse',
        properties: {
          rx: 60,
          ry: 30,
          refX: 25,
          refY: -10,
        },
      })

      lf.addNode({
        id: '41',
        type: 'customEllipse',
        x: 350,
        y: 460,
        text: 'Ellipse',
        properties: {
          rx: 60,
          ry: 30,
          refX: 25,
          style: {
            fill: '#efdbff',
            stroke: '#9254de',
          },
        },
      })

      lf.addNode({
        id: '42',
        type: 'customEllipse',
        x: 550,
        y: 460,
        text: 'Ellipse',
        properties: {
          rx: 60,
          ry: 30,
          refX: 25,
          refY: 10,
          style: {
            fill: '#f8cecc',
            stroke: '#b85450',
          },
        },
      })

      lf.addNode({
        id: '43',
        type: 'customEllipse',
        x: 730,
        y: 460,
        text: 'Ellipse',
        properties: {
          rx: 30,
          ry: 30,
          refY: 40,
          style: {
            fill: '#ffe6cc',
            stroke: '#d79b00',
          },
          textStyle: {
            textAnchor: 'middle',
            dominantBaseline: 'middle',
          },
        },
      })

      lfRef.current = lf
    }
  }, [])

  return (
    <Card title="自定义 Ellipse 节点">
      <Button
        onClick={() => {
          if (lfRef.current) {
            const graphData = lfRef.current?.getGraphData()
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
