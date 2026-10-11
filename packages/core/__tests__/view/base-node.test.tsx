import { createElement as h } from 'preact/compat'

jest.mock('../../src/LogicFlow', () => ({ __esModule: true, default: {} }))
jest.mock('../../src/model', () => ({}))
jest.mock('../../src/view/Anchor', () => ({
  __esModule: true,
  default: () => null,
}))
jest.mock('../../src/view/text', () => ({ BaseText: () => null }))
jest.mock('../../src/view/Rotate', () => ({
  __esModule: true,
  default: () => null,
}))
jest.mock('../../src/view/Control', () => ({
  __esModule: true,
  default: () => null,
}))
jest.mock('../../src/constant', () => ({
  ElementState: {
    ALLOW_CONNECT: 'ALLOW_CONNECT',
    NOT_ALLOW_CONNECT: 'NOT_ALLOW_CONNECT',
  },
  EventType: {},
  TextMode: { TEXT: 'TEXT' },
}))
jest.mock('../../src/util', () => ({
  StepDrag: class {
    setStep = jest.fn()
    handleMouseDown = jest.fn()
    setModel = jest.fn()
  },
  snapToGrid: jest.fn((value) => value),
  isIe: jest.fn(() => false),
  isMultipleSelect: jest.fn(() => false),
  cancelRaf: jest.fn(),
  createRaf: jest.fn(),
}))

import BaseNode from '../../src/view/node/BaseNode'

class TestNode extends BaseNode<any> {
  getShape() {
    return <g />
  }
}

const createBaseNode = () => {
  const model = {
    id: 'node-1',
    anchors: [],
    autoToFront: false,
    draggable: true,
    isDragging: false,
    isHitable: true,
    isHovered: false,
    isSelected: false,
    isShowAnchor: false,
    transform: '',
    getData: jest.fn(() => ({ id: 'node-1' })),
    getOuterGAttributes: jest.fn(() => ({})),
  }
  const graphModel = {
    gridSize: 10,
    eventCenter: { emit: jest.fn() },
    transformModel: { SCALE_X: 2 },
    editConfigModel: {
      adjustNodePosition: true,
      allowResize: false,
      allowRotate: false,
      hideAnchors: false,
    },
  }
  const node = new TestNode({
    model,
    graphModel,
  } as any)
  ;(node as any).props = { model, graphModel }

  jest.spyOn(node.stepDrag, 'setStep')
  jest.spyOn(node.stepDrag, 'handleMouseDown').mockImplementation(jest.fn())

  return { node }
}

describe('BaseNode drag step', () => {
  test('updates scaled drag step on pointer down instead of render', () => {
    const { node } = createBaseNode()

    node.render()

    expect(node.stepDrag.setStep).not.toHaveBeenCalled()

    const ev = {
      clientX: 12,
      clientY: 24,
      pointerType: 'mouse',
    } as PointerEvent

    node.handleMouseDown(ev)

    expect(node.stepDrag.setStep).toHaveBeenCalledWith(20)
    expect(node.stepDrag.handleMouseDown).toHaveBeenCalledWith(ev)
    expect(
      (node.stepDrag.setStep as jest.Mock).mock.invocationCallOrder[0],
    ).toBeLessThan(
      (node.stepDrag.handleMouseDown as jest.Mock).mock.invocationCallOrder[0],
    )
  })
})
