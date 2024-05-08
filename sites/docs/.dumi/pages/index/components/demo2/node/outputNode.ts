import { HtmlNode, HtmlNodeModel, h } from '@logicflow/core';

class OutputNodeView extends HtmlNode {
  setHtml(rootEl: HTMLElement) {
    const { properties } = this.props.model;
    let { color, type, level } = properties;
    color = color ? color : '#2f75ff';
    level = level ? level : '0.9';
    type = type ? type : 'circle';

    const el = document.createElement('div');
    el.className = 'color-wrapper';
    const html = `
      <div>
        <div class="color-head">Output</div>
        <div class="color-body output">
          <ul id="menu" style="transform: scale(${level});">
            <span class="menu-button ${type}" style="background: ${color}"></span>
            <li class="menu-item ${type}" style="background: ${color}">
                <span class="fa fa-github"></span>
            </li>
            <li class="menu-item ${type}" style="background: ${color}">
                <span class="fa fa-linkedin"></span>
            </li>
            <li class="menu-item ${type}" style="background: ${color}">
                <span class="fa fa-instagram"></span>
            </li>
            <li class="menu-item ${type}" style="background: ${color}">
                <span class="fa fa-twitter"></span>
            </li>
          </ul>
        </div>
      </div>
    `;

    el.innerHTML = html;
    // 需要先把之前渲染的子节点清除掉。
    rootEl.innerHTML = '';
    rootEl.appendChild(el);
  }
}

class OutputNodeModel extends HtmlNodeModel {
  setAttributes() {
    this.width = 300;
    this.height = 260;
    this.text.value = '';
  }
}

export default {
  type: 'OutputNode',
  model: OutputNodeModel,
  view: OutputNodeView,
};
