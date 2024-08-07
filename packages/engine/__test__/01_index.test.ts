import { describe, expect, test } from '@jest/globals'
import Engine from '../src/index'

describe('@logicflow/engine', () => {
  test('Execution Process Completed, Returning Data Containing executionId', async () => {
    // TODO: context在初始化engine时传入
    const engine = new Engine({
      context: {},
      debug: true,
    })
    const flowData = {
      /**
       * node1 |--> node2
       */
      graphData: {
        nodes: [
          {
            id: 'node1',
            type: 'StartNode',
          },
          {
            id: 'node2',
            type: 'TaskNode',
          },
        ],
        edges: [
          {
            id: 'edge1',
            sourceNodeId: 'node1',
            targetNodeId: 'node2',
          },
        ],
      },
      globalData: {},
    }
    const flowModel = engine.load(flowData)
    const result = await engine.execute()
    expect(engine).toBeInstanceOf(Engine)
    expect(flowModel.nodeConfigMap.size).toBe(flowData.graphData.nodes.length)
    expect(result).toHaveProperty('executionId')
    expect(result.status).toBe('completed')
    expect(result.nodeId).toEqual('node2')
  })
})
