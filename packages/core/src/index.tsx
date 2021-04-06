// 统一对外导出
import { observer as mobxObserver } from 'mobx-react';
import LogicFlow from './LogicFlow';

export function observer<P>(props: P) {
  return mobxObserver(props as any);
}

export {
  LogicFlow,
};

export * from './type/index';
export * from './model';
export * from './keyboard';
export * from './options';

export default LogicFlow;
