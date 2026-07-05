/**
 * @jest-environment jsdom
 */
import { LogicFlow } from '../../src/index'

function createLf(options: ConstructorParameters<typeof LogicFlow>[0]) {
  const dom = document.createElement('div')
  document.body.appendChild(dom)
  return new LogicFlow({ container: dom, ...options })
}

describe('gridSize sync with grid.size', () => {
  test('grid: number + snapGrid: true sets gridSize to that number', () => {
    const lf = createLf({ grid: 20, snapGrid: true })
    expect(lf.graphModel.gridSize).toBe(20)
  })

  test('grid: true + snapGrid: true sets gridSize to default grid size', () => {
    const lf = createLf({ grid: true, snapGrid: true })
    expect(lf.graphModel.gridSize).toBe(10)
  })

  test('grid: object + snapGrid: true sets gridSize to grid.size', () => {
    const lf = createLf({ grid: { size: 30 }, snapGrid: true })
    expect(lf.graphModel.gridSize).toBe(30)
  })

  test('grid: number + snapGrid: false keeps gridSize at 1 (snap off)', () => {
    const lf = createLf({ grid: 20, snapGrid: false })
    expect(lf.graphModel.gridSize).toBe(1)
  })
})

describe('grid options', () => {
  test('grid: false hides the grid', () => {
    const lf = createLf({ grid: false })
    expect(lf.graphModel.grid.visible).toBe(false)
  })

  test('grid: true uses generic defaultGrid even with a non-default themeMode', () => {
    const lf = createLf({ grid: true, themeMode: 'dark' })
    expect(lf.graphModel.grid.visible).toBe(true)
    expect(lf.graphModel.grid.type).toBe('mesh')
    expect(lf.graphModel.grid.config?.color).toBe('#D7DEEB')
  })

  test('grid: number sets size and keeps the grid visible', () => {
    const lf = createLf({ grid: 20, themeMode: 'dark' })
    expect(lf.graphModel.grid.visible).toBe(true)
    expect(lf.graphModel.grid.size).toBe(20)
  })

  test('grid object merges theme defaults before applying user overrides', () => {
    const lf = createLf({
      themeMode: 'retro',
      grid: { visible: false, size: 30 },
    })
    expect(lf.graphModel.grid.visible).toBe(false)
    expect(lf.graphModel.grid.size).toBe(30)
    expect(lf.graphModel.grid.type).toBe('dot')
    expect(lf.graphModel.grid.config?.color).toBe('#ababab')
  })
})
