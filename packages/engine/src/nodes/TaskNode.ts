import BaseNode from './BaseNode';

export default class TaskNode extends BaseNode {
  static nodeTypeName = 'TaskNode';
  readonly baseType = 'task';
  async execute() {
    console.log('TaskNode run');
  }
}
