// 统一对外导出
import { observer as mobxObserver } from 'mobx-react'
import { h } from 'preact'
import LogicFlow from './LogicFlow'

import * as LogicFlowUtil from './util'

export function observer<P>(props: P) {
  return mobxObserver(props as any)
}

export { LogicFlow, h }

export { LogicFlowUtil }

export * from './type/index'
export * from './view'
export * from './model'
export * from './keyboard'
export * from './options'
export {
  ElementState,
  ModelType,
  ElementType,
  EventType,
} from './constant/constant'

export { formateAnchorConnectValidateData } from './util/node'

export default LogicFlow
