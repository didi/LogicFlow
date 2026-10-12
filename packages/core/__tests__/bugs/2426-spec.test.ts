describe('edge model initialization', () => {
  test.each([
    'BaseEdgeModel',
    'LineEdgeModel',
    'BezierEdgeModel',
    'PolylineEdgeModel',
  ])('loads %s before the model barrel', (name) => {
    jest.isolateModules(() => {
      const EdgeModel = jest.requireActual(
        `../../src/model/edge/${name}`,
      ).default
      const models = jest.requireActual('../../src/model')

      expect(typeof EdgeModel).toBe('function')
      expect(EdgeModel).toBe(models[name])
    })
  })

  test('preserves public helpers and built-in edge factories', () => {
    jest.isolateModules(() => {
      const api = jest.requireActual('../../src')
      const edgeUtils = jest.requireActual('../../src/util/edge')
      const container = document.createElement('div')
      document.body.appendChild(container)
      const lf = new api.LogicFlow({ container, width: 400, height: 300 })

      try {
        lf.render({
          nodes: [
            { id: 'source', type: 'rect', x: 50, y: 50 },
            { id: 'target', type: 'rect', x: 250, y: 150 },
          ],
          edges: [],
        })

        const data = {
          type: 'line',
          sourceNodeId: 'source',
          targetNodeId: 'target',
          properties: { label: 'edge' },
          ignored: true,
        }
        const picked = api.pickEdgeConfig(data)
        expect(picked).toEqual({
          type: 'line',
          sourceNodeId: 'source',
          targetNodeId: 'target',
          properties: data.properties,
        })
        expect(picked.properties).toBe(data.properties)
        expect(data.ignored).toBe(true)
        expect(api.pickEdgeConfig).toBe(edgeUtils.pickEdgeConfig)
        expect(api.twoPointDistance).toBe(edgeUtils.twoPointDistance)
        expect(api.LogicFlowUtil.pickEdgeConfig).toBe(api.pickEdgeConfig)
        expect(api.twoPointDistance({ x: -3, y: -4 }, { x: 0, y: 0 })).toBe(5)

        for (const [type, EdgeModel] of [
          ['line', api.LineEdgeModel],
          ['polyline', api.PolylineEdgeModel],
          ['unknown', api.LineEdgeModel],
        ]) {
          expect(
            api.setupEdgeModel({ ...data, type }, lf.graphModel),
          ).toBeInstanceOf(EdgeModel)
        }
      } finally {
        lf.destroy()
        container.remove()
      }
    })
  })
})
