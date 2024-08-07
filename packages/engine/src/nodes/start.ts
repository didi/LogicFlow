import BaseNode from './base'

export default class StartNode extends BaseNode {
  readonly baseType = 'start'
  static nodeTypeName = 'StartNode'
}

export { StartNode }
