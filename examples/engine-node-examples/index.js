const { Engine } = import('@logicflow/engine')

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
          type: 'TaskNode',
          properties: {},
        },
      ],
      edges: [
        {
          id: 'edge1',
          sourceNodeId: 'node1',
          targetNodeId: 'node2',
          properties: {
            conditionExpression: 'a === 1',
          },
        },
        {
          id: 'edge2',
          sourceNodeId: 'node1',
          targetNodeId: 'node3',
          properties: {
            conditionExpression: 'a === 2',
          },
        },
      ],
    },
    globalData: {
      a: 2,
    },
  }
  engine.load(flowData)
  const result = await engine.execute()
  console.log('result --->>>', result)
  const execution = await engine.getExecutionRecord(result.executionId)
  console.log('execution', execution)
}
test()
