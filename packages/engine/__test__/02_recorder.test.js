import Engine from '../src/index';

describe('@logicflow/engine Recorder', () => {
  test('Retrieve Execution Process Records.', async () => {
    const engine = new Engine();
    const flowData = {
      graphData: {
        nodes: [
          {
            id: 'node1',
            type: 'StartNode',
            properties: {}
          },
          {
            id: 'node2',
            type: 'TaskNode',
            properties: {}
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
      global: {},
    }
    engine.load(flowData);
    const result = await engine.execute();
    const executionId = result.executionId;
    /**
     * [
     *   {
     *     taskId: '',
     *     nodeId: '',
     *     instanceId: '',
     *     nodeType: '',
     *     timestamp: '',
     *     properties: {},
     *   }
     * ]
     */
    const execution = await engine.getExecutionRecord(executionId);
    expect(execution.length).toBe(2);
    expect(execution[1]).toHaveProperty('taskId');
    expect(execution[1]).toHaveProperty('nodeId');
    expect(execution[1]).toHaveProperty('executionId');
    expect(execution[1]).toHaveProperty('nodeType');
    expect(execution[1]).toHaveProperty('timestamp');
    expect(execution[1]).toHaveProperty('properties');
    expect(execution[1].nodeId).toBe('node2');
    expect(execution[1].nodeType).toBe('TaskNode');
  });
});