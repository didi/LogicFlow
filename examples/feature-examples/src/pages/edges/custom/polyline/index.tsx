import LogicFlow, { h, PolylineEdge, PolylineEdgeModel } from '@logicflow/core'
import CustomPolyline from '@/components/edges/custom-polyline'
import { Button, Card, Select } from 'antd'
import { useEffect, useRef } from 'react'
import styles from './index.less'

import '@logicflow/core/es/index.css'

class CustomEdge extends PolylineEdge {
  getAdjustPointShape(x: any, y: any, edgeModel: any) {
    return h(
      'g',
      {
        onmousedown: () => {
          edgeModel.isAdjusting = true
          // 调整结束
          const onMouseUp = () => {
            document.removeEventListener('mouseup', onMouseUp)
            edgeModel.isAdjusting = false
          }
          document.addEventListener('mouseup', onMouseUp)
        },
      },
      [
        h('circle', {
          cx: x,
          cy: y,
          r: 5,
          fill: 'white',
          stroke: '#409eff',
          strokeWidth: 3,
          cursor: 'move',
        }),
      ],
    )
  }
}

class CustomModel extends PolylineEdgeModel {
  setAttributes() {
    const properties = this.properties || {}
    // 右键菜单
    this.menu = [
      {
        text: `${properties.is_cond === '1' ? '移除' : '添加'}条件`,
        callback: () => {
          // 触发事件
          const { eventCenter } = this.graphModel
          eventCenter.emit('custom:condition-click', this)
        },
      },
      {
        text: '删除连接线',
        callback: () => {
          // 删除边
          this.graphModel.deleteEdgeById(this.id)
        },
      },
    ]
    // 默认关闭hover动画
    this.isAnimation = false
    // 设置此属性，可以启动调整连线文案在连线中最长线段的中间
    this.customTextPosition = true
  }
  setHovered(isHovered) {
    super.setHovered(isHovered)
    // 查看模式
    const { editConfigModel } = this.graphModel
    const { isSilentMode } = editConfigModel.getConfig()
    if (isSilentMode) {
      this.isSelected = isHovered
      this.zIndex = isHovered ? 9999 : 0 // hover时置顶边线
    }
  }
  getEdgeAnimationStyle() {
    const style = super.getEdgeAnimationStyle()
    const source = this.getEdgeStyle() // 源样式
    if (source) {
      style.stroke = source.stroke
    }
    style.strokeDasharray = '4 4'
    style.animationDuration = '30s'
    return style
  }
  getEdgeStyle() {
    const style = super.getEdgeStyle()
    // 查看模式
    // const viewStyle = getViewStyle.call(this, style, 'edge');
    // if (viewStyle) {
    //     return {
    //         ...style,
    //         ...viewStyle
    //     };
    // }
    // 选中状态
    if (this.isSelected) {
      style.stroke = '#409eff'
    }
    return style
  }
  getTextStyle() {
    const style = super.getTextStyle()
    // 查看模式
    // const viewStyle = getViewStyle.call(this, style, 'edgeText');
    // if (viewStyle) {
    //     return {
    //         ...style,
    //         ...viewStyle
    //     };
    // }
    return style
  }
  getTextPosition() {
    const position = super.getTextPosition()
    // 连线文本位置
    const currentPositionList = this.points.split(' ')
    const pointsList = []
    currentPositionList &&
      currentPositionList.forEach((item) => {
        const [x, y] = item.split(',')
        pointsList.push({ x: Number(x), y: Number(y) })
      })
    if (currentPositionList.length > 1) {
      const lastIndex = currentPositionList.length - 1
      const [x1, y1] = currentPositionList[lastIndex - 1].split(',')
      const [x2, y2] = currentPositionList[lastIndex].split(',')
      let distence = 50
      if (Number(x1) === Number(x2)) {
        // 垂直
        if (Number(y2) < Number(y1)) {
          distence = -50
        }
        position.y = Number(y2) - distence
        position.x = Number(x2)
      }
    }
    return position
  }
}

const IssueEdge = {
  type: 'issueEdge',
  view: CustomEdge,
  model: CustomModel,
}

const config: Partial<LogicFlow.Options> = {
  isSilentMode: false,
  stopScrollGraph: true,
  stopZoomGraph: true,
  keyboard: {
    enabled: true,
  },
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
      lf.register(IssueEdge)
      lf.setDefaultEdgeType('customPolyline')

      // lf.render({
      //   nodes: [
      //     {
      //       id: '1',
      //       type: 'rect',
      //       x: 150,
      //       y: 320,
      //       properties: {},
      //     },
      //     {
      //       id: '2',
      //       type: 'rect',
      //       x: 630,
      //       y: 320,
      //       properties: {},
      //     },
      //   ],
      //   edges: [
      //     {
      //       id: '1-2',
      //       type: 'issueEdge',
      //       sourceNodeId: '1',
      //       targetNodeId: '2',
      //       startPoint: {
      //         x: 200,
      //         y: 320,
      //       },
      //       endPoint: {
      //         x: 580,
      //         y: 320,
      //       },
      //       properties: {
      //         textPosition: 'center',
      //       },
      //       text: {
      //         x: 390,
      //         y: 320,
      //         value: '边文本3',
      //       },
      //       pointsList: [
      //         {
      //           x: 200,
      //           y: 320,
      //         },
      //         {
      //           x: 580,
      //           y: 320,
      //         },
      //       ],
      //     },
      //     {
      //       id: '5b8fb346-eb4e-4627-abfa-463251db21bd',
      //       type: 'issueEdge',
      //       sourceNodeId: '1',
      //       targetNodeId: '2',
      //       startPoint: {
      //         x: 150,
      //         y: 280,
      //       },
      //       endPoint: {
      //         x: 630,
      //         y: 280,
      //       },
      //       properties: {
      //         textPosition: 'center',
      //       },
      //       text: {
      //         x: 390,
      //         y: 197,
      //         value: '边文本2',
      //       },
      //       pointsList: [
      //         {
      //           x: 150,
      //           y: 280,
      //         },
      //         {
      //           x: 150,
      //           y: 197,
      //         },
      //         {
      //           x: 630,
      //           y: 197,
      //         },
      //         {
      //           x: 630,
      //           y: 280,
      //         },
      //       ],
      //     },
      //     // {
      //     //   id: 'a9df1609-2511-4ffd-8caa-fdb9b76be358',
      //     //   type: 'customPolyline',
      //     //   sourceNodeId: '2',
      //     //   targetNodeId: '1',
      //     //   startPoint: {
      //     //     x: 630,
      //     //     y: 360,
      //     //   },
      //     //   endPoint: {
      //     //     x: 150,
      //     //     y: 360,
      //     //   },
      //     //   properties: {
      //     //     textPosition: 'center',
      //     //   },
      //     //   text: {
      //     //     x: 390,
      //     //     y: 458,
      //     //     value: '边文本4',
      //     //   },
      //     //   pointsList: [
      //     //     {
      //     //       x: 630,
      //     //       y: 360,
      //     //     },
      //     //     {
      //     //       x: 630,
      //     //       y: 458,
      //     //     },
      //     //     {
      //     //       x: 150,
      //     //       y: 458,
      //     //     },
      //     //     {
      //     //       x: 150,
      //     //       y: 360,
      //     //     },
      //     //   ],
      //     // },
      //     // {
      //     //   id: '9033c248-f068-4a02-a0a2-d0a6f82321f5',
      //     //   type: 'customPolyline',
      //     //   sourceNodeId: '1',
      //     //   targetNodeId: '2',
      //     //   startPoint: {
      //     //     x: 100,
      //     //     y: 320,
      //     //   },
      //     //   endPoint: {
      //     //     x: 680,
      //     //     y: 320,
      //     //   },
      //     //   properties: {
      //     //     textPosition: 'center',
      //     //   },
      //     //   text: {
      //     //     x: 390,
      //     //     y: 114,
      //     //     value: '边文本1',
      //     //   },
      //     //   pointsList: [
      //     //     {
      //     //       x: 100,
      //     //       y: 320,
      //     //     },
      //     //     {
      //     //       x: 70,
      //     //       y: 320,
      //     //     },
      //     //     {
      //     //       x: 70,
      //     //       y: 114,
      //     //     },
      //     //     {
      //     //       x: 760,
      //     //       y: 114,
      //     //     },
      //     //     {
      //     //       x: 760,
      //     //       y: 320,
      //     //     },
      //     //     {
      //     //       x: 680,
      //     //       y: 320,
      //     //     },
      //     //   ],
      //     // },
      //   ],
      // })
      const renderData = {
        nodes: [
          {
            properties: {},
            x: 241,
            y: 129,
            id: 'pHIpJtG0',
            text: '开始',
            type: 'circle',
          },
          {
            properties: {},
            x: 435,
            y: 176,
            id: '1PEBPRfZ',
            text: '节点',
            type: 'rect',
          },
          {
            properties: {},
            x: 599,
            y: 332,
            id: 'gFkBkPB5',
            text: '结束',
            type: 'circle',
          },
        ],
        edges: [
          {
            properties: {},
            pointsList: [
              { x: 277, y: 129 },
              { x: 324, y: 129 },
              { x: 324, y: 176 },
              { x: 371, y: 176 },
            ],
            endPoint: { x: 371, y: 176 },
            targetAnchorId: '1PEBPRfZ_3',
            sourceNodeId: 'pHIpJtG0',
            startPoint: { x: 277, y: 129 },
            id: 'wwqYyMUi',
            type: 'issueEdge',
            targetNodeId: '1PEBPRfZ',
            sourceAnchorId: 'pHIpJtG0_1',
          },
          {
            properties: {},
            pointsList: [
              { x: 499, y: 176 },
              { x: 599, y: 176 },
              { x: 599, y: 296 },
            ],
            endPoint: { x: 599, y: 296 },
            targetAnchorId: 'gFkBkPB5_0',
            sourceNodeId: '1PEBPRfZ',
            startPoint: { x: 499, y: 176 },
            id: '8OMx1dEh',
            type: 'issueEdge',
            targetNodeId: 'gFkBkPB5',
            sourceAnchorId: '1PEBPRfZ_1',
          },
        ],
      }
      lf.render(renderData)
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
