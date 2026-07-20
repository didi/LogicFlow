import {
  LogicFlow,
  PolylineEdge,
  PolylineEdgeModel,
  SegmentDirection,
} from '../../src'

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

const graphData = {
  nodes: [
    { id: 'source', type: 'rect', x: 100, y: 100 },
    { id: 'target', type: 'rect', x: 500, y: 180 },
  ],
}

const renderPolyline = (pointsList?: LogicFlow.Point[]) => {
  const lf = createLogicFlow()
  lf.render({
    ...graphData,
    edges: [
      {
        id: 'test-edge',
        type: 'polyline',
        sourceNodeId: 'source',
        targetNodeId: 'target',
        ...(pointsList === undefined ? {} : { pointsList }),
      },
    ],
  })
  return lf.getEdgeModelById('test-edge') as PolylineEdgeModel
}

describe('PolylineEdgeModel invalid pointsList', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  test.each([
    ['omitted', undefined],
    ['empty', []],
  ])('automatically routes an %s pointsList without warning', (_, input) => {
    const warn = jest.spyOn(console, 'warn').mockImplementation()
    const edge = renderPolyline(input as LogicFlow.Point[] | undefined)

    expect(edge.pointsList.length).toBeGreaterThanOrEqual(2)
    expect(warn).not.toHaveBeenCalled()
  })

  test.each([
    ['omitted', undefined],
    ['empty', []],
  ])(
    'does not warn when an automatically routed %s pointsList resolves to one point',
    (_, input) => {
      jest
        .spyOn(PolylineEdgeModel.prototype, 'updatePoints')
        .mockImplementation(function (this: PolylineEdgeModel) {
          this.pointsList = [{ x: 300, y: 140 }]
          this.points = '300,140'
        })
      const warn = jest.spyOn(console, 'warn').mockImplementation()

      renderPolyline(input as LogicFlow.Point[] | undefined)

      expect(warn).not.toHaveBeenCalled()
    },
  )

  test('keeps and warns for a single-point path during initialization', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation()
    const point = { x: 300, y: 140 }
    const edge = renderPolyline([point])

    expect(edge.pointsList).toEqual([point])
    expect(edge.points).toBe('300,140')
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('Edge "test-edge"'),
    )
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('resolves to one point'),
    )
  })

  test('keeps and warns for a single-point update', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation()
    const edge = renderPolyline()
    const point = { x: 320, y: 160 }

    edge.updatePath([point])

    expect(edge.pointsList).toEqual([point])
    expect(edge.points).toBe('320,160')
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('resolves to one point'),
    )
  })

  test('automatically routes an empty path update without warning', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation()
    const edge = renderPolyline()

    edge.updatePath([])

    expect(edge.pointsList.length).toBeGreaterThanOrEqual(2)
    expect(warn).not.toHaveBeenCalled()
  })

  test('warns when repeated points collapse to a single point', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation()
    const edge = renderPolyline()
    const point = { x: 320, y: 160 }

    edge.updatePath([point, { ...point }])

    expect(edge.pointsList).toEqual([point])
    expect(edge.points).toBe('320,160')
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('resolves to one point'),
    )
  })

  test.each([
    ['NaN', Number.NaN],
    ['Infinity', Number.POSITIVE_INFINITY],
  ])('keeps and warns for a %s path update without orthogonalizing', (_, x) => {
    const warn = jest.spyOn(console, 'warn').mockImplementation()
    const edge = renderPolyline()
    const invalidPoints = [
      { x: 200, y: 100 },
      { x, y: 180 },
    ]

    edge.updatePath(invalidPoints)

    expect(edge.pointsList).toEqual(invalidPoints)
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('non-finite coordinates'),
    )
  })

  test('warns and avoids orthogonalizing non-finite render data', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation()
    const edge = renderPolyline([
      { x: 200, y: 100 },
      { x: Number.NaN, y: 180 },
    ])

    // LogicFlow normalizes graph data through JSON before model creation,
    // which converts NaN to null. The model must preserve that received path.
    expect(edge.pointsList).toEqual([
      { x: 200, y: 100 },
      { x: null, y: 180 },
    ])
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('non-finite coordinates'),
    )
  })
})

describe('PolylineEdge invalid point rendering', () => {
  const renderShape = (
    pointsList: LogicFlow.Point[],
    points: string,
    properties = {},
  ) =>
    (PolylineEdge.prototype.getEdge as any).call({
      props: {
        model: {
          points,
          pointsList,
          isAnimation: false,
          arrowConfig: {},
          properties,
          getEdgeStyle: () => ({}),
          getEdgeAnimationStyle: () => ({}),
        },
      },
    })

  const renderEdge = (pointsList: LogicFlow.Point[], points: string) => {
    const edge = Object.create(PolylineEdge.prototype)
    edge.props = {
      model: {
        points,
        pointsList,
        isSelected: false,
        isHitable: true,
        isShowAdjustPoint: false,
        isAnimation: false,
        draggable: false,
        arrowConfig: {},
        properties: {},
        getArrowStyle: () => ({}),
        getEdgeStyle: () => ({}),
        getEdgeAnimationStyle: () => ({}),
      },
      graphModel: {
        editConfigModel: {
          edgeTextMode: 'none',
          adjustEdge: false,
          adjustEdgeMiddle: false,
        },
      },
    }
    return edge.render()
  }

  test('keeps a finite single-point path safe but invisible', () => {
    const shape = renderShape([{ x: 100, y: 100 }], '100,100')

    expect(shape).not.toBeNull()
    expect(shape.props.points).toBe('100,100')
  })

  test.each([
    ['NaN', Number.NaN],
    ['Infinity', Number.POSITIVE_INFINITY],
  ])('skips a path containing %s', (_, x) => {
    const shape = renderShape(
      [
        { x: 100, y: 100 },
        { x, y: 200 },
      ],
      `100,100 ${x},200`,
    )

    expect(shape).toBeNull()
  })

  test('skips non-finite rendered points even if pointsList is still finite', () => {
    const shape = renderShape(
      [
        { x: 100, y: 100 },
        { x: 200, y: 200 },
      ],
      '100,100 NaN,200',
    )

    expect(shape).toBeNull()
  })

  test('accepts finite rendered points separated by repeated whitespace', () => {
    const shape = renderShape(
      [
        { x: 100, y: 100 },
        { x: 200, y: 200 },
      ],
      '100,100  \n\t200,200',
    )

    expect(shape).not.toBeNull()
  })

  test('rounds finite rendered points separated by repeated whitespace', () => {
    const pointsList = [
      { x: 100, y: 100 },
      { x: 100, y: 200 },
      { x: 200, y: 200 },
    ]
    const shape = renderShape(pointsList, '100,100  \n\t100,200 200,200', {
      radius: 5,
    })
    const cleanShape = renderShape(pointsList, '100,100 100,200 200,200', {
      radius: 5,
    })

    expect(shape).not.toBeNull()
    expect(shape.props.points).toBe(cleanShape.props.points)
  })

  test('skips a rendered point with an extra coordinate', () => {
    const shape = renderShape(
      [
        { x: 100, y: 100 },
        { x: 200, y: 200 },
      ],
      '100,100,NaN 200,200',
    )

    expect(shape).toBeNull()
  })

  test('skips the entire edge component for a non-finite path', () => {
    const edge = renderEdge(
      [
        { x: 100, y: 100 },
        { x: Number.NaN, y: 200 },
      ],
      '100,100 NaN,200',
    )

    expect(edge).toBeNull()
  })

  test('keeps the edge component for a finite single-point path', () => {
    const edge = renderEdge([{ x: 100, y: 100 }], '100,100')

    expect(edge).not.toBeNull()
  })
})
