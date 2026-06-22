/**
 * @jest-environment jsdom
 */
import type { DynamicGroupNodeModel } from '../../src/dynamic-group'
import { createDynamicGroupLF } from './fixtures'

afterEach(() => {
  document.body.innerHTML = ''
})

function renderGroupGraph(options?: {
  pluginOptions?: { disallowEdgeConnectToGroup?: boolean }
  allowEdgeConnect?: boolean
}) {
  const lf = createDynamicGroupLF(options?.pluginOptions)
  lf.render({
    nodes: [
      {
        id: 'group_1',
        type: 'dynamic-group',
        x: 420,
        y: 220,
        properties: {
          width: 360,
          height: 220,
          collapsible: true,
          isCollapsed: false,
          children: [],
          ...(options?.allowEdgeConnect !== undefined
            ? { allowEdgeConnect: options.allowEdgeConnect }
            : {}),
        },
      },
      { id: 'outer', type: 'circle', x: 120, y: 220 },
    ],
    edges: [],
  })
  return lf
}

describe('dynamic-group connect rules', () => {
  test('C1: default plugin — group can connect manually', () => {
    const lf = renderGroupGraph()
    const group = lf.getNodeModelById('group_1') as DynamicGroupNodeModel
    const outer = lf.getNodeModelById('outer')!

    expect(group.isAllowConnectedAsTarget(outer).isAllPass).toBe(true)
    expect(group.isAllowConnectedAsSource(outer).isAllPass).toBe(true)
  })

  test('C2: disallowEdgeConnectToGroup — group cannot connect manually', () => {
    const lf = renderGroupGraph({
      pluginOptions: { disallowEdgeConnectToGroup: true },
    })
    const group = lf.getNodeModelById('group_1') as DynamicGroupNodeModel
    const outer = lf.getNodeModelById('outer')!

    expect(group.isAllowConnectedAsTarget(outer).isAllPass).toBe(false)
    expect(group.isAllowConnectedAsSource(outer).isAllPass).toBe(false)
  })

  test('C3: strict plugin + allowEdgeConnect on node — group can connect', () => {
    const lf = renderGroupGraph({
      pluginOptions: { disallowEdgeConnectToGroup: true },
      allowEdgeConnect: true,
    })
    const group = lf.getNodeModelById('group_1') as DynamicGroupNodeModel
    const outer = lf.getNodeModelById('outer')!

    expect(group.isAllowConnectedAsTarget(outer).isAllPass).toBe(true)
    expect(group.isAllowConnectedAsSource(outer).isAllPass).toBe(true)
  })

  test('C4: default plugin + allowEdgeConnect false on node — group cannot connect', () => {
    const lf = renderGroupGraph({ allowEdgeConnect: false })
    const group = lf.getNodeModelById('group_1') as DynamicGroupNodeModel
    const outer = lf.getNodeModelById('outer')!

    expect(group.isAllowConnectedAsTarget(outer).isAllPass).toBe(false)
    expect(group.isAllowConnectedAsSource(outer).isAllPass).toBe(false)
  })

  test('C5: strict plugin — anchors exist but not edge-addable', () => {
    const lf = renderGroupGraph({
      pluginOptions: { disallowEdgeConnectToGroup: true },
    })
    const group = lf.getNodeModelById('group_1') as DynamicGroupNodeModel

    expect(group.anchors.length).toBeGreaterThan(0)
    group.anchors.forEach((anchor) => {
      expect(anchor.edgeAddable).toBe(false)
    })
  })
})
