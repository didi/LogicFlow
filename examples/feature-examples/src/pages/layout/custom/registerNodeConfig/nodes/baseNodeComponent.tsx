import { createUuid } from '@logicflow/core'
import { EventType } from '@logicflow/core'
import { useEffect } from 'react'
import { Button, Popover } from 'antd'
import { SmallDashOutlined } from '@ant-design/icons' // 引入更多图标

export default function BaseNodeComponent(props: { node: any; graph: any }) {
  console.log('组件props', { ...props })
  const { node, graph } = props
  const data = graph.getNodeModelById(node.id)
  if (!data.properties) data.properties = {}

  const updateJudgeNode = function () {
    if (data.type !== 'judge') {
      return
    }
    // 更新节点高度
    const currentNode = graph.getElement(node.id) // graphModel里拿到的是最新数据
    // 更新以此节点为终点的边的终点位置
    const { edges } = graph
    const currentNodeAsTargetEdges = edges.filter(
      (edge: any) => edge.targetNodeId === currentNode.id,
    )
    if (currentNodeAsTargetEdges.length === 0) return
    const { anchors } = currentNode
    const leftAnchor = anchors.find((anchor: any) => anchor.id.includes('left'))
    currentNodeAsTargetEdges.forEach((edge: any) => {
      edge.updateEndPoint({
        x: leftAnchor.x,
        y: leftAnchor.y,
      })
    })
    // 更新以此节点为起点的边的起点位置
    const currentNodeAsSourceEdges = edges.filter(
      (edge: any) => edge.sourceNodeId === currentNode.id,
    )
    if (currentNodeAsSourceEdges.length === 0) return
    const rightAnchors = anchors.filter((anchor: any) =>
      anchor.id.includes('right'),
    )
    currentNodeAsSourceEdges.forEach((edge: any) => {
      const sourceAnchorId = rightAnchors.find(
        (anchor: any) => anchor.id === edge.sourceAnchorId,
      )
      if (sourceAnchorId) {
        edge.updateStartPoint({
          x: sourceAnchorId.x,
          y: sourceAnchorId.y,
        })
      }
    })
  }

  useEffect(() => {
    graph.eventCenter.on(EventType.NODE_PROPERTIES_CHANGE, (eventData: any) => {
      console.log('节点属性变化', { ...eventData })
      if (eventData.id !== node.id) return
      updateJudgeNode()
    })
  }, [])

  const addBranch = () => {
    const newBranch = {
      anchorId: `${createUuid()}_right`,
      branchName: `分支${(data.properties.branches || []).length + 1}条件`,
      conditions: [],
    }
    const newBranches = (data.properties.branches || []).concat(newBranch)
    const nodeModel = graph.getNodeModelById(node.id)
    nodeModel.setProperty('branches', newBranches)
  }

  // 处理点击事件
  const handleClick = (eventType: string) => {
    graph.eventCenter.emit(eventType, node)
  }

  return (
    <div className={`custom-node-wrap custom-node-wrap-${data.type}`}>
      <div className="title-box">
        <div className="title-left">
          <div className="node-label">{data.properties.nodeName}</div>
        </div>
        <Popover
          getPopupContainer={() =>
            document.getElementById('js_fl-canvas') || document.body
          }
          placement="bottomRight"
          content={
            <div className="hover-btn-box">
              {data.type !== 'start' && data.type !== 'end' && (
                <div
                  className="hover-btn"
                  onClick={() => handleClick('CopyNode')}
                >
                  创建副本
                </div>
              )}
              <div className="hover-btn" onClick={() => handleClick('CopyId')}>
                复制节点ID
              </div>
              {data.type !== 'start' && data.type !== 'end' && (
                <div
                  className="hover-btn"
                  onClick={() => handleClick('DeleteNode')}
                >
                  删除
                </div>
              )}
            </div>
          }
          trigger="click"
          overlayClassName="popper-flow-node-more"
        >
          <div className="more-box">
            <SmallDashOutlined className="node-more-icon" />
          </div>
        </Popover>
      </div>
      {data.type === 'judge' && (
        <div className="branch-list">
          {(data.properties.branches || []).map((item: any, index: number) => (
            <div key={item.id} className="branch-item">
              <div className="branch-index">分支{index + 1}</div>
              {item.branchName ? (
                <div className="branch-name">{item.branchName}</div>
              ) : (
                <div className="branch-name-default">未配置</div>
              )}
            </div>
          ))}
        </div>
      )}
      {data.type === 'judge' && (
        <div className="custom-node-wrap-footer">
          <Button type="link" size="small" onClick={addBranch}>
            添加分支
          </Button>
        </div>
      )}
      {data.type === 'task' && (
        <div className="response-content">
          <div className="response-item">
            {data.properties.nodeContent ? (
              <div className="response-value">
                <div className="ellipsis-one-line task-name">
                  {data.properties.nodeContent}
                </div>
                <div className="ellipsis-one-line task-name">
                  {data.properties.nodeContent}
                </div>
              </div>
            ) : (
              <div className="response-default">未配置</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
