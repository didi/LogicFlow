// 统一对外导出
import { observer as mobxObserver } from 'mobx-preact'
import { h } from 'preact'
import LogicFlow from './LogicFlow'

import * as LogicFlowUtil from './util'

export function observer<P>(props: P) {
  return mobxObserver(props as any)
}

export { LogicFlow, h, LogicFlowUtil }

export * from './view'
export * from './model'
export * from './options'
export * from './keyboard'
export { ElementState, ModelType, ElementType, EventType } from './constant'

export { formateAnchorConnectValidateData } from './util/node'

export default LogicFlow
