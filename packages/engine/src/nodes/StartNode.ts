import BaseNode from './BaseNode';

export default class StartNode extends BaseNode {
  static nodeTypeName = 'StartNode';
  readonly baseType = 'start';
}
