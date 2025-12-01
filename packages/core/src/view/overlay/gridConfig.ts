/**
 * 网格高级 majorBold 配置。
 *
 * 示例（布尔值）：
 *  - false：禁用特殊样式，opacity=1，无加粗，无虚线
 *  - true：启用默认值，opacity=0.75，每第 5 条线/点加粗/实线，
 *          虚线图案通过 getDashArrayForSize(size) 计算
 *
 * 示例（对象）：
 * {
 *   opacity: 0.6,
 *   boldIndices: [4, 8],
 *   dashArrayConfig: { baseSize: 8, pattern: [] },
 *   customBoldWidth: 2,
 * }
 */
export type MajorBoldConfig = {
  /** 默认网格透明度 (0-1) */
  opacity: number
  /** 一个周期内需要加粗/实线的索引列表 */
  boldIndices: number[]
  /** 虚线样式的计算配置 */
  dashArrayConfig: {
    /** 期望的平均周期像素，用于估算段数 */
    baseSize: number
    /** 固定的虚线模式（可选） */
    pattern: number[]
  }
  /** mesh 网格的自定义加粗线宽（可选） */
  customBoldWidth?: number
}

export const defaultGridConfig: MajorBoldConfig = {
  opacity: 1,
  boldIndices: [5],
  dashArrayConfig: {
    baseSize: 10,
    pattern: [],
  },
}

/**
 * 校验并规范化 GridConfig。
 * - 将 opacity 限制在 [0,1] 范围
 * - boldIndices 过滤为正整数并去重
 * - baseSize 保证为正数
 */
export function validateGridConfig(cfg: MajorBoldConfig): MajorBoldConfig {
  console.log('validateGridConfig', cfg)
  const opacity = Math.max(
    0,
    Math.min(1, cfg.opacity ?? defaultGridConfig.opacity),
  )
  const boldIndicesSet = new Set<number>()
  const boldRaw = Array.isArray(cfg.boldIndices)
    ? cfg.boldIndices
    : defaultGridConfig.boldIndices
  for (const n of boldRaw) {
    if (typeof n === 'number' && Number.isFinite(n) && n > 0) {
      boldIndicesSet.add(Math.floor(n))
    }
  }
  const boldIndices = Array.from(boldIndicesSet)
  const baseSize =
    cfg.dashArrayConfig?.baseSize ?? defaultGridConfig.dashArrayConfig.baseSize
  const pattern = Array.isArray(cfg.dashArrayConfig?.pattern)
    ? cfg.dashArrayConfig.pattern
    : defaultGridConfig.dashArrayConfig.pattern
  const dashArrayConfig = {
    baseSize:
      baseSize > 0 ? baseSize : defaultGridConfig.dashArrayConfig.baseSize,
    pattern,
  }
  const customBoldWidth = cfg.customBoldWidth
  return {
    opacity,
    boldIndices: boldIndices.length
      ? boldIndices
      : defaultGridConfig.boldIndices,
    dashArrayConfig,
    customBoldWidth,
  }
}

/**
 * 合并用户行为配置与默认值。
 * - false → 关闭模式：opacity=1，bold=[]，关闭虚线
 * - true → 默认模式：采用 defaultGridConfig
 * - object → 自定义模式：校验后使用用户配置
 */
export function mergeMajorBoldConfig(input?: boolean | MajorBoldConfig): {
  mode: 'disabled' | 'default' | 'custom'
  config: MajorBoldConfig
} {
  if (input === false) {
    return {
      mode: 'disabled',
      config: {
        opacity: 1,
        boldIndices: [],
        dashArrayConfig: {
          baseSize: defaultGridConfig.dashArrayConfig.baseSize,
          pattern: [],
        },
      },
    }
  }
  if (input === true || input == null) {
    return { mode: 'default', config: { ...defaultGridConfig } }
  }
  return { mode: 'custom', config: validateGridConfig(input) }
}
