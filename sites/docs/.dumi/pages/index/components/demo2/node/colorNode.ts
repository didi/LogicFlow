import { HtmlNode, HtmlNodeModel, h } from '@logicflow/core';

class ColorNodeView extends HtmlNode {
  setHtml(rootEl: HTMLElement) {
    const { properties } = this.props.model;

    const el = document.createElement('div');
    el.className = 'color-wrapper';
    const changeColor = (event: Event) => {
      this.props.model.properties.color = (event.target as any).value;
      const changeData = {
        lable: 'color',
        value: (event.target as any).value,
      };
      this.props.graphModel.eventCenter.emit('color:color-change', changeData);
    };
    const html = `
      <div>
        <div class="color-head">Shape Color</div>
        <div class="color-body">
          <input class="nodrag" type="color" value="${properties.color}" id="demo-color">
          <span class="inner">${properties.color}</span>
        </div>
      </div>
    `;

    el.innerHTML = html;
    // 需要先把之前渲染的子节点清除掉。
    rootEl.innerHTML = '';
    rootEl.appendChild(el);
    const colorDom = document.getElementById('demo-color');
    colorDom?.removeEventListener('change', changeColor, false);
    colorDom?.addEventListener('change', changeColor, false);
  }
}

class ColorNodeModel extends HtmlNodeModel {
  setAttributes() {
    this.width = 150;
    this.height = 85;
    this.properties.color = '#2f75ff'; // 初始颜色
    this.text = '';
  }
}

export default {
  type: 'ColorNode',
  model: ColorNodeModel,
  view: ColorNodeView,
};
