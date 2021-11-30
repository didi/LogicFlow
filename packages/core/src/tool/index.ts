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
    if (!this.isDisabledTool(TextEdit.toolName)) {
      this.registerTool(TextEdit.toolName, TextEdit);
    }
    if (!this.isDisabledTool(MultipleSelect.toolName)) {
      this.registerTool(MultipleSelect.toolName, MultipleSelect);
    }
  }
  private isDisabledTool(toolName) {
    return this.instance.options.disabledTools.indexOf(toolName) !== -1;
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
