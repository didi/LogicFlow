import { LogicFlow } from '../../src/index'

describe('node moveTo', () => {
  test('moves connected edge points when a node is moved directly', () => {
    const container = document.createElement('div')
    container.id = 'move-to-edge-graph'
    document.body.appendChild(container)

    const lf = new LogicFlow({
      container,
      width: 500,
      height: 500,
    })
    lf.render({
      nodes: [
        {
          id: 'node-1',
          type: 'rect',
          x: 100,
          y: 100,
          properties: { width: 100, height: 100 },
        },
        {
          id: 'node-2',
          type: 'rect',
          x: 300,
          y: 100,
          properties: { width: 100, height: 100 },
        },
      ],
      edges: [
        {
          id: 'edge-1',
          type: 'line',
          sourceNodeId: 'node-1',
          targetNodeId: 'node-2',
        },
      ],
    })

    const node = lf.getNodeModelById('node-1')!
    const edge = lf.getEdgeModelById('edge-1')!
    const beforeStart = { x: edge.startPoint.x, y: edge.startPoint.y }
    const beforeEnd = { x: edge.endPoint.x, y: edge.endPoint.y }

    node.moveTo(150, 150)

    expect(edge.startPoint).toEqual({
      x: beforeStart.x + 50,
      y: beforeStart.y + 50,
    })
    expect(edge.endPoint).toEqual(beforeEnd)
    container.remove()
  })
})
