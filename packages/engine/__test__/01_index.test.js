import Engine from '../src/index';

describe('@logicflow/engine', () => {
  test('Execution Process Completed, Returning Data Containing executionId', async () => {
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
    const flowModel = engine.load(flowData);
    const result = await engine.execute();
    expect(engine).toBeInstanceOf(Engine);
    expect(flowModel.nodeConfigMap.size).toBe(flowData.graphData.nodes.length);
    expect(result).toHaveProperty('executionId');
  });
});
