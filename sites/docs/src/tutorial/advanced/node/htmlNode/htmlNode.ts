import { HtmlNode, HtmlNodeModel } from '@logicflow/core';

class ButtonNode extends HtmlNode {
  setHtml(rootEl: SVGForeignObjectElement) {
    const { properties } = this.props.model;

    const el = document.createElement('div');
    el.className = 'uml-wrapper';
    const html = `
      <div>
        <div class="uml-head">Head</div>
        <div class="uml-body">
          <div><button onclick="setData()" onmousedown="stop(arguments[0])">+</button> ${properties.name}</div>
          <div>${properties.body}</div>
        </div>
        <div class="uml-footer">
          <div>setHead(Head $head)</div>
          <div>setBody(Body $body)</div>
        </div>
      </div>
    `;
    el.innerHTML = html;
    rootEl.innerHTML = '';
    rootEl.appendChild(el);
    // @ts-ignore
    window.stop = (ev: any) => {
      ev.stopPropagation();
    };
    // @ts-ignore
    window.setData = () => {
      const { graphModel, model } = this.props;
      graphModel.eventCenter.emit('custom:button-click', model);
    };
  }
}

class ButtonNodeModel extends HtmlNodeModel {
  setAttributes() {
    this.width = 300;
    this.height = 130;
    this.text.editable = false;
  }
}

export default {
  type: 'button-node',
  view: ButtonNode,
  model: ButtonNodeModel,
};
