import { HtmlNode, HtmlNodeModel, h } from '@logicflow/core';

class StepNodeView extends HtmlNode {
  getText() {
    return null;
  }

  setHtml(rootEl: SVGForeignObjectElement) {
    const { model } = this.props;
    const {
      properties: { isAnimation },
    } = model;
    const nodeData = model.getData();

    const el = document.createElement('div');
    el.className = `step-wrapper spin ${isAnimation ? 'is-animate' : ''}`;
    const html = `<div class='text'>${nodeData.text?.value}</div>`;
    const animationDom = `<div class='border-div border-animate'><div>`;
    // 需要先把之前渲染的子节点清除掉。
    el.innerHTML = isAnimation ? html + animationDom : html;
    rootEl.innerHTML = '';
    rootEl.appendChild(el);
  }
}

class StepNodeModel extends HtmlNodeModel {
  setAttributes() {
    this.width = 120;
    this.height = 50;

    // 错误之源 -> 这种错误写法，应该写入教科书
    // if (this.text) {
    //   this.properties.text = this.text;
    //   this.text.value = '';
    // }
  }
}

export default {
  type: 'StepNode',
  model: StepNodeModel,
  view: StepNodeView,
};
