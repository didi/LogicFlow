import Engine, { TaskNode } from '../src/index';

describe('@logicflow/engine parallel execution', () => {
  class FetchNode extends TaskNode {
    async action() {
      await this.fetch()
    }
    fetch() {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve()
        }, 100);
      })
    }
  }
  const engine = new Engine();
  engine.register({
    type: 'FetchTask',
    model: FetchNode,
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
          type: 'FetchTask',
          properties: {}
        },
        {
          id: 'node3',
          type: 'TaskNode',
          properties: {}
        },
        {
          id: 'node4',
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
          sourceNodeId: 'node1',
          targetNodeId: 'node3',
          properties: {
          }
        },
        {
          id: 'edge3',
          sourceNodeId: 'node3',
          targetNodeId: 'node4',
          properties: {
          }
        }
      ]
    },
    globalData: {
    },
  }
  engine.load(flowData);
  test('When the process is executed, the asynchronous node will not block the execution of other branch nodes.', async () => {
    const result = await engine.execute();
    const execution = await engine.getExecutionRecord(result.executionId);
    expect(execution.length).toBe(4);
    expect(execution[3].nodeId).toEqual('node2')
  });
})
// TODO: 增加某个节点出现异常和interrupt 后，控制其他分支节点是否要继续执行的测试用例。
