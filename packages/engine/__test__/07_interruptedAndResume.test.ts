import { describe, expect, test } from '@jest/globals'
import Engine, { ActionStatus, BaseNode, TaskNode } from '../src/index'

describe('@logicflow/engine interrupted and resume', () => {
  class UserTask extends TaskNode {
    async action(): Promise<BaseNode.ActionResult | undefined> {
      this.globalData['a'] = 1
      return {
        status: ActionStatus.INTERRUPTED,
        detail: {
          formId: 'form_1',
        },
      }
    }
    async onResume({ data }: Engine.ResumeParam) {
      this.globalData.formId = data?.formId
    }
  }

  class AsyncNode extends TaskNode {
    async action(): Promise<BaseNode.ActionResult | undefined> {
      await this.wait(500)
      return undefined
    }

    wait(time: number) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ msg: `wait $${time}ms done` })
        }, time)
      })
    }
  }

  const engine = new Engine({
    debug: true,
  })
  engine.register({
    type: 'UserTask',
    model: UserTask,
  })
  engine.register({
    type: 'AsyncNode',
    model: AsyncNode,
  })
  const flowData: Engine.LoadGraphParam = {
    /**
     * node1 |--> node2(UserTask)  |--> node3
     *       |--> node4(AsyncNode) |--> node5
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
          type: 'UserTask',
          properties: {},
        },
        {
          id: 'node3',
          type: 'TaskNode',
          properties: {},
        },
        {
          id: 'node4',
          type: 'AsyncNode',
          properties: {},
        },
        {
          id: 'node5',
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
          sourceNodeId: 'node2',
          targetNodeId: 'node3',
          properties: {
            conditionExpression: 'a === 1',
          },
        },
        {
          id: 'edge3',
          sourceNodeId: 'node1',
          targetNodeId: 'node4',
          properties: {},
        },
        {
          id: 'edge4',
          sourceNodeId: 'node4',
          targetNodeId: 'node5',
          properties: {},
        },
      ],
    },
    globalData: {
      a: 0,
    },
  }
  engine.load(flowData)
  test('After executing the process, receive the flow status as "interrupted" and include detailed information returned by the custom node.', async () => {
    const result = await engine.execute()
    expect(result.status).toBe('interrupted')
    expect(result.detail?.formId).toEqual('form_1')
  })
  test('After a process is interrupted, you can resume its execution using the API.', async () => {
    const result = await engine.execute()
    await wait(500)
    // TODO: 确认该方法返回的类型
    const result2 = await engine.resume({
      executionId: result.executionId,
      nodeId: result.nodeId,
      actionId: result.actionId,
      data: {
        formId: 'form_2',
      },
    })
    expect(result2?.status).toBe('completed')
    expect(result2?.nodeId).toEqual('node3')
    if (result2?.executionId) {
      const execution = await engine.getExecutionRecord(result2?.executionId)
      // interrupted node have two execution record
      expect(execution?.length).toEqual(6)
    }
  })
})

function wait(time: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ msg: `wait ${time}ms done!` })
    }, time)
  })
}
