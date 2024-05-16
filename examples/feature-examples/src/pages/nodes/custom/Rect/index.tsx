import CustomRect from '@/components/nodes/custom-rect'
import LogicFlow from '@logicflow/core'
import { Card } from 'antd'
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

// const data = {
//   nodes: [
//     {
//       id: '10',
//       type: 'rect',
//       x: 150,
//       y: 70,
//       text: '矩形',
//     },
//     {
//       id: '20',
//       type: 'rect',
//       x: 350,
//       y: 70,
//       text: '矩形',
//     },
//   ],
// }

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

      lf.register(CustomRect)
      lf.render({})

      // row 1
      lf.addNode({
        id: '10',
        type: 'customRect',
        x: 150,
        y: 70,
        text: '矩形',
      })

      lf.addNode({
        id: '11',
        type: 'customRect',
        x: 350,
        y: 70,
        text: '矩形',
        properties: {
          style: {
            fill: '#efdbff',
            stroke: '#9254de',
          },
        },
      })

      lf.addNode({
        id: '12',
        type: 'customRect',
        x: 550,
        y: 70,
        text: '矩形',
        properties: {
          radius: 8,
          style: {
            fill: '#f8cecc',
            stroke: '#b85450',
          },
        },
      })

      lf.addNode({
        id: '13',
        type: 'customRect',
        x: 730,
        y: 70,
        text: '矩形',
        properties: {
          width: 60,
          height: 60,
          radius: 20,
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
        type: 'customRect',
        x: 150,
        y: 200,
        text: '矩形',
        properties: {
          refX: -25,
          refY: -20,
        },
      })

      lf.addNode({
        id: '21',
        type: 'customRect',
        x: 350,
        y: 200,
        text: '矩形',
        properties: {
          refX: -25,
          style: {
            fill: '#efdbff',
            stroke: '#9254de',
          },
        },
      })

      lf.addNode({
        id: '22',
        type: 'customRect',
        x: 550,
        y: 200,
        text: '矩形',
        properties: {
          radius: 8,
          refX: -25,
          refY: 20,
          style: {
            fill: '#f8cecc',
            stroke: '#b85450',
          },
        },
      })

      lf.addNode({
        id: '23',
        type: 'customRect',
        x: 730,
        y: 200,
        text: '矩形',
        properties: {
          width: 60,
          height: 60,
          radius: 20,
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
        type: 'customRect',
        x: 150,
        y: 330,
        text: '矩形',
        properties: {
          refY: -20,
        },
      })

      lf.addNode({
        id: '31',
        type: 'customRect',
        x: 350,
        y: 330,
        text: '矩形',
        properties: {
          style: {
            fill: '#efdbff',
            stroke: '#9254de',
          },
        },
      })

      lf.addNode({
        id: '32',
        type: 'customRect',
        x: 550,
        y: 330,
        text: '矩形',
        properties: {
          radius: 8,
          refY: 20,
          style: {
            fill: '#f8cecc',
            stroke: '#b85450',
          },
        },
      })

      lf.addNode({
        id: '33',
        type: 'customRect',
        x: 730,
        y: 330,
        text: '矩形',
        properties: {
          width: 60,
          height: 60,
          radius: 20,
          refX: 48,
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
        type: 'customRect',
        x: 150,
        y: 460,
        text: '矩形',
        properties: {
          refX: 20,
          refY: -20,
        },
      })

      lf.addNode({
        id: '41',
        type: 'customRect',
        x: 350,
        y: 460,
        text: '矩形',
        properties: {
          refX: 20,
          style: {
            fill: '#efdbff',
            stroke: '#9254de',
          },
        },
      })

      lf.addNode({
        id: '42',
        type: 'customRect',
        x: 550,
        y: 460,
        text: '矩形',
        properties: {
          radius: 8,
          refX: 20,
          refY: 20,
          style: {
            fill: '#f8cecc',
            stroke: '#b85450',
          },
        },
      })

      lf.addNode({
        id: '43',
        type: 'customRect',
        x: 730,
        y: 460,
        text: '矩形',
        properties: {
          width: 60,
          height: 60,
          radius: 20,
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
    <Card title="自定义矩形节点">
      <div ref={containerRef} id="graph" className={styles.viewport}></div>
    </Card>
  )
}
