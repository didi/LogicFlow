/**
 * @jest-environment jsdom
 */
import { CommonTypes } from '../../src/types/common'

describe('CommonTypes', () => {
  test('Point interface should be defined', () => {
    const point: CommonTypes.Point = { x: 10, y: 20 }
    expect(point.x).toBe(10)
    expect(point.y).toBe(20)
  })

  test('PointTuple type should work', () => {
    const pointTuple: CommonTypes.PointTuple = [10, 20]
    expect(pointTuple[0]).toBe(10)
    expect(pointTuple[1]).toBe(20)
  })

  test('AnimationConfig interface should be defined', () => {
    const config: CommonTypes.AnimationConfig = {
      node: true,
      edge: false,
    }
    expect(config.node).toBe(true)
    expect(config.edge).toBe(false)
  })

  test('NodeData interface should be defined', () => {
    const nodeData: CommonTypes.NodeData = {
      id: 'node1',
      type: 'rect',
      x: 100,
      y: 100,
      text: 'Test Node',
    }
    expect(nodeData.id).toBe('node1')
    expect(nodeData.type).toBe('rect')
    expect(nodeData.x).toBe(100)
    expect(nodeData.y).toBe(100)
    expect(nodeData.text).toBe('Test Node')
  })

  test('EdgeData interface should be defined', () => {
    const edgeData: CommonTypes.EdgeData = {
      id: 'edge1',
      type: 'line',
      sourceNodeId: 'node1',
      targetNodeId: 'node2',
    }
    expect(edgeData.id).toBe('edge1')
    expect(edgeData.type).toBe('line')
    expect(edgeData.sourceNodeId).toBe('node1')
    expect(edgeData.targetNodeId).toBe('node2')
  })

  test('GraphData interface should be defined', () => {
    const graphData: CommonTypes.GraphData = {
      nodes: [
        { id: 'node1', type: 'rect', x: 100, y: 100 },
        { id: 'node2', type: 'circle', x: 200, y: 200 },
      ],
      edges: [{ id: 'edge1', sourceNodeId: 'node1', targetNodeId: 'node2' }],
    }
    expect(graphData.nodes).toHaveLength(2)
    expect(graphData.edges).toHaveLength(1)
  })
})
