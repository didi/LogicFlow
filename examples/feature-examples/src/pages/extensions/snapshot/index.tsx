import LogicFlow from '@logicflow/core'
import { Snapshot } from '@logicflow/extension'

import { Button, Card, Col, Divider, Flex, Row, Space } from 'antd'
import { useEffect, useRef, useState } from 'react'
import styles from './index.less'

import '@logicflow/core/es/index.css'
import '@logicflow/extension/es/index.css'
import ImageNode from './ImageNode'

const config: Partial<LogicFlow.Options> = {
  isSilentMode: false,
  stopScrollGraph: false,
  stopZoomGraph: false,
  stopMoveGraph: true,
  style: {
    rect: {
      rx: 5,
      ry: 5,
      strokeWidth: 2,
    },
    circle: {
      fill: '#f5f5f5',
      stroke: '#666',
    },
    ellipse: {
      fill: '#dae8fc',
      stroke: '#6c8ebf',
    },
    polygon: {
      fill: '#d5e8d4',
      stroke: '#82b366',
    },
    diamond: {
      fill: '#ffe6cc',
      stroke: '#d79b00',
    },
    text: {
      color: '#b85450',
      fontSize: 12,
    },
  },
}

const data = {
  nodes: [
    {
      id: '1',
      type: 'rect',
      x: 150,
      y: 100,
      text: '矩形',
    },
    {
      id: '2',
      type: 'circle',
      x: 350,
      y: 100,
      text: '圆形',
    },
    {
      id: '3',
      type: 'image',
      x: 550,
      y: 100,
      text: '云',
    },
    {
      id: '4',
      type: 'polygon',
      x: 150,
      y: 250,
      text: '多边形',
    },
    {
      id: '5',
      type: 'image',
      x: 350,
      y: 250,
      text: '菱形',
    },
    {
      id: '6',
      type: 'text',
      x: 550,
      y: 250,
      text: '纯文本节点',
    },
    {
      id: '7',
      type: 'html',
      x: 150,
      y: 400,
      text: 'html节点',
    },
  ],
  edges: [
    {
      id: 'e_1',
      type: 'polyline',
      sourceNodeId: '1',
      targetNodeId: '2',
    },
    {
      id: 'e_2',
      type: 'polyline',
      sourceNodeId: '2',
      targetNodeId: '3',
    },
    {
      id: 'e_3',
      type: 'polyline',
      sourceNodeId: '4',
      targetNodeId: '5',
    },
  ],
}

/**
 * 框选插件 Snapshot 示例
 */
export default function SnapshotExample() {
  const lfRef = useRef<LogicFlow>()
  const containerRef = useRef<HTMLDivElement>(null)
  const [blobData, setBlobData] = useState('')
  const [base64Data, setBase64Data] = useState('')

  // 初始化 LogicFlow
  useEffect(() => {
    if (!lfRef.current) {
      const lf = new LogicFlow({
        ...config,
        container: containerRef.current!,
        grid: {
          size: 20,
        },
        plugins: [Snapshot as any],
      })
      lf.register(ImageNode)

      lf.on(
        'selection:selected-area',
        ({ topLeft, bottomRight }: Record<string, LogicFlow.PointTuple>) => {
          console.log('get selection area:', topLeft, bottomRight)
        },
      )
      lf.render(data)
      lfRef.current = lf
    }
  }, [])

  const handleGetSnapshot = () => {
    if (lfRef.current) {
      lfRef.current.getSnapshot()
    }
  }

  const handlePreviewSnapshotBlob = () => {
    if (lfRef.current) {
      setBase64Data('')
      lfRef.current
        .getSnapshotBlob('#FFFFFF')
        .then(
          ({
            data,
            width,
            height,
          }: {
            data: Blob
            width: number
            height: number
          }) => {
            setBlobData(window.URL.createObjectURL(data))
            console.log('width, height ', width, height)
          },
        )
    }
  }

  const handlePreviewSnapshotBase64 = () => {
    if (lfRef.current) {
      setBlobData('')
      lfRef.current
        .getSnapshotBase64('#FFFFFF')
        .then(
          ({
            data,
            width,
            height,
          }: {
            data: string
            width: number
            height: number
          }) => {
            setBase64Data(data)
            console.log('width, height ', width, height)
          },
        )
    }
  }

  return (
    <Card title="LogicFlow Extension - Snapshot">
      <Flex wrap="wrap" gap="middle" align="center" justify="space-between">
        <Space>
          <Button onClick={handleGetSnapshot}>下载快照</Button>
          <Button onClick={handlePreviewSnapshotBlob}>预览(blob)</Button>
          <Button onClick={handlePreviewSnapshotBase64}>预览(base64)</Button>
        </Space>
      </Flex>
      <Divider />
      <Row>
        <Col span={12}>
          <div ref={containerRef} id="graph" className={styles.viewport}></div>
        </Col>
        <Col span={12}>
          {blobData && (
            <>
              <h2>blobData</h2>
              <img key="blob" src={blobData} className="preview" />
            </>
          )}
          {base64Data && (
            <>
              <h2>base64Data</h2>
              <img key="base64" src={base64Data} className="preview" />
            </>
          )}
        </Col>
      </Row>
    </Card>
  )
}
