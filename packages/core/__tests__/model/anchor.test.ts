import { LogicFlow, RectNode, RectNodeModel } from '../../src/index'

describe('node anchors', () => {
  test('reading anchors does not mutate a cached custom getDefaultAnchor result', () => {
    const dom = document.createElement('div')
    dom.id = 'anchor-graph'
    document.body.appendChild(dom)

    const cachedAnchors: { x: number; y: number; id: string }[] = [
      { x: 100, y: 50, id: 'anchor-0' },
      { x: 150, y: 100, id: 'anchor-1' },
      { x: 100, y: 150, id: 'anchor-2' },
      { x: 50, y: 100, id: 'anchor-3' },
    ]

    class CachedAnchorNodeModel extends RectNodeModel {
      getDefaultAnchor() {
        return cachedAnchors
      }
    }

    const lf = new LogicFlow({
      container: dom,
      width: 500,
      height: 500,
    })
    lf.register({
      type: 'cached-anchor-node',
      view: RectNode,
      model: CachedAnchorNodeModel,
    })
    lf.render({
      nodes: [
        {
          id: 'node-1',
          type: 'cached-anchor-node',
          x: 100,
          y: 100,
          properties: { width: 100, height: 100 },
        },
      ],
    })

    const node = lf.getNodeModelById('node-1') as CachedAnchorNodeModel
    node.rotate = Math.PI / 2

    const before = cachedAnchors.map(({ x, y }) => ({ x, y }))
    const first = node.anchors
    const second = node.anchors
    const after = cachedAnchors.map(({ x, y }) => ({ x, y }))

    expect(after).toEqual(before)
    expect(second).toEqual(first)
  })
})
