// Jest setup file for mocking browser APIs not available in jsdom

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback
  }

  callback: ResizeObserverCallback

  observe(): void {
    // Mock implementation
  }

  unobserve(): void {
    // Mock implementation
  }

  disconnect(): void {
    // Mock implementation
  }
}
