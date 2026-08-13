export type TitlePosition = 'top' | 'right' | 'bottom' | 'left'

// 泳池配置常量
export const poolConfig = {
  // 默认尺寸
  defaultWidth: 120,
  defaultHeight: 120,
  // Pool 折叠后使用更宽的固定节点，避免折叠按钮遮挡居中标题。
  collapsedWidth: 120,
  collapsedHeight: 80,
  // 标题区域
  titleSize: 60,
  titlePosition: 'left' as TitlePosition,
  poolMinSize: 20,
}

export const laneConfig = {
  defaultWidth: 120,
  defaultHeight: 120,
  titleSize: 40,
  collapsedLaneGap: 12,
  iconSize: 20,
  iconSpacing: 15,
}

export const poolBehaviorConfig = {
  cascadeDeleteChildren: true,
  minLaneCount: 1,
  collapse: {
    pool: true,
    lane: true,
  },
}

export default null
