import { describe, expect, test } from '@jest/globals'
import Engine from '../src/index'

describe('@logicflow/engine Execute', () => {
  test('When there are multiple start nodes in a process, all of them are executed by default.', async () => {
    const engine = new Engine({
      debug: true,
    })
    const flowData = {
      /**
       * node1 |--> node2
       * node3 |--> node4
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
            type: 'StartNode',
            properties: {},
          },
          {
            id: 'node4',
            type: 'TaskNode',
            properties: {},
          },
          {
            id: 'node5',
            type: 'StartNode',
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
            sourceNodeId: 'node3',
            targetNodeId: 'node4',
            properties: {},
          },
        ],
      },
    }
    engine.load(flowData)
    const result = await engine.execute()
    const execution = await engine.getExecutionRecord(result.executionId)

    expect(execution?.length).toBe(5)
  })
  test('When there are multiple start nodes in a process, you can specify which start node to execute.', async () => {
    const engine = new Engine({
      debug: true,
    })
    const flowData = {
      /**
       * node1 |--> node2
       * node3 |--> node4
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
            type: 'StartNode',
            properties: {},
          },
          {
            id: 'node4',
            type: 'TaskNode',
            properties: {},
          },
          {
            id: 'node5',
            type: 'StartNode',
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
            sourceNodeId: 'node3',
            targetNodeId: 'node4',
            properties: {},
          },
        ],
      },
    }
    engine.load(flowData)
    const result = await engine.execute({
      nodeId: 'node3',
    })
    const execution = await engine.getExecutionRecord(result.executionId)

    expect(execution?.length).toBe(2)
    expect(execution?.[0].nodeId).toBe('node3')
    expect(execution?.[1].nodeId).toBe('node4')
  })
  test('When attempting to execute a non-existent start node in a process, an execution exception is raised.', async () => {
    const engine = new Engine({
      debug: true,
    })
    const flowData = {
      /**
       * node1 |--> node2
       * node3 |--> node4
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
            type: 'StartNode',
            properties: {},
          },
          {
            id: 'node4',
            type: 'TaskNode',
            properties: {},
          },
          {
            id: 'node5',
            type: 'StartNode',
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
            sourceNodeId: 'node3',
            targetNodeId: 'node4',
            properties: {},
          },
        ],
      },
    }
    engine.load(flowData)
    try {
      await engine.execute({
        nodeId: 'node6',
      })
    } catch (error) {
      expect((error as Error).message).toContain('node6')
      expect((error as Error).message).toContain('1001')
    }
  })
  test('When there are multiple start nodes in a process, parallel execution is supported, and each start node generates a unique execution ID', async () => {
    const engine = new Engine({
      debug: true,
    })
    const flowData = {
      /**
       * node1 |--> node2
       * node3 |--> node4
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
            type: 'StartNode',
            properties: {},
          },
          {
            id: 'node4',
            type: 'TaskNode',
            properties: {},
          },
          {
            id: 'node5',
            type: 'StartNode',
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
            sourceNodeId: 'node3',
            targetNodeId: 'node4',
            properties: {},
          },
        ],
      },
    }
    engine.load(flowData)
    const r = engine.execute({
      nodeId: 'node1',
    })
    const r2 = engine.execute({
      nodeId: 'node3',
    })
    const result = await Promise.all([r, r2])
    const execution1 = await engine.getExecutionRecord(result[0].executionId)
    const execution2 = await engine.getExecutionRecord(result[1].executionId)
    expect(execution1?.length).toBe(2)
    expect(execution1?.[0].nodeId).toBe('node1')
    expect(execution1?.[1].nodeId).toBe('node2')
    expect(execution2?.length).toBe(2)
    expect(execution2?.[0].nodeId).toBe('node3')
    expect(execution2?.[1].nodeId).toBe('node4')
    expect(result[0].executionId).not.toBe(result[1].executionId)
  })
})
