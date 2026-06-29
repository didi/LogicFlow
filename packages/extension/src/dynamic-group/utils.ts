import { BaseNodeModel, Model } from '@logicflow/core'
import BoxBoundsPoint = Model.BoxBoundsPoint

/**
 *
 * @param bounds
 * @param group
 */
export function isBoundsInGroup(bounds: BoxBoundsPoint, group: BaseNodeModel) {
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

/**
 * 计算直接子节点的 bounds 并集。
 * 无有效子节点时返回 null。
 */
export function getChildrenBounds(
  groupModel: { children?: Set<string> },
  getNodeById: (id: string) => BaseNodeModel | undefined,
): BoxBoundsPoint | null {
  if (!groupModel.children || groupModel.children.size === 0) {
    return null
  }

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  let hasChild = false

  for (const childId of Array.from(groupModel.children)) {
    const child = getNodeById(childId)
    if (!child) {
      continue
    }
    hasChild = true
    const childBounds = child.getBounds()
    minX = Math.min(minX, childBounds.minX)
    minY = Math.min(minY, childBounds.minY)
    maxX = Math.max(maxX, childBounds.maxX)
    maxY = Math.max(maxY, childBounds.maxY)
  }

  if (!hasChild) {
    return null
  }

  return { minX, minY, maxX, maxY }
}

/**
 * 判断 groupBounds 是否完全包含 childrenBounds。
 */
export function isGroupBoundsContainsChildren(
  groupBounds: BoxBoundsPoint,
  childrenBounds: BoxBoundsPoint,
): boolean {
  return (
    groupBounds.minX <= childrenBounds.minX &&
    groupBounds.minY <= childrenBounds.minY &&
    groupBounds.maxX >= childrenBounds.maxX &&
    groupBounds.maxY >= childrenBounds.maxY
  )
}

/** 折叠按钮距节点顶边/左边的默认 inset，与 node.getOperateIcon 一致 */
export const DG_OPERATE_INSET = 10
/** @deprecated 使用 DG_OPERATE_INSET */
export const DG_OPERATE_INSET_TOP = DG_OPERATE_INSET
export const DG_OPERATE_BTN_WIDTH = 14
export const DG_OPERATE_BTN_HEIGHT = 12
/** 左对齐时推荐用于避开 operator 的 wrapPadding.left（inset + btn + inset） */
export const DG_TITLE_LEFT_CLEARANCE =
  DG_OPERATE_INSET + DG_OPERATE_BTN_WIDTH + DG_OPERATE_INSET

export const DEFAULT_TITLE_WRAP_PADDING = '0,0,0,0'
export const DEFAULT_TITLE_TEXT_ALIGN = 'center'

export type TitleBand = {
  bandLeft: number
  bandTop: number
  bandWidth: number
  bandHeight: number
}

export type TitleForeignObjectRect = {
  foX: number
  foY: number
  foWidth: number
  foHeight: number
}

export function getTitleBand(options: {
  x: number
  y: number
  width: number
  height: number
}): TitleBand {
  const { x, y, width, height } = options
  const left = x - width / 2
  const top = y - height / 2
  return {
    bandLeft: left,
    bandTop: top + DG_OPERATE_INSET,
    bandWidth: width,
    bandHeight: height - DG_OPERATE_INSET,
  }
}

export function resolveTitleTextPosition(options: {
  x: number
  y: number
  width: number
  height: number
  textAlign: string
  pad: ReturnType<typeof parseWrapPadding>
}): { x: number; y: number } {
  const { x, width, height, textAlign, pad } = options
  const { bandLeft, bandTop, bandWidth } = getTitleBand({
    x,
    y: options.y,
    width,
    height,
  })
  const contentLeft = bandLeft + pad.left
  const contentRight = bandLeft + bandWidth - pad.right
  const contentTop = bandTop + pad.top
  const contentCenterX =
    contentLeft + Math.max(0, contentRight - contentLeft) / 2

  if (textAlign === 'left') {
    return { x: contentLeft, y: contentTop }
  }
  if (textAlign === 'right') {
    return { x: contentRight, y: contentTop }
  }
  return { x: contentCenterX, y: contentTop }
}

export function getTitleForeignObjectRect(options: {
  x: number
  y: number
  width: number
  height: number
  overflowMode: 'autoWrap' | 'ellipsis'
  fontSize: number
  pad: ReturnType<typeof parseWrapPadding>
}): TitleForeignObjectRect {
  const { bandLeft, bandTop, bandWidth, bandHeight } = getTitleBand(options)
  const { overflowMode, fontSize, pad } = options
  const foX = bandLeft
  const foY = bandTop
  const foWidth = bandWidth
  const foHeight =
    overflowMode === 'ellipsis'
      ? pad.top + fontSize + 2 + pad.bottom
      : bandHeight

  return { foX, foY, foWidth, foHeight }
}

export function parseWrapPadding(padding?: string | number | null): {
  top: number
  right: number
  bottom: number
  left: number
} {
  if (padding === undefined || padding === null || padding === '') {
    return { top: 0, right: 0, bottom: 0, left: 0 }
  }
  if (typeof padding === 'number') {
    const n = Math.max(0, padding)
    return { top: n, right: n, bottom: n, left: n }
  }
  const parts = String(padding)
    .split(/[\s,]+/)
    .filter(Boolean)
    .map((s) => parseFloat(s.replace(/px$/i, '')) || 0)
  if (parts.length === 1) {
    const n = parts[0]
    return { top: n, right: n, bottom: n, left: n }
  }
  if (parts.length === 2) {
    return { top: parts[0], right: parts[1], bottom: parts[0], left: parts[1] }
  }
  if (parts.length === 3) {
    return {
      top: parts[0],
      right: parts[1],
      bottom: parts[2],
      left: parts[1],
    }
  }
  return {
    top: parts[0],
    right: parts[1],
    bottom: parts[2],
    left: parts[3],
  }
}

export function textAlignToAnchor(
  textAlign?: string,
): 'start' | 'middle' | 'end' {
  if (textAlign === 'left') return 'start'
  if (textAlign === 'right') return 'end'
  return 'middle'
}

export function isHtmlTextOverflow(overflowMode?: string): boolean {
  return overflowMode === 'autoWrap' || overflowMode === 'ellipsis'
}

/** LogicFlow 存储格式 `15,8,4,8` → CSS padding `15px 8px 4px 8px` */
export function formatWrapPaddingCss(padding?: string | number | null): string {
  const p = parseWrapPadding(padding)
  return `${p.top}px ${p.right}px ${p.bottom}px ${p.left}px`
}
