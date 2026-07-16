import { LogicFlow, PolylineEdgeModel, SegmentDirection } from '../../src'

const createLogicFlow = () => {
  const container = document.createElement('div')
  document.body.appendChild(container)
  return new LogicFlow({
    container,
    width: 800,
    height: 400,
  })
}

describe('PolylineEdgeModel rounded rectangle intersections', () => {
  test('keeps the endpoint finite when the terminal segment enters a straight-side region', () => {
    const lf = createLogicFlow()
    const radius = 24
    const initialY = 148
    const cornerCenter = { x: 564, y: 164 }
    const initialX =
      cornerCenter.x - Math.sqrt(radius ** 2 - (initialY - cornerCenter.y) ** 2)

    lf.render({
      nodes: [
        {
          id: 'rounded-source',
          type: 'rect',
          x: 190,
          y: 420,
          properties: { width: 120, height: 80 },
        },
        {
          id: 'rounded-target',
          type: 'rect',
          x: 650,
          y: 220,
          properties: {
            width: 220,
            height: 160,
            style: { radius },
          },
        },
      ],
      edges: [
        {
          id: 'rounded-rect-edge',
          type: 'polyline',
          sourceNodeId: 'rounded-source',
          targetNodeId: 'rounded-target',
          sourceAnchorId: 'rounded-source_1',
          targetAnchorId: 'rounded-target_3',
          startPoint: { x: 250, y: 420 },
          endPoint: { x: initialX, y: initialY },
          pointsList: [
            { x: 250, y: 420 },
            { x: 420, y: 420 },
            { x: 420, y: initialY },
            { x: initialX, y: initialY },
          ],
        },
      ],
    })

    const edge = lf.getEdgeModelById('rounded-rect-edge') as PolylineEdgeModel
    edge.dragAppendStart()
    edge.dragAppend(
      {
        start: { x: 420, y: initialY },
        end: { x: initialX, y: initialY },
        startIndex: 2,
        endIndex: 3,
        direction: SegmentDirection.HORIZONTAL,
        draggable: true,
      },
      { x: 0, y: 50 },
    )

    expect(edge.points).not.toContain('NaN')
    expect(edge.points).toContain('540,198')

    edge.dragAppendEnd()

    expect(edge.endPoint).toEqual({ x: 540, y: 198 })
    expect(
      edge.pointsList.every(
        ({ x, y }) => Number.isFinite(x) && Number.isFinite(y),
      ),
    ).toBe(true)
  })

  test('does not replace an endpoint with a non-finite shape intersection', () => {
    const lf = createLogicFlow()
    lf.render({
      nodes: [
        { id: 'guard-source', type: 'rect', x: 100, y: 220 },
        {
          id: 'guard-target',
          type: 'circle',
          x: 500,
          y: 100,
          properties: { r: 50 },
        },
      ],
      edges: [
        {
          id: 'guard-edge',
          type: 'polyline',
          sourceNodeId: 'guard-source',
          targetNodeId: 'guard-target',
          startPoint: { x: 150, y: 220 },
          endPoint: { x: 450, y: 220 },
          pointsList: [
            { x: 150, y: 220 },
            { x: 450, y: 220 },
          ],
        },
      ],
    })

    const edge = lf.getEdgeModelById('guard-edge') as PolylineEdgeModel
    const points = edge.updateCrossPoints([
      { x: 150, y: 220 },
      { x: 450, y: 220 },
    ])

    expect(points[points.length - 1]).toEqual({ x: 450, y: 220 })
  })
})
