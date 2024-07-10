import { observer as mobxObserver } from 'mobx-preact'
import { createElement as h, createRef, Component } from 'preact/compat'
import LogicFlow from './LogicFlow'

import * as LogicFlowUtil from './util'

export function observer<P>(props: P) {
  return mobxObserver(props as any)
}

export { LogicFlow, h, createRef, Component, LogicFlowUtil }

export * from './view'
export * from './model'
export * from './options'
export * from './keyboard'
export { ElementState, ModelType, ElementType, EventType } from './constant'

export { formatAnchorConnectValidateData } from './util/node'

export default LogicFlow
