import { BaseNodeModel, Model } from '@logicflow/core'
import {
  DG_OPERATE_BTN_HEIGHT,
  DG_OPERATE_BTN_WIDTH,
  DG_OPERATE_INSET,
} from '../dynamic-group/utils'
import { poolConfig, TitlePosition } from './constant'
import BoxBoundsPoint = Model.BoxBoundsPoint

type TitleLayoutBounds = {
  x: number
  y: number
  width: number
  height: number
}

type TitleLayoutRect = TitleLayoutBounds

type TitleLayoutDivider = {
  x1: number
  y1: number
  x2: number
  y2: number
}

export type TitleLayout = {
  titleBox: TitleLayoutRect
  contentBox: TitleLayoutRect
  divider: TitleLayoutDivider
  textAnchor: { x: number; y: number }
}

/** 标题区内折叠按钮的左上角坐标。 */
export function getTitleOperateIconPosition(
  titleBox: TitleLayoutRect,
  position: TitlePosition,
) {
  const minX = titleBox.x - titleBox.width / 2
  const maxX = titleBox.x + titleBox.width / 2 - DG_OPERATE_BTN_WIDTH
  const minY = titleBox.y - titleBox.height / 2
  const maxY = titleBox.y + titleBox.height / 2 - DG_OPERATE_BTN_HEIGHT
  const isHorizontalTitle = position === 'top' || position === 'bottom'
  // 按钮沿标题条长轴靠起始端，沿短轴居中，既符合边的方向也不占用居中标题。
  const preferredX = isHorizontalTitle
    ? minX + DG_OPERATE_INSET
    : titleBox.x - DG_OPERATE_BTN_WIDTH / 2
  const preferredY = isHorizontalTitle
    ? titleBox.y - DG_OPERATE_BTN_HEIGHT / 2
    : minY + DG_OPERATE_INSET

  return {
    x: Math.max(minX, Math.min(preferredX, maxX)),
    y: Math.max(minY, Math.min(preferredY, maxY)),
  }
}

function isTitlePosition(value: unknown): value is TitlePosition {
  return (
    value === 'top' ||
    value === 'right' ||
    value === 'bottom' ||
    value === 'left'
  )
}

/**
 * 解析泳池标题位置。新配置优先，旧 direction 只负责兼容历史数据。
 */
export function resolvePoolTitlePosition(
  properties: Record<string, any> = {},
): TitlePosition {
  if (isTitlePosition(properties.titlePosition)) {
    return properties.titlePosition
  }

  // 兼容旧数据：horizontal 的标题在左侧，vertical 的标题在顶部。
  if (properties.direction === 'vertical') return 'top'
  if (properties.direction === 'horizontal') return 'left'
  return poolConfig.titlePosition
}

/**
 * 解析泳道标题位置。泳道自身配置优先，否则跟随泳池配置。
 */
export function resolveLaneTitlePosition(
  laneProperties: Record<string, any> = {},
  poolProperties: Record<string, any> = {},
): TitlePosition {
  if (isTitlePosition(laneProperties.titlePosition)) {
    return laneProperties.titlePosition
  }

  const poolLaneTitlePosition = poolProperties.laneConfig?.titlePosition
  if (isTitlePosition(poolLaneTitlePosition)) {
    return poolLaneTitlePosition
  }

  return resolvePoolTitlePosition(poolProperties)
}

/**
 * 计算标题区、内容区、分隔线和文本锚点。
 *
 * 所有矩形都使用中心点坐标，与 LogicFlow 节点模型的 x/y 定义保持一致。
 * titleSize 只会切分标题所在的轴，不会改变另一轴的尺寸。
 */
export function getTitleLayout(
  bounds: TitleLayoutBounds,
  position: TitlePosition,
  titleSize: number,
): TitleLayout {
  const { x, y, width, height } = bounds
  const left = x - width / 2
  const right = x + width / 2
  const top = y - height / 2
  const bottom = y + height / 2
  // 标题区只能占用自身所在的轴，避免窄边标题挤出内容区形成负尺寸。
  const titleAxisSize =
    position === 'top' || position === 'bottom' ? height : width
  const safeTitleSize = Math.max(0, Math.min(titleSize, titleAxisSize))

  switch (position) {
    case 'right': {
      // 右侧标题的分隔线位于内容区与标题区交界处。
      const dividerX = right - safeTitleSize
      return {
        titleBox: {
          x: right - safeTitleSize / 2,
          y,
          width: safeTitleSize,
          height,
        },
        contentBox: {
          x: left + (width - safeTitleSize) / 2,
          y,
          width: width - safeTitleSize,
          height,
        },
        divider: { x1: dividerX, y1: top, x2: dividerX, y2: bottom },
        textAnchor: { x: right - safeTitleSize / 2, y },
      }
    }
    case 'bottom': {
      const dividerY = bottom - safeTitleSize
      return {
        titleBox: {
          x,
          y: bottom - safeTitleSize / 2,
          width,
          height: safeTitleSize,
        },
        contentBox: {
          x,
          y: top + (height - safeTitleSize) / 2,
          width,
          height: height - safeTitleSize,
        },
        divider: { x1: left, y1: dividerY, x2: right, y2: dividerY },
        textAnchor: { x, y: bottom - safeTitleSize / 2 },
      }
    }
    case 'top': {
      const dividerY = top + safeTitleSize
      return {
        titleBox: {
          x,
          y: top + safeTitleSize / 2,
          width,
          height: safeTitleSize,
        },
        contentBox: {
          x,
          y: bottom - (height - safeTitleSize) / 2,
          width,
          height: height - safeTitleSize,
        },
        divider: { x1: left, y1: dividerY, x2: right, y2: dividerY },
        textAnchor: { x, y: top + safeTitleSize / 2 },
      }
    }
    case 'left':
    default: {
      const dividerX = left + safeTitleSize
      return {
        titleBox: {
          x: left + safeTitleSize / 2,
          y,
          width: safeTitleSize,
          height,
        },
        contentBox: {
          x: right - (width - safeTitleSize) / 2,
          y,
          width: width - safeTitleSize,
          height,
        },
        divider: { x1: dividerX, y1: top, x2: dividerX, y2: bottom },
        textAnchor: { x: left + safeTitleSize / 2, y },
      }
    }
  }
}

export function getPoolTitleForeignObjectRect(options: {
  titleBox: { x: number; y: number; width: number; height: number }
  textAnchor: { x: number; y: number }
  isVerticalTitle: boolean
}) {
  const { titleBox, textAnchor, isVerticalTitle } = options
  const foWidth = isVerticalTitle ? titleBox.height : titleBox.width
  const foHeight = isVerticalTitle ? titleBox.width : titleBox.height
  return {
    foX: textAnchor.x - foWidth / 2,
    foY: textAnchor.y - foHeight / 2,
    foWidth,
    foHeight,
  }
}

/**
 *
 * @param bounds
 * @param group
 */
export function isBoundsInLane(bounds: BoxBoundsPoint, group: BaseNodeModel) {
  const { minX, minY, maxX, maxY } = bounds
  const { x, y, width, height } = group
  return (
    minX >= x - width / 2 &&
    maxX <= x + width / 2 &&
    minY >= y - height / 2 &&
    maxY <= y + height / 2
  )
}

/**
 * 判断 bounds 是否可以移动到下一个范围
 * @param groupBounds
 * @param node
 * @param deltaX
 * @param deltaY
 */
export function isAllowMoveTo(
  groupBounds: BoxBoundsPoint,
  node: BaseNodeModel,
  deltaX: number,
  deltaY: number,
) {
  const { minX, minY, maxX, maxY } = groupBounds
  const { x, y, width, height } = node

  // DONE: 计算节点坐标 (x, y) 可移动的范围，并判断 x + deltaX, y + deltaY 是否在范围内
  const allowMoveMinX = minX + width / 2
  const allowMoveMinY = minY + height / 2
  const allowMoveMaxX = maxX - width / 2
  const allowMoveMaxY = maxY - height / 2

  return {
    x: x + deltaX >= allowMoveMinX && x + deltaX <= allowMoveMaxX,
    y: y + deltaY >= allowMoveMinY && y + deltaY <= allowMoveMaxY,
  }
}
