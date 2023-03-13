import { Component } from 'preact';
import TextEdit from './TextEditTool';
import MultipleSelect from './MultipleSelectTool';
import LogicFlow from '../LogicFlow';
import { ElementState, ElementType, EventType, ModelType } from '../constant/constant';

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
    // @see https://github.com/didi/LogicFlow/issues/152
    const { graphModel } = instance;
    const {
      eventCenter,
    } = graphModel;
    eventCenter.on(`${EventType.GRAPH_TRANSFORM},${EventType.NODE_CLICK},${EventType.BLANK_CLICK} `, () => {
      const {
        textEditElement,
        editConfigModel: {
          edgeTextEdit,
          nodeTextEdit,
        },
      } = graphModel;
      // fix #826, 保留之前的文本可以编辑点击空白才设置为不可编辑。如果以后有其他需求再改。
      if ((edgeTextEdit || nodeTextEdit) && textEditElement) {
        graphModel.textEditElement.setElementState(ElementState.DEFAULT);
      }
    });
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
