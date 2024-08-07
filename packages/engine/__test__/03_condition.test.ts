import { describe, expect, test } from '@jest/globals'
import Engine from '../src/index'

describe('@logicflow/engine condition', () => {
  test('The process will not continue its execution if the condition expression evaluates to false.', async () => {
    const engine = new Engine({
      debug: true,
    })
    const flowData = {
      /**
       * node1 |--> node2
       *       |--> node3
       */
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
    const result = await engine.execute()
    const execution = await engine.getExecutionRecord(result.executionId)
    expect(execution?.length).toBe(2)
    expect(execution?.[1].nodeId).toBe('node3')
    expect(execution?.[1].nodeType).toBe('TaskNode')
    expect(execution?.[0].outgoing[0].result).toBe(false)
    expect(execution?.[0].outgoing[1].result).toBe(true)
  })
})
