/* eslint-env jest */
/* eslint-env browser */
/* eslint-env node */
// Jest setup file

// Mock DOM APIs that may not be available in jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock DOMRect
global.DOMRect = {
  fromRect: () => ({
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: 0,
    height: 0,
  }),
}

// Mock SVG getBBox
Object.defineProperty(SVGElement.prototype, 'getBBox', {
  writable: true,
  value: jest.fn().mockReturnValue({ x: 0, y: 0, width: 0, height: 0 }),
})
