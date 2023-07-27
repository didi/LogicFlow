import Engine, { TaskNode } from '../src/index';

describe('@logicflow/engine Customize Node', () => {
  class UserTask extends TaskNode {
    async action() {
      return {
        status: 'interrupted',
        detail: {
          formId: 'form_1'
        }
      };
    }
  }
  const engine = new Engine();
  engine.register({
    type: 'UserTask',
    model: UserTask,
  })
  const flowData = {
    graphData: {
      nodes: [
        {
          id: 'node1',
          type: 'StartNode',
          properties: {
          }
        },
        {
          id: 'node2',
          type: 'UserTask',
          properties: {}
        },
        {
          id: 'node3',
          type: 'TaskNode',
          properties: {}
        }
      ],
      edges: [
        {
          id: 'edge1',
          sourceNodeId: 'node1',
          targetNodeId: 'node2',
          properties: {
          }
        },
        {
          id: 'edge2',
          sourceNodeId: 'node2',
          targetNodeId: 'node3',
          properties: {
          }
        }
      ]
    },
    globalData: {
    },
  }
  engine.load(flowData);
  test('After executing the process, receive the flow status as "interrupted" and include detailed information returned by the custom node.', async () => {
    const result = await engine.execute();
    expect(result.status).toBe('interrupted');
    expect(result.detail.formId).toEqual('form_1');
  });
  test('After a process is interrupted, you can resume its execution using the API.', async () => {
    const result = await engine.execute();
    const result2 = await engine.resume({
      executionId: result.executionId,
      nodeId: result.nodeId,
      taskId: result.taskId,
      data: {
        formId: 'form_2'
      }
    })
    expect(result2.status).toBe('completed')
    expect(result2.nodeId).toEqual('node3')
  });
});
