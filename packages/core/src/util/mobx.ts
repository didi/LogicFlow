import {
  action,
  observable,
  computed,
  toJS,
  isObservable,
  configure,
  reaction,
  IReactionDisposer,
} from 'mobx'

configure({ isolateGlobalState: true })

export {
  action,
  observable,
  computed,
  isObservable,
  toJS,
  configure,
  reaction,
  IReactionDisposer,
}
