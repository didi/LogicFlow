import Engine from '../src/index';

describe('流程引擎', () => {
  test('初始化流程引擎', () => {
    const engine = new Engine();
    expect(engine).toBeInstanceOf(Engine);
  });
  test('加载图数据', async () => {
    const engine = new Engine();
    const flowData = {
      graphData: {
        nodes: [
          {
            id: 'node1',
            type: 'StartNode',
          }
        ]
      },
      global: {},
    }
    const flowModel = engine.load(flowData);
    expect(flowModel.nodeConfigMap.size).toBe(flowData.graphData.nodes.length);
  });
  test('执行流程完成, 返回数据包含executionId', async () => {
    const engine = new Engine();
    const flowData = {
      graphData: {
        nodes: [
          {
            id: 'node1',
            type: 'StartNode',
          },
          {
            id: 'node2',
            type: 'TaskNode',
          }
        ],
        edges: [
          {
            id: 'edge1',
            sourceNodeId: 'node1',
            targetNodeId: 'node2',
          }
        ]
      },
      context: {},
      globalData: {},
    }
    engine.load(flowData);
    const result = await engine.execute();
    expect(result).toHaveProperty('executionId');
  });
});
