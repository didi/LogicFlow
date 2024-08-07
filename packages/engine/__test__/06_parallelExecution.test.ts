import { describe, expect, test } from '@jest/globals'
import Engine, { BaseNode, TaskNode } from '../src/index'

describe('@logicflow/engine parallel execution', () => {
  class FetchNode extends TaskNode {
    async action(): Promise<BaseNode.ActionResult | undefined> {
      await this.fetch()
      return undefined
    }
    fetch() {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ data: 'fetched data' })
        }, 100)
      })
    }
  }

  const engine = new Engine({
    debug: true,
  })
  engine.register({
    type: 'FetchTask',
    model: FetchNode,
  })
  const flowData = {
    /**
     * node1 |--> node2(FetchTask)
     *       |--> node3 |--> node4
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
          type: 'FetchTask',
          properties: {},
        },
        {
          id: 'node3',
          type: 'TaskNode',
          properties: {},
        },
        {
          id: 'node4',
          type: 'TaskNode',
          properties: {},
        },
      ],
      edges: [
        {
          id: 'edge1',
          sourceNodeId: 'node1',
          targetNodeId: 'node2',
          properties: {},
        },
        {
          id: 'edge2',
          sourceNodeId: 'node1',
          targetNodeId: 'node3',
          properties: {},
        },
        {
          id: 'edge3',
          sourceNodeId: 'node3',
          targetNodeId: 'node4',
          properties: {},
        },
      ],
    },
    globalData: {},
  }

  engine.load(flowData)
  test('When the process is executed, the asynchronous node will not block the execution of other branch nodes.', async () => {
    const result = await engine.execute()
    const execution = await engine.getExecutionRecord(result.executionId)
    expect(execution?.length).toBe(4)
    expect(execution?.[3].nodeId).toEqual('node2')
  })
})
