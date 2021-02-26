import { Component } from 'preact';
import TextEdit from './TextEditTool';
import MultipleSelect from './MultipleSelectTool';
import LogicFlow from '../LogicFlow';

export default class Tool {
  tools: Component[];
  components: Component[];
  toolMap = new Map();
  instance: LogicFlow;
  constructor(instance: LogicFlow) {
    this.instance = instance;
    this.registerTool('textEdit', TextEdit);
    this.registerTool('multipleSelect', MultipleSelect);
  }
  registerTool(name, component) {
    this.toolMap.set(name, component);
  }
  getTools() {
    return Array.from(this.toolMap.values());
  }
  getInstance() {
    return this.instance;
  }
}
