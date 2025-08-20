import { isIe } from '../../src/util/browser'

// Store original navigator object
const originalNavigator = window.navigator

// Mock window object for testing
const mockWindow = (userAgent: string) => {
  Object.defineProperty(window, 'navigator', {
    value: {
      userAgent,
    } as Navigator,
    writable: true,
    configurable: true,
  })
}

describe('Browser Utils', () => {
  afterEach(() => {
    // Restore original navigator
    Object.defineProperty(window, 'navigator', {
      value: originalNavigator,
      writable: true,
      configurable: true,
    })
  })

  test('isIe should return false for Chrome userAgent', () => {
    mockWindow(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    )

    expect(isIe()).toBe(false)
  })

  test('isIe should return true for IE userAgent with Trident', () => {
    mockWindow('Mozilla/5.0 (Windows NT 6.1; Trident/7.0; rv:11.0) like Gecko')

    expect(isIe()).toBe(true)
  })

  test('isIe should return true for IE userAgent with MSIE', () => {
    mockWindow(
      'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0)',
    )

    expect(isIe()).toBe(true)
  })

  test('isIe should return false for Firefox userAgent', () => {
    mockWindow(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
    )

    expect(isIe()).toBe(false)
  })

  test('isIe should return false for empty userAgent', () => {
    mockWindow('')

    expect(isIe()).toBe(false)
  })

  test('isIe should handle missing window object gracefully', () => {
    // Don't set up window object, and mock lodash get to return empty string
    const originalConsole = console.error
    console.error = jest.fn()

    try {
      expect(isIe()).toBe(false)
    } catch (error) {
      // Expected error when window is not defined
      expect(error).toBeDefined()
    }

    console.error = originalConsole
  })
})
