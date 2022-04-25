// 统一对外导出
import LogicFlow from './LogicFlow';
import * as LogicFlowUtil from './util';
// @ts-ignore
import { version } from '../package.json';

export { h } from 'preact';

export * from './util/stateUtil';

export { LogicFlowUtil, version, LogicFlow };

export * from './type/index';
export * from './view';
export * from './model';
export * from './keyboard';
export * from './options';

export default LogicFlow;
