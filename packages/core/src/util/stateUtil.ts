import { configure } from 'mobx';
import { observer as mobxObserver } from 'mobx-react';

configure({ isolateGlobalState: true });

export {
  action,
  observable,
  computed,
  makeObservable,
  configure,
  toJS,
  isObservable,
} from 'mobx';

// TODO: 更好的写法来保证ts编译
export function observer<P>(props: P) {
  return mobxObserver(props as any);
}

export type { IReactionDisposer, IReactionPublic, IReactionOptions } from 'mobx';

export * as mobx from 'mobx';
