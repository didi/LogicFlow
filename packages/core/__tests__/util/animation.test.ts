import {
  defaultAnimationOffConfig,
  defaultAnimationOnConfig,
  setupAnimation,
  updateAnimation,
} from '../../src/util/animation'

describe('Animation Utils', () => {
  test('defaultAnimationOffConfig should have correct values', () => {
    expect(defaultAnimationOffConfig).toEqual({
      node: false,
      edge: false,
    })
  })

  test('defaultAnimationOnConfig should have correct values', () => {
    expect(defaultAnimationOnConfig).toEqual({
      node: true,
      edge: true,
    })
  })

  test('setupAnimation with false should return off config', () => {
    const result = setupAnimation(false)
    expect(result).toEqual({
      node: false,
      edge: false,
    })
  })

  test('setupAnimation with true should return on config', () => {
    const result = setupAnimation(true)
    expect(result).toEqual({
      node: true,
      edge: true,
    })
  })

  test('setupAnimation with undefined should return off config', () => {
    const result = setupAnimation()
    expect(result).toEqual({
      node: false,
      edge: false,
    })
  })

  test('setupAnimation with partial config should merge with default', () => {
    const result = setupAnimation({ node: true })
    expect(result).toEqual({
      node: true,
      edge: false,
    })
  })

  test('updateAnimation should be same as setupAnimation', () => {
    expect(updateAnimation).toBe(setupAnimation)
  })
})
