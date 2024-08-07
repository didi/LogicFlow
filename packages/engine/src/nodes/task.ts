import BaseNode from './base'

export default class TaskNode extends BaseNode {
  readonly baseType = 'task'
  static nodeTypeName = 'TaskNode'
}

export { TaskNode }
