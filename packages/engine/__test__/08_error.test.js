import Engine, { TaskNode } from '../src/index';

describe('@logicflow/engine error', () => {
  class DataNode extends TaskNode {
    async action() {
      this.globalData['dataSource'] = {
        time: this.context.getTime(),
      }
      return {
        status: 'error',
        detail: {
          errorMsg: this.context.getTime(),
        }
      }
    }
  }
  const engine = new Engine({
    context: {
      getTime() {
        return new Date().getTime();
      }
    }
  });
  engine.register({
    type: 'DataNode',
    model: DataNode,
  })
  const flowData = {
    /** node1 |--> node2(DataNode) */
    graphData: {
      nodes: [
        {
          id: 'node1',
          type: 'StartNode',
          properties: {
            text: '开始',
          },
        },
        {
          id: 'node2',
          type: 'DataNode',
          properties: {
            text: '数据节点',
          },
        }
      ],
      edges: [
        {
          id: 'edge1',
          type: 'line',
          sourceNodeId: 'node1',
          targetNodeId: 'node2',
          properties: {}
          
        }
      ]
    },
  };
  engine.load(flowData);
  test('return error status', async () => {
    const executeData = await engine.execute(flowData);
    expect(executeData.status).toEqual('error');
    const execution = await engine.getExecutionRecord(executeData.executionId);
    expect(execution.length).toBe(2);
    expect(execution[1].status).toEqual('error');
  });
});