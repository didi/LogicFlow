import LogicFlow, { PolylineEdgeModel } from '@logicflow/core'
import { Alert, Button, Card, Space, Tag, Typography } from 'antd'
import { useEffect, useRef, useState } from 'react'
import styles from './index.less'

import '@logicflow/core/es/index.css'

const EDGE_ID = 'rounded-rect-nan-edge'

const SOURCE = {
  id: 'source',
  x: 190,
  y: 420,
  width: 120,
  height: 80,
}

const TARGET = {
  id: 'target',
  x: 650,
  y: 220,
  width: 220,
  height: 160,
  radius: 24,
}

const targetLeft = TARGET.x - TARGET.width / 2
const targetTop = TARGET.y - TARGET.height / 2
const topLeftRadiusCenter = {
  x: targetLeft + TARGET.radius,
  y: targetTop + TARGET.radius,
}

// 终点是一个合法的圆弧交点，用来跳过第一次人工拖拽才能制造的前置状态。
const initialArcY = targetTop + 8
const initialArcX =
  topLeftRadiusCenter.x -
  Math.sqrt(TARGET.radius ** 2 - (initialArcY - topLeftRadiusCenter.y) ** 2)

const terminalSegmentStart = { x: 420, y: initialArcY }
const invalidBandTop = targetTop + TARGET.radius * 2
const invalidBandBottom = TARGET.y + TARGET.height / 2 - TARGET.radius * 2

type Snapshot = {
  points: string
  pointsList: LogicFlow.Point[]
  radicand: number | null
  hasAdjusted: boolean
  hasNaN: boolean
}

const emptySnapshot: Snapshot = {
  points: '',
  pointsList: [],
  radicand: null,
  hasAdjusted: false,
  hasNaN: false,
}

const createReproData = () => ({
  nodes: [
    {
      id: SOURCE.id,
      type: 'rect',
      x: SOURCE.x,
      y: SOURCE.y,
      text: '起点',
      properties: {
        width: SOURCE.width,
        height: SOURCE.height,
        style: {
          radius: 0,
          fill: '#e6f4ff',
          stroke: '#1677ff',
        },
      },
    },
    {
      id: TARGET.id,
      type: 'rect',
      x: TARGET.x,
      y: TARGET.y,
      text: `目标圆角矩形\nr = ${TARGET.radius}`,
      properties: {
        width: TARGET.width,
        height: TARGET.height,
        style: {
          radius: TARGET.radius,
          fill: '#f6ffed',
          stroke: '#52c41a',
          strokeWidth: 3,
        },
      },
    },
  ],
  edges: [
    {
      id: EDGE_ID,
      type: 'polyline',
      sourceNodeId: SOURCE.id,
      targetNodeId: TARGET.id,
      sourceAnchorId: `${SOURCE.id}_1`,
      targetAnchorId: `${TARGET.id}_3`,
      startPoint: {
        x: SOURCE.x + SOURCE.width / 2,
        y: SOURCE.y,
      },
      endPoint: {
        x: initialArcX,
        y: initialArcY,
      },
      pointsList: [
        {
          x: SOURCE.x + SOURCE.width / 2,
          y: SOURCE.y,
        },
        {
          x: terminalSegmentStart.x,
          y: SOURCE.y,
        },
        terminalSegmentStart,
        {
          x: initialArcX,
          y: initialArcY,
        },
      ],
      properties: {
        style: {
          stroke: '#1677ff',
          strokeWidth: 3,
        },
      },
    },
  ],
})

const getSnapshot = (lf: LogicFlow): Snapshot => {
  const edgeModel = lf.getEdgeModelById(EDGE_ID) as
    | PolylineEdgeModel
    | undefined
  const pointsList = (edgeModel?.pointsList || []).map(({ x, y }) => ({ x, y }))
  const endPoint = pointsList[pointsList.length - 1]
  let radicand: number | null = null

  if (endPoint && Number.isFinite(endPoint.y)) {
    const cornerCenterY =
      endPoint.y <= TARGET.y
        ? targetTop + TARGET.radius
        : TARGET.y + TARGET.height / 2 - TARGET.radius
    radicand = TARGET.radius ** 2 - (endPoint.y - cornerCenterY) ** 2
  }

  return {
    points: edgeModel?.points || '',
    pointsList,
    radicand,
    hasAdjusted:
      !!endPoint && (endPoint.x !== initialArcX || endPoint.y !== initialArcY),
    hasNaN:
      (edgeModel?.points || '').includes('NaN') ||
      pointsList.some(({ x, y }) => Number.isNaN(x) || Number.isNaN(y)),
  }
}

const formatNumber = (value: number) => {
  if (Number.isNaN(value)) return 'NaN'
  if (!Number.isFinite(value)) return String(value)
  return Number.isInteger(value) ? String(value) : value.toFixed(2)
}

const formatPointsList = (pointsList: LogicFlow.Point[]) =>
  pointsList
    .map(
      ({ x, y }, index) => `${index}: (${formatNumber(x)}, ${formatNumber(y)})`,
    )
    .join('  →  ')

export default function RoundedRectNaNReproduction() {
  const lfRef = useRef<LogicFlow>()
  const containerRef = useRef<HTMLDivElement>(null)
  const [snapshot, setSnapshot] = useState<Snapshot>(emptySnapshot)

  const renderRepro = (lf: LogicFlow) => {
    lf.render(createReproData())
    lf.selectElementById(EDGE_ID)
    setSnapshot(getSnapshot(lf))
  }

  useEffect(() => {
    if (!containerRef.current || lfRef.current) return

    const lf = new LogicFlow({
      container: containerRef.current,
      width: 900,
      height: 560,
      grid: {
        size: 10,
        visible: true,
      },
      stopScrollGraph: true,
      stopZoomGraph: true,
      stopMoveGraph: true,
      adjustNodePosition: false,
      adjustEdge: true,
      adjustEdgeMiddle: false,
    })

    const syncSnapshot = () => setSnapshot(getSnapshot(lf))
    lf.on('edge:adjust', syncSnapshot)
    lfRef.current = lf
    renderRepro(lf)

    return () => {
      lf.destroy()
      lfRef.current = undefined
    }
  }, [])

  return (
    <Card title="圆角矩形终点拖线 NaN 回归验证">
      <Space direction="vertical" size="middle" className={styles.content}>
        <Alert
          type="info"
          showIcon
          message="一次拖动完成回归验证"
          description={
            <span>
              按住蓝色高亮的“箭头前最后一段水平折线”，向下拖入红色区域后松手。
              修复前连线会消失，并将终点 x 写成 <code>NaN</code>；
              修复后终点应吸附到目标矩形左侧直边 <code>x = {targetLeft}</code>。
            </span>
          }
        />

        <Space wrap>
          <Button
            type="primary"
            onClick={() => lfRef.current && renderRepro(lfRef.current)}
          >
            重置复现现场
          </Button>
          <Tag
            color={
              snapshot.hasNaN
                ? 'error'
                : snapshot.hasAdjusted
                  ? 'success'
                  : 'processing'
            }
          >
            {snapshot.hasNaN
              ? '回归失败：出现 NaN'
              : snapshot.hasAdjusted
                ? '验证通过：坐标有效'
                : '待验证：请拖动高亮线段'}
          </Tag>
          <Typography.Text>
            圆角圆开方项（负数时应改用直边交点）：
            <code
              className={
                snapshot.radicand !== null && snapshot.radicand < 0
                  ? styles.negative
                  : undefined
              }
            >
              {snapshot.radicand === null
                ? '-'
                : formatNumber(snapshot.radicand)}
            </code>
          </Typography.Text>
        </Space>

        <div className={styles.stageScroller}>
          <div className={styles.stage}>
            <div ref={containerRef} className={styles.viewport} />
            <div
              className={styles.dragGuide}
              style={{
                left: terminalSegmentStart.x,
                top: initialArcY,
                width: initialArcX - terminalSegmentStart.x,
              }}
            >
              <span>按住这一段向下拖</span>
            </div>
            <div
              className={styles.invalidBand}
              style={{
                left: terminalSegmentStart.x - 20,
                top: invalidBandTop,
                width: targetLeft - terminalSegmentStart.x + 40,
                height: invalidBandBottom - invalidBandTop,
              }}
            >
              <span>拖入此区域并松手</span>
            </div>
          </div>
        </div>

        <div className={styles.dataPanel}>
          <Typography.Text strong>pointsList</Typography.Text>
          <pre>{formatPointsList(snapshot.pointsList) || '-'}</pre>
          <Typography.Text strong>model.points</Typography.Text>
          <pre>{snapshot.points || '-'}</pre>
        </div>
      </Space>
    </Card>
  )
}
