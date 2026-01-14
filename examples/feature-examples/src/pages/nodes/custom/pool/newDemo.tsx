import React, { useEffect, useRef, useState } from 'react'
import LogicFlow from '@logicflow/core'
import { Flex } from 'antd'
import { PoolElements } from '@logicflow/extension'
// import { registerPoolNodes } from '../../../../components/nodes/custom-pool'
import data from './newData'
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
  const [demoType, setDemoType] = useState<'basic' | 'layout'>('basic')
  const [poolInfo, setPoolInfo] = useState({
    vertical: { lanes: 2 },
    horizontal: { lanes: 2 },
  })
  const [operationLog, setOperationLog] = useState<string[]>([])

  const handleDragItem = (node: any) => {
    lfRef?.current?.dnd.startDrag(node)
  }

  // 添加泳道的方法
  const addLaneToPool = (
    poolId: string,
    position: 'above' | 'below' | 'left' | 'right',
  ) => {
    if (!lfRef.current) return

    const poolModel = lfRef.current.getNodeModelById(poolId)
    if (!poolModel) return

    const poolBounds = poolModel.getBounds()
    const poolType = poolId.includes('vertical') ? 'vertical' : 'horizontal'

    // 根据泳池类型和位置调用不同的添加方法
    if (poolType === 'horizontal') {
      // 横向泳池：支持上方和下方添加
      if (
        position === 'above' &&
        typeof poolModel.addChildAbove === 'function'
      ) {
        poolModel.addChildAbove({
          x: poolBounds.centerX,
          y: poolBounds.top - 60,
          width: poolBounds.width - 30,
          height: 120,
        })
      } else if (
        position === 'below' &&
        typeof poolModel.addChildBelow === 'function'
      ) {
        poolModel.addChildBelow({
          x: poolBounds.centerX,
          y: poolBounds.bottom + 60,
          width: poolBounds.width - 30,
          height: 120,
        })
      }
    } else {
      // 纵向泳池：支持左侧和右侧添加
      // 注意：这里不需要传递坐标参数，因为addChildLeft/addChildRight方法内部会处理位置
      if (position === 'left' && typeof poolModel.addChildLeft === 'function') {
        poolModel.addChildLeft()
      } else if (
        position === 'right' &&
        typeof poolModel.addChildRight === 'function'
      ) {
        poolModel.addChildRight()
      }
    }

    // 更新泳道数量信息
    setPoolInfo((prev) => ({
      ...prev,
      [poolType]: { lanes: prev[poolType].lanes + 1 },
    }))

    // 记录操作日志
    let action = ''
    if (poolType === 'horizontal') {
      action = position === 'above' ? '上方' : '下方'
    } else {
      action = position === 'left' ? '左侧' : '右侧'
    }

    setOperationLog((prev) => [
      `✅ 在${poolType === 'vertical' ? '纵向' : '横向'}泳池${action}添加了新泳道`,
      ...prev.slice(0, 5),
    ])
  }

  // 删除泳道的方法
  const deleteLaneFromPool = (poolId: string) => {
    if (!lfRef.current) return

    const poolModel = lfRef.current.getNodeModelById(poolId)
    if (poolModel && typeof poolModel.deleteChild === 'function') {
      // 获取泳道子节点
      const laneChildren = Array.from(poolModel.children)
        .map((childId) => lfRef.current!.getNodeModelById(childId))
        .filter((childModel) => childModel?.type === 'lane')

      if (laneChildren.length > 0) {
        const lastLane = laneChildren[laneChildren.length - 1]
        poolModel.deleteChild(lastLane.id)

        // 更新泳道数量信息
        const poolType = poolId.includes('vertical') ? 'vertical' : 'horizontal'
        setPoolInfo((prev) => ({
          ...prev,
          [poolType]: { lanes: Math.max(0, prev[poolType].lanes - 1) },
        }))

        // 记录操作日志
        setOperationLog((prev) => [
          `🗑️ 从${poolType === 'vertical' ? '纵向' : '横向'}泳池删除了最后一个泳道`,
          ...prev.slice(0, 5),
        ])
      }
    }
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
        lf.graphModel.nodes.map((node) => `${node.id}-${node.zIndex}`),
      )
    })

    if (demoType === 'basic') {
      lf.render(data)
      console.log('lf', lf.getGraphData())
    } else {
      // 布局演示数据
      const layoutData = {
        nodes: [
          // 纵向布局泳池
          // {
          //   id: 'pool-vertical',
          //   type: 'pool',
          //   x: 300,
          //   y: 200,
          //   width: 400,
          //   height: 300,
          //   properties: {
          //     layoutDirection: 'vertical',
          //   },
          //   text: '纵向泳池',
          // },
          // 横向布局泳池
          {
            id: 'pool-horizontal',
            type: 'pool',
            x: 800,
            y: 200,
            width: 400,
            height: 300,
            properties: {
              layoutDirection: 'horizontal',
            },
            text: '横向泳池',
          },
        ],
        edges: [],
      }
      lf.render(layoutData)
      lf.on('node:click', ({ data }) => {
        const clickNodeModel = lf.getNodeModelById(data.id)
        console.log(
          '点击了节点',
          clickNodeModel,
          lf.graphModel.nodes.map((node) => `${node.id}-${node.zIndex}`),
        )
      })

      // 建立泳池和泳道的父子关系
      setTimeout(() => {
        const poolVertical = lf.getNodeModelById('pool-vertical')
        const poolHorizontal = lf.getNodeModelById('pool-horizontal')

        if (poolVertical) {
          poolVertical.addChild('lane-vertical-1')
          poolVertical.addChild('lane-vertical-2')
        }

        if (poolHorizontal) {
          poolHorizontal.addChild('lane-horizontal-1')
          poolHorizontal.addChild('lane-horizontal-2')
        }
      }, 100)
    }

    lfRef.current = lf

    return () => {
      lfRef.current?.destroy()
    }
  }, [demoType])

  return (
    <div className="pool-demo-container">
      <div className="demo-header">
        <h2>泳池和泳道节点示例</h2>
        <p>基于动态分组插件和内置resizable能力重新实现</p>
        <div style={{ marginTop: '10px' }}>
          <button
            onClick={() => setDemoType('basic')}
            style={{
              marginRight: '10px',
              backgroundColor: demoType === 'basic' ? '#1890ff' : '#f5f5f5',
              color: demoType === 'basic' ? 'white' : 'black',
              border: '1px solid #d9d9d9',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            基础示例
          </button>
          <button
            onClick={() => setDemoType('layout')}
            style={{
              backgroundColor: demoType === 'layout' ? '#1890ff' : '#f5f5f5',
              color: demoType === 'layout' ? 'white' : 'black',
              border: '1px solid #d9d9d9',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            布局演示
          </button>
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
              rect
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
              circle
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
              diamond
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
              ellipse
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
              polygon
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
          </Flex>
        </div>

        {demoType === 'layout' && (
          <div style={{ marginTop: '10px' }}>
            <p style={{ color: '#666', marginBottom: '10px' }}>
              左侧为纵向布局（默认），右侧为横向布局
            </p>

            {/* 泳道数量信息 */}
            <div
              style={{
                display: 'flex',
                gap: '20px',
                marginBottom: '15px',
                fontSize: '14px',
                color: '#666',
              }}
            >
              <div>
                <span style={{ fontWeight: 'bold' }}>纵向泳池: </span>
                <span>{poolInfo.vertical.lanes} 个泳道</span>
              </div>
              <div>
                <span style={{ fontWeight: 'bold' }}>横向泳池: </span>
                <span>{poolInfo.horizontal.lanes} 个泳道</span>
              </div>
            </div>

            {/* 操作按钮组 */}
            <div style={{ marginBottom: '15px' }}>
              <h4
                style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#333' }}
              >
                泳道管理操作:
              </h4>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => addLaneToPool('pool-vertical', 'left')}
                  style={{
                    backgroundColor: '#52c41a',
                    color: 'white',
                    border: '1px solid #d9d9d9',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  为纵向泳池添加左侧泳道
                </button>
                <button
                  onClick={() => addLaneToPool('pool-vertical', 'right')}
                  style={{
                    backgroundColor: '#52c41a',
                    color: 'white',
                    border: '1px solid #d9d9d9',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  为纵向泳池添加右侧泳道
                </button>
                <button
                  onClick={() => deleteLaneFromPool('pool-vertical')}
                  disabled={poolInfo.vertical.lanes <= 0}
                  style={{
                    backgroundColor:
                      poolInfo.vertical.lanes <= 0 ? '#ccc' : '#ff4d4f',
                    color: 'white',
                    border: '1px solid #d9d9d9',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    cursor:
                      poolInfo.vertical.lanes <= 0 ? 'not-allowed' : 'pointer',
                    fontSize: '12px',
                  }}
                >
                  删除纵向泳道
                </button>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  flexWrap: 'wrap',
                  marginTop: '8px',
                }}
              >
                <button
                  onClick={() => addLaneToPool('pool-horizontal', 'above')}
                  style={{
                    backgroundColor: '#fa8c16',
                    color: 'white',
                    border: '1px solid #d9d9d9',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  为横向泳池添加上方泳道
                </button>
                <button
                  onClick={() => addLaneToPool('pool-horizontal', 'below')}
                  style={{
                    backgroundColor: '#fa8c16',
                    color: 'white',
                    border: '1px solid #d9d9d9',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  为横向泳池添加下方泳道
                </button>
                <button
                  onClick={() => deleteLaneFromPool('pool-horizontal')}
                  disabled={poolInfo.horizontal.lanes <= 0}
                  style={{
                    backgroundColor:
                      poolInfo.horizontal.lanes <= 0 ? '#ccc' : '#ff4d4f',
                    color: 'white',
                    border: '1px solid #d9d9d9',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    cursor:
                      poolInfo.horizontal.lanes <= 0
                        ? 'not-allowed'
                        : 'pointer',
                    fontSize: '12px',
                  }}
                >
                  删除横向泳道
                </button>
              </div>
            </div>

            {/* 操作说明 */}
            {/* <div style={{ 
              backgroundColor: '#f0f8ff', 
              padding: '10px', 
              borderRadius: '6px', 
              border: '1px solid #d4e6f1',
              fontSize: '12px',
              color: '#2c5282',
              display: 'flex',
              alignItems: 'center',
            }}>
              <strong>💡 操作说明:</strong>
              <ul style={{ margin: '5px 0 0 0', paddingLeft: '15px' }}>
                <li>横向泳池：点击"添加上方泳道"或"添加下方泳道"按钮在泳池的上下方添加新泳道</li>
                <li>纵向泳池：点击"添加左侧泳道"或"添加右侧泳道"按钮在泳池的左右侧添加新泳道</li>
                <li>点击"删除泳道"按钮删除选中泳池的最后一个泳道</li>
                <li>泳池会自动调整尺寸以适应包含的泳道数量</li>
              </ul>
            </div> */}

            {/* 操作日志 */}
            {operationLog.length > 0 && (
              <div style={{ marginTop: '15px' }}>
                <h4
                  style={{
                    margin: '0 0 8px 0',
                    fontSize: '14px',
                    color: '#333',
                  }}
                >
                  最近操作:
                </h4>
                <div
                  style={{
                    backgroundColor: '#f9f9f9',
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid #e8e8e8',
                    fontSize: '12px',
                    maxHeight: '100px',
                    overflowY: 'auto',
                  }}
                >
                  {operationLog.map((log, index) => (
                    <div key={index} style={{ marginBottom: '4px' }}>
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="demo-content">
        <div
          ref={containerRef}
          className="pool-demo-graph"
          style={
            demoType === 'layout'
              ? {
                  width: '100%',
                  height: '1200px',
                  border: '1px solid #e8e8e8',
                  borderRadius: '6px',
                }
              : {
                  width: '100%',
                  height: '1200px',
                }
          }
        />
      </div>
    </div>
  )
}

export default PoolNodeDemo
