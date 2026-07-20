import LogicFlow from '@logicflow/core'
import { CurvedEdge, CurvedEdgeModel } from '@logicflow/extension'
import { Alert, Button, Card, Descriptions, Space, Tag } from 'antd'
import { useEffect, useRef, useState } from 'react'
import styles from './index.less'

import '@logicflow/core/es/index.css'

const EDGE_TYPE = 'invalid-path-curved-edge'
const SINGLE_EDGE_ID = 'single-point-edge'
const INVALID_EDGE_ID = 'non-finite-edge'
const NORMAL_EDGE_ID = 'normal-edge'

const invalidPathCurvedEdge = {
  type: EDGE_TYPE,
  view: CurvedEdge,
  model: CurvedEdgeModel,
}

const createGraphData = () => ({
  nodes: [
    {
      id: 'source',
      type: 'rect',
      x: 180,
      y: 160,
      text: '起点 (180, 160)',
      properties: {
        style: { fill: '#e6f4ff', stroke: '#1677ff' },
      },
    },
    {
      id: 'target',
      type: 'rect',
      x: 680,
      y: 420,
      text: '终点 (680, 420)',
      properties: {
        style: { fill: '#f6ffed', stroke: '#52c41a' },
      },
    },
  ],
  edges: [
    {
      id: NORMAL_EDGE_ID,
      type: EDGE_TYPE,
      sourceNodeId: 'source',
      targetNodeId: 'target',
      pointsList: [
        { x: 230, y: 160 },
        { x: 430, y: 160 },
        { x: 430, y: 420 },
        { x: 630, y: 420 },
      ],
      properties: {
        style: { stroke: '#52c41a', strokeWidth: 3 },
      },
    },
    {
      id: SINGLE_EDGE_ID,
      type: EDGE_TYPE,
      sourceNodeId: 'source',
      targetNodeId: 'target',
      pointsList: [{ x: 430, y: 290 }],
    },
    {
      id: INVALID_EDGE_ID,
      type: EDGE_TYPE,
      sourceNodeId: 'source',
      targetNodeId: 'target',
      pointsList: [
        { x: 180, y: 200 },
        { x: Number.NaN, y: 380 },
        { x: 680, y: 380 },
      ],
    },
  ],
})

type Snapshot = Record<'single' | 'invalid' | 'normal', string>

const emptySnapshot: Snapshot = {
  single: '',
  invalid: '',
  normal: '',
}

const readSnapshot = (lf: LogicFlow): Snapshot => ({
  single: lf.getEdgeModelById(SINGLE_EDGE_ID)?.points || '',
  invalid: lf.getEdgeModelById(INVALID_EDGE_ID)?.points || '',
  normal: lf.getEdgeModelById(NORMAL_EDGE_ID)?.points || '',
})

export default function InvalidCurvedEdge() {
  const lfRef = useRef<LogicFlow>()
  const containerRef = useRef<HTMLDivElement>(null)
  const [snapshot, setSnapshot] = useState<Snapshot>(emptySnapshot)

  const renderGraph = (lf: LogicFlow) => {
    lf.render(createGraphData())
    setSnapshot(readSnapshot(lf))
  }

  useEffect(() => {
    if (!containerRef.current || lfRef.current) return

    const lf = new LogicFlow({
      container: containerRef.current,
      width: 900,
      height: 560,
      grid: { size: 10, visible: true },
      stopScrollGraph: true,
      stopZoomGraph: true,
    })
    lf.register(invalidPathCurvedEdge)
    lfRef.current = lf
    renderGraph(lf)

    return () => {
      lf.destroy()
      lfRef.current = undefined
    }
  }, [])

  return (
    <Card title="圆角折线异常路径隔离">
      <Space direction="vertical" size="middle" className={styles.content}>
        <Alert
          type="info"
          showIcon
          message="同一张图中同时加载正常、单点和非有限路径"
          description="控制台应出现两条告警；绿色圆角折线和两个节点继续显示。单点边没有可见线段，含非有限坐标的边被跳过。起点和终点的 x、y 均不相同，可拖动节点确认正常边仍会更新。"
        />

        <Space wrap>
          <Button
            type="primary"
            onClick={() => lfRef.current && renderGraph(lfRef.current)}
          >
            重新加载异常数据
          </Button>
          <Tag color="success">正常边：可见</Tag>
          <Tag color="warning">单点边：不可见</Tag>
          <Tag color="error">非有限边：跳过</Tag>
        </Space>

        <div className={styles.viewport} ref={containerRef} />

        <Descriptions bordered size="small" column={1}>
          <Descriptions.Item label="正常边 points">
            <code>{snapshot.normal}</code>
          </Descriptions.Item>
          <Descriptions.Item label="单点边 points">
            <code>{snapshot.single}</code>
          </Descriptions.Item>
          <Descriptions.Item label="非有限边 points">
            <code>{snapshot.invalid}</code>
            <span className={styles.hint}>
              lf.render 的 JSON 标准化会先把 NaN 转成 null
            </span>
          </Descriptions.Item>
        </Descriptions>
      </Space>
    </Card>
  )
}
