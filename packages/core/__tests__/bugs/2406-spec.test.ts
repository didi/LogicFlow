/**
 * @jest-environment jsdom
 */
import { createElement as h } from 'preact/compat'

import { BaseNode } from '../../src'

class TestNode extends BaseNode<any> {
  getShape() {
    return h('g', null)
  }
}

const createNode = () => {
  const model = {
    id: 'node_1',
    isDragging: false,
    isSelected: false,
    autoToFront: false,
    text: {
      editable: false,
    },
    getData: jest.fn(() => ({ id: 'node_1' })),
    setSelected: jest.fn(),
  }
  const graphModel = {
    gridSize: 1,
    eventCenter: {
      emit: jest.fn(),
    },
    editConfigModel: {
      isSilentMode: false,
      multipleSelectKey: 'meta',
      nodeTextEdit: false,
      textMode: 'TEXT',
    },
    getPointByClient: jest.fn(() => ({
      canvasOverlayPosition: { x: 0, y: 0 },
      domOverlayPosition: { x: 0, y: 0 },
    })),
    selectNodeById: jest.fn(),
    setElementStateById: jest.fn(),
    toFront: jest.fn(),
  }
  const node = new TestNode({ model, graphModel } as any)
  ;(node as any).props = { model, graphModel }
  node.startTime = Date.now()
  node.mouseUpDrag = true
  return { node, model, graphModel }
}

describe('issue 2406', () => {
  const originalRequestAnimationFrame = window.requestAnimationFrame

  beforeEach(() => {
    window.requestAnimationFrame = ((callback: FrameRequestCallback) => {
      callback(0)
      return 0
    }) as typeof window.requestAnimationFrame
  })

  afterEach(() => {
    window.requestAnimationFrame = originalRequestAnimationFrame
    jest.restoreAllMocks()
  })

  test('does not steal focus from nested form controls on node click', () => {
    const { node } = createNode()
    const nodeElement = document.createElement('g') as any
    nodeElement.focus = jest.fn()
    const input = document.createElement('input')
    nodeElement.appendChild(input)

    node.handleClick({
      button: 0,
      clientX: 0,
      clientY: 0,
      currentTarget: nodeElement,
      target: input,
      detail: 1,
      metaKey: false,
      altKey: false,
      shiftKey: false,
      ctrlKey: false,
    } as any)

    expect(nodeElement.focus).not.toHaveBeenCalled()
  })
})
