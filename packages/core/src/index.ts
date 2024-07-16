import { observer as mobxObserver } from 'mobx-preact'
import { createElement as h, createRef, Component } from 'preact/compat'
import LogicFlow from './LogicFlow'

import * as LogicFlowUtil from './util'

export function observer<P>(props: P) {
  return mobxObserver(props as any)
}

export { LogicFlow, h, createRef, Component, LogicFlowUtil }

export * from './util'
export * from './tool'
export * from './view'
export * from './model'
export * from './options'
export * from './keyboard'
export * from './constant'
export * from './algorithm'
export * from './event/eventEmitter'
export { ElementState, ModelType, ElementType, EventType } from './constant'

export { formatAnchorConnectValidateData } from './util/node'

export default LogicFlow
