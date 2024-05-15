import { HtmlNode, HtmlNodeModel, h } from '@logicflow/core';

class StepNodeView extends HtmlNode {
  setHtml(rootEl: HTMLElement) {
    const { properties } = this.props.model;
    const text: any = properties.text;
    const innerText = text.value;
    const isAnimation = properties.isAnimation;

    const el = document.createElement('div');
    el.className = `step-wrapper spin ${isAnimation ? 'is-animate' : ''}`;
    const html = `<div class='text'>${innerText}</div>`;
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
    if (this.text) {
      this.properties.text = this.text;
      this.text.value = '';
    }
  }
}

export default {
  type: 'StepNode',
  model: StepNodeModel,
  view: StepNodeView,
};
