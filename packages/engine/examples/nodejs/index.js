const { Engine } = require('@logicflow/engine')

// console.log(Engine);
async function test() {
  const engine = new Engine()
  const flowData = {
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
  console.log(execution)
}
test()
