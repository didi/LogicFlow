import {
  DEFAULT_VISIBLE_SPACE,
  ELEMENT_MAX_Z_INDEX,
  DEFAULT_GRID_SIZE,
  ElementState,
  ElementType,
  ModelType,
} from '../../src/constant'

describe('Constants', () => {
  test('DEFAULT_VISIBLE_SPACE should be 200', () => {
    expect(DEFAULT_VISIBLE_SPACE).toBe(200)
  })

  test('ELEMENT_MAX_Z_INDEX should be 9999', () => {
    expect(ELEMENT_MAX_Z_INDEX).toBe(9999)
  })

  test('DEFAULT_GRID_SIZE should be 10', () => {
    expect(DEFAULT_GRID_SIZE).toBe(10)
  })

  test('ElementState enum should have correct values', () => {
    expect(ElementState.DEFAULT).toBe(1)
    expect(ElementState.TEXT_EDIT).toBeDefined()
    expect(ElementState.SHOW_MENU).toBeDefined()
    expect(ElementState.ALLOW_CONNECT).toBeDefined()
    expect(ElementState.NOT_ALLOW_CONNECT).toBeDefined()
  })

  test('ElementType enum should have correct values', () => {
    expect(ElementType.NODE).toBe('node')
    expect(ElementType.EDGE).toBe('edge')
    expect(ElementType.GRAPH).toBe('graph')
  })

  test('ModelType enum should be defined', () => {
    expect(ModelType).toBeDefined()
  })
})
