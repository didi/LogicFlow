import LogicFlow from '@logicflow/core'
import { dynamicGroup, DynamicGroupNodeModel } from '@logicflow/extension'

/**
 * 回归示例图数据约定：所有节点的展示文本与 `id` 保持一致。
 * - 字符串 text：直接使用 `id`
 * - 对象 text：`value` 必须为 `id`（位置等其它字段可单独设置）
 * 新建场景请优先使用 `makeNode` / `makeGroup` / `nodeText`。
 */

/** 对象形态的节点 text，`value` 与 `id` 一致 */
export function nodeText(
  id: string,
  x: number,
  y: number,
  extra: Record<string, unknown> = {},
) {
  return { value: id, x, y, ...extra }
}

export function makeNode(
  id: string,
  type: string,
  x: number,
  y: number,
  extra: Record<string, unknown> = {},
) {
  return {
    id,
    type,
    x,
    y,
    text: id,
    ...extra,
  }
}

/** #2412：isRestrict + isAllowAppendIn 恒 false */
export class LockedGroupModel extends DynamicGroupNodeModel {
  initNodeData(data: LogicFlow.NodeConfig) {
    super.initNodeData(data)
    this.isRestrict = true
    this.properties = {
      ...this.properties,
      isRestrict: true,
    }
  }

  isAllowAppendIn() {
    return false
  }
}

export function registerLockedGroup(lf: LogicFlow) {
  if (lf.graphModel.modelMap.get('locked-dynamic-group')) return
  lf.register({
    type: 'locked-dynamic-group',
    view: dynamicGroup.view,
    model: LockedGroupModel,
  })
}

export const baseGroupProps = {
  width: 320,
  height: 200,
  collapsedWidth: 80,
  collapsedHeight: 60,
  collapsible: true,
  isCollapsed: false,
  isRestrict: false,
}

export function makeGroup(
  id: string,
  x: number,
  y: number,
  children: string[],
  extra: Record<string, unknown> = {},
  type = 'dynamic-group',
) {
  return {
    id,
    type,
    x,
    y,
    text: id,
    resizable: true,
    rotatable: false,
    properties: {
      ...baseGroupProps,
      children,
      ...extra,
    },
  }
}
