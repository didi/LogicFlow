import { LogicFlow } from '../../src/index'

describe('text drag events', () => {
  test('emits text:dragstart and text:drag while dragging element text', async () => {
    const container = document.createElement('div')
    container.id = 'text-drag-graph'
    document.body.appendChild(container)

    const lf = new LogicFlow({
      container,
      width: 500,
      height: 500,
    })
    lf.graphModel.editConfigModel.updateEditConfig({ textDraggable: true })
    lf.render({
      nodes: [
        {
          id: 'node-1',
          type: 'rect',
          x: 100,
          y: 100,
          text: { x: 100, y: 100, value: 'drag me' },
        },
      ],
    })

    const events: string[] = []
    lf.graphModel.eventCenter.on('text:dragstart', () => {
      events.push('text:dragstart')
    })
    lf.graphModel.eventCenter.on('text:drag', () => {
      events.push('text:drag')
    })

    const node = lf.getNodeModelById('node-1')!
    expect(node.text.draggable).toBe(true)
    const text = container.querySelector('.lf-element-text') as Element
    expect(text).not.toBeNull()

    // jsdom's SVGElement does not expose pointer handler properties, so preact keeps
    // the camel-cased listener name here; browsers use the native `pointerdown` name.
    text.parentElement!.dispatchEvent(
      new MouseEvent('PointerDown', {
        bubbles: true,
        button: 0,
        clientX: 100,
        clientY: 100,
      }),
    )
    document.dispatchEvent(
      new MouseEvent('pointermove', {
        bubbles: true,
        clientX: 120,
        clientY: 120,
      }),
    )
    await new Promise((resolve) => setTimeout(resolve, 0))
    document.dispatchEvent(
      new MouseEvent('pointerup', {
        bubbles: true,
        clientX: 120,
        clientY: 120,
      }),
    )

    expect(events).toContain('text:dragstart')
    expect(events).toContain('text:drag')
    container.remove()
  })
})
