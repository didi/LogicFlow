import { createUuid, refreshGraphId } from '../../src/util/uuid'
import { CommonTypes } from '../../src/types/common'

describe('UUID Utils', () => {
  test('createUuid should generate unique ids', () => {
    const id1 = createUuid()
    const id2 = createUuid()

    expect(id1).toBeDefined()
    expect(id2).toBeDefined()
    expect(id1).not.toBe(id2)
    expect(typeof id1).toBe('string')
    expect(typeof id2).toBe('string')
    expect(id1.length).toBeGreaterThan(0)
    expect(id2.length).toBeGreaterThan(0)
  })

  test('refreshGraphId should refresh all ids in graph data', () => {
    const graphData: CommonTypes.GraphData = {
      nodes: [
        { id: 'node1', type: 'rect', x: 100, y: 100 },
        { id: 'node2', type: 'circle', x: 200, y: 200 },
      ],
      edges: [{ id: 'edge1', sourceNodeId: 'node1', targetNodeId: 'node2' }],
    }

    const originalData = JSON.parse(JSON.stringify(graphData))
    const refreshedData = refreshGraphId(graphData)

    // 所有 ID 都应该被更新
    expect(refreshedData.nodes![0].id).not.toBe(originalData.nodes[0].id)
    expect(refreshedData.nodes![1].id).not.toBe(originalData.nodes[1].id)
    expect(refreshedData.edges![0].id).not.toBe(originalData.edges[0].id)

    // 边的源节点和目标节点 ID 应该被正确更新
    expect(refreshedData.edges![0].sourceNodeId).toBe(
      refreshedData.nodes![0].id,
    )
    expect(refreshedData.edges![0].targetNodeId).toBe(
      refreshedData.nodes![1].id,
    )
  })

  test('refreshGraphId with prefix should add prefix to ids', () => {
    const graphData: CommonTypes.GraphData = {
      nodes: [{ id: 'node1', type: 'rect', x: 100, y: 100 }],
      edges: [],
    }

    const prefix = 'test_'
    const refreshedData = refreshGraphId(graphData, prefix)

    expect(refreshedData.nodes![0].id).toMatch(new RegExp(`^${prefix}`))
  })

  test('refreshGraphId should handle empty graph data', () => {
    const graphData: CommonTypes.GraphData = {
      nodes: [],
      edges: [],
    }

    const refreshedData = refreshGraphId(graphData)

    expect(refreshedData.nodes).toEqual([])
    expect(refreshedData.edges).toEqual([])
  })

  test('refreshGraphId should handle undefined nodes and edges', () => {
    const graphData: CommonTypes.GraphData = {}

    const refreshedData = refreshGraphId(graphData)

    expect(refreshedData).toBeDefined()
  })
})
