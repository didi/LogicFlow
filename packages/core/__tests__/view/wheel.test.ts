import { LogicFlow } from '../../src/index'

describe('canvas wheel scrolling', () => {
  let container: HTMLDivElement
  let lf: LogicFlow

  beforeEach(() => {
    container = document.createElement('div')
    container.id = 'wheel-graph'
    document.body.appendChild(container)
    lf = new LogicFlow({
      container,
      width: 500,
      height: 500,
    })
    lf.render({ nodes: [], edges: [] })
  })

  afterEach(() => {
    container.remove()
  })

  const dispatchWheel = (init: WheelEventInit) => {
    const canvas = container.querySelector('.lf-canvas-overlay')
    expect(canvas).not.toBeNull()
    canvas!.dispatchEvent(
      new WheelEvent('wheel', {
        bubbles: true,
        cancelable: true,
        ...init,
      }),
    )
  }

  test('Shift+wheel maps the Windows deltaY to horizontal scrolling', () => {
    dispatchWheel({ deltaX: 0, deltaY: 100, shiftKey: true })

    expect(lf.graphModel.transformModel.TRANSLATE_X).toBeLessThan(0)
    expect(lf.graphModel.transformModel.TRANSLATE_Y).toBe(0)
  })

  test('wheel without Shift still scrolls vertically', () => {
    dispatchWheel({ deltaX: 0, deltaY: 100 })

    expect(lf.graphModel.transformModel.TRANSLATE_X).toBe(0)
    expect(lf.graphModel.transformModel.TRANSLATE_Y).toBeLessThan(0)
  })

  test('Shift+wheel keeps an existing horizontal deltaX', () => {
    dispatchWheel({ deltaX: 100, deltaY: 40, shiftKey: true })

    expect(lf.graphModel.transformModel.TRANSLATE_X).toBeLessThan(0)
    expect(lf.graphModel.transformModel.TRANSLATE_Y).toBeLessThan(0)
  })
})
