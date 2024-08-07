import { describe, expect, test } from '@jest/globals'
import Engine, { Recorder } from '../src/index'

describe('@logicflow/engine Recorder', () => {
  test('When init Engine with debug mode, getExecutionRecord will get null', async () => {
    const engine = new Engine()
    const flowData = {
      /**
       * node1 |--> node2
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
        ],
        edges: [
          {
            id: 'edge1',
            sourceNodeId: 'node1',
            targetNodeId: 'node2',
          },
        ],
      },
      global: {},
    }
    engine.load(flowData)
    const result = await engine.execute()
    const executionId = result.executionId
    /**
     * [
     *   {
     *     actionId: '', // 某一个节点在某一次执行时生成的Id
     *     nodeId: '', // 流程图节点Id
     *     executionId: '', // 某一次执行的Id
     *     nodeType: '',
     *     timestamp: '',
     *     properties: {},
     *   }
     * ]
     */
    // TODO: 给个例子自定义执行记录
    const execution = await engine.getExecutionRecord(executionId)
    expect(execution).toBe(null)
  })

  test('Using the getExecutionRecord API, receive the complete execution record of the process.', async () => {
    const engine = new Engine({
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
            properties: {},
          },
          {
            id: 'node2',
            type: 'TaskNode',
            properties: {},
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
      global: {},
    }
    engine.load(flowData)
    const result = await engine.execute()
    const executionId = result.executionId
    /**
     * [
     *   {
     *     actionId: '', // 某一个节点在某一次执行时生成的Id
     *     nodeId: '', // 流程图节点Id
     *     executionId: '', // 某一次执行的Id
     *     nodeType: '',
     *     timestamp: '',
     *     properties: {},
     *   }
     * ]
     */
    // TODO: 给个例子自定义执行记录
    const execution = await engine.getExecutionRecord(executionId)

    expect(execution?.length).toBe(2)
    expect(execution?.[1]).toHaveProperty('actionId')
    expect(execution?.[1]).toHaveProperty('nodeId')
    expect(execution?.[1]).toHaveProperty('executionId')
    expect(execution?.[1]).toHaveProperty('nodeType')
    expect(execution?.[1]).toHaveProperty('timestamp')
    expect(execution?.[1]).toHaveProperty('properties')
    expect(execution?.[1].nodeId).toBe('node2')
    expect(execution?.[1].nodeType).toBe('TaskNode')
    const executionIds = await engine.getExecutionList()
    expect(executionIds.length).toBe(1)
  })
  test('The execution record cannot be obtained when the number of executions exceeds the maximum number of executions.', async () => {
    const engine = new Engine({
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
            properties: {},
          },
          {
            id: 'node2',
            type: 'TaskNode',
            properties: {},
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
      global: {},
    }
    engine.load(flowData)
    engine.recorder?.setMaxRecorderNumber(2)
    const result = await engine.execute()
    await engine.execute()
    await engine.execute()
    const execution = await engine.getExecutionRecord(result.executionId)
    expect(execution).toBe(null)
  })
  test('the number of execution records obtained by the getExecutionList api is correct.', async () => {
    const flowData = {
      /**
       * node1 |--> node2
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
        ],
        edges: [
          {
            id: 'edge1',
            sourceNodeId: 'node1',
            targetNodeId: 'node2',
          },
        ],
      },
      global: {},
    }
    const engine = new Engine({
      debug: true,
    })
    engine.load(flowData)
    await engine.execute()
    await engine.execute()
    const engine1 = new Engine({
      debug: true,
    })
    engine1.load(JSON.parse(JSON.stringify(flowData)))
    await engine1.execute()

    const execution = await engine.getExecutionList()
    const execution1 = await engine1.getExecutionList()
    expect(execution.length).toEqual(2)
    expect(execution1.length).toEqual(1)
    const recorder = new Recorder({
      instanceId: engine1.instanceId,
    })
    const execution2 = await recorder.getExecutionList()
    expect(execution2.length).toEqual(1)
  })
})
