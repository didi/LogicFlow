import { HtmlNode, HtmlNodeModel, h } from '@logicflow/core';

class CircleNodeView extends HtmlNode {
  setHtml(rootEl: SVGForeignObjectElement) {
    const nodeData = this.props.model.getData();
    const { properties } = this.props.model;
    const text: any = properties.text;
    const innerText = text.value;
    const isAnimation = properties.isAnimation;

    const el = document.createElement('div');
    el.className = `step-wrapper circle-wrapper spin ${
      isAnimation ? 'is-animate' : ''
    }`;
    const html = `<div class='text'>${nodeData.text?.value}</div>`;
    const animationDom = `<div class='border-div border-circle-animate'><div>`;
    // 需要先把之前渲染的子节点清除掉。
    el.innerHTML = isAnimation ? html + animationDom : html;
    rootEl.innerHTML = '';
    rootEl.appendChild(el);
  }
}

class CircleNodeModel extends HtmlNodeModel {
  setAttributes() {
    this.width = 80;
    this.height = 80;
    if (this.text) {
      // this.properties.text = this.text;
      this.text.value = '';
    }
  }
}

export default {
  type: 'CircleNode',
  model: CircleNodeModel,
  view: CircleNodeView,
};
