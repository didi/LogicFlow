import LogicFlow from '../../src/LogicFlow'

describe('canvas pointer gestures', () => {
  let container: HTMLDivElement
  let lf: LogicFlow
  const eventNames = [
    'pointerdown',
    'pointermove',
    'pointerup',
    'pointercancel',
  ]
  const originalProperties = eventNames.map((name) =>
    Object.getOwnPropertyDescriptor(SVGElement.prototype, `on${name}`),
  )

  beforeAll(() => {
    // Expose the browser's pointer event properties missing from jsdom.
    for (const name of eventNames) {
      Object.defineProperty(SVGElement.prototype, `on${name}`, {
        configurable: true,
        writable: true,
        value: null,
      })
    }
  })

  afterAll(() => {
    eventNames.forEach((name, index) => {
      const original = originalProperties[index]
      if (original)
        Object.defineProperty(SVGElement.prototype, `on${name}`, original)
      else Reflect.deleteProperty(SVGElement.prototype, `on${name}`)
    })
  })

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    lf = new LogicFlow({ container, width: 800, height: 600, grid: false })
    lf.render({ nodes: [], edges: [] })
  })

  afterEach(() => {
    lf.destroy()
    container.remove()
  })

  function pointer(
    type: string,
    pointerId: number,
    pointerType: string,
    clientX: number,
    clientY: number,
    buttons: number,
  ) {
    // jsdom has MouseEvent but no PointerEvent constructor.
    const event = new MouseEvent(type, {
      bubbles: true,
      cancelable: true,
      clientX,
      clientY,
      buttons,
    })
    Object.defineProperties(event, {
      pointerId: { value: pointerId },
      pointerType: { value: pointerType },
    })
    container.querySelector('[name="canvas-overlay"]')!.dispatchEvent(event)
  }

  test.each(['mouse', 'pen'])(
    '%s hover does not turn a subsequent single touch into a pinch',
    async (pointerType) => {
      pointer('pointermove', 1, pointerType, 100, 100, 0)
      pointer('pointerdown', 2, 'touch', 200, 200, 1)
      pointer('pointermove', 2, 'touch', 300, 200, 1)
      pointer('pointerup', 2, 'touch', 300, 200, 0)
      await Promise.resolve()

      expect(lf.getTransform().SCALE_X).toBe(1)
      expect(lf.getTransform().SCALE_Y).toBe(1)
      expect(lf.getTransform().TRANSLATE_X).toBe(100)
    },
  )

  test('two pressed touch pointers still pinch the canvas', async () => {
    pointer('pointerdown', 2, 'touch', 100, 200, 1)
    pointer('pointerdown', 3, 'touch', 300, 200, 1)
    pointer('pointermove', 3, 'touch', 500, 200, 1)
    pointer('pointerup', 3, 'touch', 500, 200, 0)
    pointer('pointerup', 2, 'touch', 100, 200, 0)
    await Promise.resolve()

    expect(lf.getTransform().SCALE_X).toBe(2)
    expect(lf.getTransform().SCALE_Y).toBe(2)
  })

  test.each(['pointerup', 'pointercancel'])(
    'hover after %s does not become a second touch contact',
    async (endEvent) => {
      pointer('pointerdown', 1, 'mouse', 100, 100, 1)
      pointer(endEvent, 1, 'mouse', 100, 100, 0)
      pointer('pointermove', 1, 'mouse', 120, 100, 0)
      pointer('pointerdown', 2, 'touch', 200, 200, 1)
      pointer('pointermove', 2, 'touch', 300, 200, 1)
      pointer('pointerup', 2, 'touch', 300, 200, 0)
      await Promise.resolve()

      expect(lf.getTransform().SCALE_X).toBe(1)
      expect(lf.getTransform().SCALE_Y).toBe(1)
    },
  )

  test('pressed mouse movement still pans the canvas', async () => {
    pointer('pointerdown', 1, 'mouse', 100, 100, 1)
    pointer('pointermove', 1, 'mouse', 200, 100, 1)
    pointer('pointerup', 1, 'mouse', 200, 100, 0)
    await Promise.resolve()

    expect(lf.getTransform().SCALE_X).toBe(1)
    expect(lf.getTransform().TRANSLATE_X).toBe(100)
  })
})
