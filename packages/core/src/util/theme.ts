import { cloneDeep, merge, assign } from 'lodash-es'
import LogicFlow from '../LogicFlow'
import {
  themeModeMap,
  backgroundModeMap,
  defaultBackground,
  gridModeMap,
  defaultGrid,
} from '../constant/theme'

/* 主题（全局样式）相关工具方法 */
export const setupTheme = (
  customTheme?: Partial<LogicFlow.Theme>,
  themeMode?: LogicFlow.ThemeMode | string,
): LogicFlow.Theme => {
  let theme =
    cloneDeep(themeModeMap[themeMode || 'default']) ||
    cloneDeep(themeModeMap.default)
  if (customTheme) {
    /**
     * 为了不让默认样式被覆盖，使用 merge 方法
     * @docs https://lodash.com/docs/4.17.15#merge
     * 例如：锚点主题 hover，用户传入如下 ->
     * lf.setTheme({
     *   anchor: {
     *     fill: 'red'
     *   }
     * })
     *
     * 预期得到的结果如下：
     * {
     *   // ...
     *   anchor: {
     *     stroke: '#000',
     *     fill: 'red',
     *     r: 4,
     *     hover: {
     *       r: 10,
     *       fill: '#949494',
     *       fillOpacity: 0.5,
     *       stroke: '#949494',
     *     },
     *   },
     *   // ...
     * }
     */
    theme = merge(theme, customTheme)
  }
  return theme
}

export const addThemeMode = (
  themeMode: string,
  style: Partial<LogicFlow.Theme>,
): void => {
  if (themeModeMap[themeMode]) {
    console.warn(`theme mode ${themeMode} already exists`)
    return
  }
  themeModeMap[themeMode] = style
  backgroundModeMap[themeMode] = style.background || defaultBackground
  gridModeMap[themeMode] = style.grid || defaultGrid
}

export const removeThemeMode = (themeMode: string): void => {
  delete themeModeMap[themeMode]
  delete backgroundModeMap[themeMode]
  delete gridModeMap[themeMode]
}

export const clearThemeMode = (): void => {
  const resetTheme = {
    colorful: {},
    dark: {},
    retro: {},
    default: {},
  }
  assign(themeModeMap, resetTheme)
  assign(backgroundModeMap, resetTheme)
  assign(gridModeMap, resetTheme)
}

/* 更新 theme 方法 */
export const updateTheme = setupTheme
