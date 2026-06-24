import { EventType } from '@logicflow/core'

/** extension 插件自定义事件（非 @logicflow/core EventType） */
export enum ExtensionEventType {
  GROUP_ADD_NODE = 'group:add-node',
  GROUP_REMOVE_NODE = 'group:remove-node',
  GROUP_NOT_ALLOWED = 'group:not-allowed',
}

/** 常用于 lf.on / lf.off 的组合事件名 */
export const NODE_DRAG_EVENTS = `${EventType.NODE_DRAG},${EventType.NODE_DND_DRAG}`

export const NODE_ADD_DROP_DND_EVENTS = `${EventType.NODE_ADD},${EventType.NODE_DROP},${EventType.NODE_DND_ADD}`
