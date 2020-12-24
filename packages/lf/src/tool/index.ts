import { Component } from 'preact';
import Control from './ControlTool';
import Menu from './MenuTool';
import TextEdit from './TextEditTool';
// import NodeSelectDecorate from './NodeSelectDecorate';
import LogicFlow from '../LogicFlow';

export type ToolConfig = {
  control?: boolean;
  menu?: boolean;
};

export default class Tool {
  tools: Component[];
  components: Component[];
  toolMap = new Map();
  toolConfig: ToolConfig;
  instance: LogicFlow;
  constructor(tool: ToolConfig, instance: LogicFlow) {
    this.toolConfig = { ...tool };
    this.instance = instance;
    this.registerTool('control', Control);
    // 在svg中增加图层实现outline
    // this.registerTool('NodeSelectDecorate', NodeSelectDecorate);
    if (!this.instance.options.isSilentMode) {
      this.registerTool('menu', Menu);
      this.registerTool('textEdit', TextEdit);
    }
  }
  registerTool(name, component) {
    this.toolMap.set(name, component);
  }
  getTools() {
    const tools = [];
    this.toolMap.forEach((value, key) => {
      if (this.toolConfig[key] !== false) {
        tools.push(value);
      }
    });
    return tools;
  }
}
