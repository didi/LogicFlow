import { useRef } from 'react'
import { Engine } from '@logicflow/engine'

export default function GetStarted() {
  const engineRef = useRef<Engine>()
  const init = async () => {
    const engine = new Engine()
    engineRef.current = engine
    const flowData = {
      graphData: {
        nodes: [
          {
            id: 'node1',
            type: 'StartNode',
            properties: {},
          },
          {
            id: 'node2',
            type: 'TaskNode',
            properties: {},
          },
          {
            id: 'node3',
            type: 'TaskNode',
            properties: {},
          },
        ],
        edges: [
          {
            id: 'edge1',
            sourceNodeId: 'node1',
            targetNodeId: 'node2',
            properties: {
              conditionExpression: 'a === 1',
            },
          },
          {
            id: 'edge2',
            sourceNodeId: 'node1',
            targetNodeId: 'node3',
            properties: {
              conditionExpression: 'a === 2',
            },
          },
        ],
      },
      globalData: {
        a: 2,
      },
    }
    engine.load(flowData)
    // 获取执行结果
    const result = await engine.execute()
    console.log('result --->>>', result)

    // 获取执行记录
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const execution = await engine.getExecutionRecord(result?.executionId)
    console.log('execution --->>>', execution)
  }

  return (
    <div>
      <h1>Engine Get Started. GoGoGo</h1>
      <button onClick={() => init()}>开始运行</button>
    </div>
  )
}
