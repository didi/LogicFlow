import LogicFlow from '@logicflow/core'
import { DynamicGroup } from '../../src/dynamic-group'

export function createContainer() {
  const container = document.createElement('div')
  container.style.width = '1200px'
  container.style.height = '800px'
  document.body.appendChild(container)
  return container
}

export function createDynamicGroupLF(pluginOptions?: {
  disallowEdgeConnectToGroup?: boolean
}) {
  return new LogicFlow({
    container: createContainer(),
    width: 1200,
    height: 800,
    plugins: [DynamicGroup],
    ...(pluginOptions
      ? { pluginsOptions: { dynamicGroup: pluginOptions } }
      : {}),
  })
}

const baseGroupProps = {
  width: 360,
  height: 220,
  collapsedWidth: 80,
  collapsedHeight: 60,
  collapsible: true,
  isCollapsed: false,
}

/** 外节点 → 组内单节点 */
export function graphWithSingleExternalEdge() {
  return {
    nodes: [
      {
        id: 'group_1',
        type: 'dynamic-group',
        x: 420,
        y: 220,
        properties: { ...baseGroupProps, children: ['inner'] },
      },
      { id: 'outer', type: 'circle', x: 120, y: 220 },
      {
        id: 'inner',
        type: 'rect',
        x: 420,
        y: 220,
        properties: { width: 80, height: 50 },
      },
    ],
    edges: [
      {
        id: 'e_outer_inner',
        type: 'polyline',
        sourceNodeId: 'outer',
        targetNodeId: 'inner',
      },
    ],
  }
}

/** Gateway 双分支连入同一分组 */
export function graphWithGatewayDualBranch() {
  return {
    nodes: [
      {
        id: 'group_gw',
        type: 'dynamic-group',
        x: 480,
        y: 240,
        properties: { ...baseGroupProps, children: ['node_a', 'node_b'] },
      },
      { id: 'gateway', type: 'diamond', x: 160, y: 240 },
      { id: 'node_a', type: 'rect', x: 420, y: 180 },
      { id: 'node_b', type: 'rect', x: 420, y: 300 },
    ],
    edges: [
      {
        id: 'e_gw_a',
        type: 'polyline',
        sourceNodeId: 'gateway',
        targetNodeId: 'node_a',
      },
      {
        id: 'e_gw_b',
        type: 'polyline',
        sourceNodeId: 'gateway',
        targetNodeId: 'node_b',
      },
    ],
  }
}

export function getVirtualEdges(lf: LogicFlow) {
  return lf.graphModel.edges.filter((edge) => edge.virtual)
}

export function findEdgeBetween(
  lf: LogicFlow,
  sourceId: string,
  targetId: string,
) {
  return lf
    .getGraphData()
    .edges.find(
      (edge) =>
        edge.sourceNodeId === sourceId && edge.targetNodeId === targetId,
    )
}
