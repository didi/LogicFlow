/**
 * @jest-environment jsdom
 */
import type { DynamicGroupNodeModel } from '../../src/dynamic-group'
import {
  createDynamicGroupLF,
  findEdgeBetween,
  getVirtualEdges,
  graphWithGatewayDualBranch,
  graphWithSingleExternalEdge,
} from './fixtures'

afterEach(() => {
  document.body.innerHTML = ''
})

function collapseGroup(
  lf: ReturnType<typeof createDynamicGroupLF>,
  groupId: string,
) {
  const group = lf.getNodeModelById(groupId) as DynamicGroupNodeModel
  group.toggleCollapse(true)
}

function expandGroup(
  lf: ReturnType<typeof createDynamicGroupLF>,
  groupId: string,
) {
  const group = lf.getNodeModelById(groupId) as DynamicGroupNodeModel
  group.toggleCollapse(false)
}

describe('dynamic-group collapse edge (#2395)', () => {
  test('E1: collapse → delete virtual edge → expand — edge does not resurrect', () => {
    const lf = createDynamicGroupLF()
    lf.render(graphWithSingleExternalEdge())

    collapseGroup(lf, 'group_1')

    const virtualEdges = getVirtualEdges(lf)
    expect(virtualEdges.length).toBe(1)

    lf.deleteEdge(virtualEdges[0].id)

    expandGroup(lf, 'group_1')

    expect(findEdgeBetween(lf, 'outer', 'inner')).toBeUndefined()
    expect(lf.getEdgeModelById('e_outer_inner')).toBeUndefined()
  })

  test('E7: gateway dual branch — collapse creates two virtual edges', () => {
    const lf = createDynamicGroupLF()
    lf.render(graphWithGatewayDualBranch())

    collapseGroup(lf, 'group_gw')

    const virtualEdges = getVirtualEdges(lf)
    expect(virtualEdges).toHaveLength(2)
    virtualEdges.forEach((edge) => {
      expect(edge.sourceNodeId).toBe('gateway')
      expect(edge.targetNodeId).toBe('group_gw')
    })
    expect(lf.getEdgeModelById('e_gw_a')?.visible).toBe(false)
    expect(lf.getEdgeModelById('e_gw_b')?.visible).toBe(false)
  })

  test('E7a: delete one virtual edge — only mapped real edge is removed', () => {
    const lf = createDynamicGroupLF()
    lf.render(graphWithGatewayDualBranch())

    collapseGroup(lf, 'group_gw')

    const virtualEdges = getVirtualEdges(lf)
    const virtualForA = virtualEdges.find((edge) =>
      edge.id.startsWith('e_gw_a'),
    )
    expect(virtualForA).toBeDefined()

    lf.deleteEdge(virtualForA!.id)

    expect(lf.getEdgeModelById('e_gw_a')).toBeUndefined()
    expect(lf.getEdgeModelById('e_gw_b')).toBeDefined()
    expect(getVirtualEdges(lf)).toHaveLength(1)
  })

  test('E7b: after deleting one virtual edge, expand keeps only remaining branch', () => {
    const lf = createDynamicGroupLF()
    lf.render(graphWithGatewayDualBranch())

    collapseGroup(lf, 'group_gw')

    const virtualForA = getVirtualEdges(lf).find((edge) =>
      edge.id.startsWith('e_gw_a'),
    )
    lf.deleteEdge(virtualForA!.id)

    expandGroup(lf, 'group_gw')

    expect(findEdgeBetween(lf, 'gateway', 'node_a')).toBeUndefined()
    expect(lf.getEdgeModelById('e_gw_b')?.visible).toBe(true)
    expect(findEdgeBetween(lf, 'gateway', 'node_b')).toBeDefined()
    expect(getVirtualEdges(lf)).toHaveLength(0)
  })

  test('E7c: delete both virtual edges — expand leaves no external edges', () => {
    const lf = createDynamicGroupLF()
    lf.render(graphWithGatewayDualBranch())

    collapseGroup(lf, 'group_gw')

    const virtualEdges = getVirtualEdges(lf)
    lf.deleteEdge(virtualEdges[0].id)
    lf.deleteEdge(getVirtualEdges(lf)[0].id)

    expandGroup(lf, 'group_gw')

    expect(findEdgeBetween(lf, 'gateway', 'node_a')).toBeUndefined()
    expect(findEdgeBetween(lf, 'gateway', 'node_b')).toBeUndefined()
    expect(lf.getGraphData().edges).toHaveLength(0)
  })

  test('E8: collapse → drag group → expand → drag — edge endpoints stay on anchors', () => {
    const lf = createDynamicGroupLF()
    lf.render({
      nodes: [
        {
          id: 'group_abc',
          type: 'dynamic-group',
          x: 400,
          y: 200,
          properties: {
            width: 320,
            height: 200,
            collapsedWidth: 80,
            collapsedHeight: 60,
            collapsible: true,
            isCollapsed: false,
            children: ['B'],
          },
        },
        { id: 'A', type: 'circle', x: 100, y: 200 },
        { id: 'B', type: 'rect', x: 400, y: 200 },
        { id: 'C', type: 'circle', x: 700, y: 200 },
      ],
      edges: [
        { id: 'e_ab', type: 'polyline', sourceNodeId: 'A', targetNodeId: 'B' },
        { id: 'e_bc', type: 'polyline', sourceNodeId: 'B', targetNodeId: 'C' },
      ],
    })

    const group = lf.getNodeModelById('group_abc') as DynamicGroupNodeModel
    const anchorOf = (nodeId: string, anchorId?: string) => {
      const node = lf.getNodeModelById(nodeId)!
      const anchors = node.getDefaultAnchor() as Array<{
        id: string
        x: number
        y: number
      }>
      const hit = anchorId ? anchors.find((a) => a.id === anchorId) : anchors[0]
      return hit ? { x: hit.x, y: hit.y } : { x: node.x, y: node.y }
    }
    const endpointDrift = (edgeId: string) => {
      const edge = lf.getEdgeModelById(edgeId)!
      const src = anchorOf(edge.sourceNodeId, edge.sourceAnchorId)
      const tgt = anchorOf(edge.targetNodeId, edge.targetAnchorId)
      return {
        start: Math.hypot(edge.startPoint.x - src.x, edge.startPoint.y - src.y),
        end: Math.hypot(edge.endPoint.x - tgt.x, edge.endPoint.y - tgt.y),
      }
    }

    group.toggleCollapse(true)
    lf.graphModel.moveNodes(['group_abc'], 150, 80, true)
    group.toggleCollapse(false)

    const afterExpand = endpointDrift('e_ab')
    expect(afterExpand.end).toBeLessThan(1)
    expect(endpointDrift('e_bc').start).toBeLessThan(1)

    lf.graphModel.moveNodes(['group_abc'], 100, 60, true)

    expect(endpointDrift('e_ab').end).toBeLessThan(1)
    expect(endpointDrift('e_bc').start).toBeLessThan(1)
  })
})
