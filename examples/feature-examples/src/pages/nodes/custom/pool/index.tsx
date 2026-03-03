import React, { useEffect, useRef } from 'react'
import LogicFlow from '@logicflow/core'
import { Flex } from 'antd'
import { PoolElements } from '@logicflow/extension'
import data from './data'
import '@logicflow/core/dist/index.css'
import './index.less'

const config = {
  grid: true,
  background: {
    color: '#f5f5f5',
  },
  keyboard: {
    enabled: true,
  },
}

const PoolNodeDemo: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const lfRef = useRef<LogicFlow>()

  const handleDragItem = (node: any) => {
    lfRef?.current?.dnd.startDrag(node)
  }
  const handleGetGraphData = () => {
    console.log('lf', lfRef.current?.getGraphData(), lfRef.current?.graphModel)
  }

  useEffect(() => {
    console.log('useEffect run')
    if (!containerRef.current) return

    const lf = new LogicFlow({
      ...config,
      container: containerRef.current,
      width: 1200,
      height: 1200,
      allowResize: true,
      allowRotate: true,
      plugins: [PoolElements],
    })

    // 注册泳池和泳道节点
    // registerPoolNodes(lf)
    lf.on('node:click', ({ data }) => {
      const clickNodeModel = lf.getNodeModelById(data.id)
      console.log(
        '点击了节点',
        clickNodeModel,
        clickNodeModel?.zIndex,
        lf.graphModel.nodes.map((node) => `${node.id}-${node.zIndex}`),
      )
      if (clickNodeModel?.isLane) {
        const parentModel = lf.getNodeModelById(
          clickNodeModel.properties.parent,
        )
        console.log('parentModel', parentModel?.zIndex)
      }
    })
    lf.on('edge:add', ({ data }) => {
      console.log('添加了边', data)
      const { id } = data
      const edgeModel = lf.getEdgeModelById(id)
      console.log('边的层级', edgeModel?.zIndex)
    })

    lf.render(data)
    console.log('lf', lf.getGraphData())

    lfRef.current = lf

    return () => {
      lfRef.current?.destroy()
    }
  }, [])

  return (
    <div className="pool-demo-container">
      <div className="demo-header">
        <h2>泳池和泳道节点示例</h2>
        <p>基于动态分组插件和内置resizable能力重新实现</p>
        <div style={{ marginTop: '10px' }}>
          <span>当前图ID: {lfRef.current?.flowId}</span>
          <Flex wrap="wrap" gap="small" justify="center" align="center">
            <div
              className="dnd-item wrapper"
              onMouseDown={() =>
                handleDragItem({
                  type: 'rect',
                  text: 'rect',
                })
              }
            >
              矩形
            </div>
            <div
              className="dnd-item wrapper"
              onMouseDown={() => {
                handleDragItem({
                  type: 'circle',
                  text: 'circle',
                })
              }}
            >
              圆形
            </div>
            <div
              className="dnd-item wrapper"
              onMouseDown={() => {
                handleDragItem({
                  type: 'diamond',
                  text: 'diamond',
                })
              }}
            >
              菱形
            </div>
            <div
              className="dnd-item wrapper"
              onMouseDown={() => {
                handleDragItem({
                  type: 'ellipse',
                  text: 'ellipse',
                  properties: {
                    rx: 40,
                    ry: 80,
                  },
                })
              }}
            >
              椭圆
            </div>
            <div
              className="dnd-item wrapper"
              onMouseDown={() => {
                handleDragItem({
                  type: 'html',
                  text: 'html',
                })
              }}
            >
              html
            </div>
            <div
              className="dnd-item wrapper"
              onMouseDown={() => {
                handleDragItem({
                  type: 'polygon',
                  text: 'polygon',
                  properties: {
                    width: 110,
                    height: 100,
                    style: {
                      fill: '#ffd591',
                      stroke: '#ffa940',
                      strokeWidth: 2,
                      fillRule: 'evenodd',
                    },
                  },
                })
              }}
            >
              多边形
            </div>
            <div
              className="dnd-item text"
              onMouseDown={() => {
                handleDragItem({
                  type: 'text',
                  text: '文本',
                })
              }}
            >
              文本
            </div>
            <div
              className="dnd-item text"
              onMouseDown={() => {
                handleDragItem({
                  type: 'pool',
                  text: '横向泳池',
                  properties: {
                    width: 400,
                    height: 200,
                    direction: 'horizontal',
                    laneConfig: {
                      text: '水平泳道',
                    },
                  },
                })
              }}
            >
              横向泳道
            </div>
            <div
              className="dnd-item text"
              onMouseDown={() => {
                handleDragItem({
                  type: 'pool',
                  text: '竖向泳池',
                  properties: {
                    width: 200,
                    height: 400,
                    direction: 'vertical',
                    laneConfig: {
                      text: '水平泳道',
                    },
                  },
                })
              }}
            >
              竖向泳道
            </div>
            <div className="dnd-item text" onClick={handleGetGraphData}>
              获取图数据
            </div>
          </Flex>
        </div>
      </div>
      <div className="demo-content">
        <div
          ref={containerRef}
          className="pool-demo-graph"
          style={{
            width: '100%',
            height: '1200px',
          }}
        />
      </div>
    </div>
  )
}

export default PoolNodeDemo
