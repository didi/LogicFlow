import { HtmlNode, HtmlNodeModel, LogicFlow } from '@logicflow/core';

export type CustomProperties = {
  // 形状属性
  width?: number;
  height?: number;
  radius?: number;

  // 样式属性
  style?: LogicFlow.CommonTheme;
  textStyle?: LogicFlow.TextNodeTheme;
};

class CustomHtmlNode extends HtmlNode {
  setHtml(rootEl: SVGForeignObjectElement) {
    const { properties } = this.props.model;

    const el = document.createElement('div');
    el.className = 'uml-wrapper';
    el.innerHTML = `
      <div>
        <div class="uml-head">Head</div>
        <div class="uml-body">
          <div><button class="uml-btn" onclick="setData()">+</button> ${properties.name}</div>
          <div>${properties.body}</div>
        </div>
        <div class="uml-footer">
          <div>setHead(Head $head)</div>
          <div>setBody(Body $body)</div>
        </div>
      </div>
    `;
    rootEl.innerHTML = '';
    rootEl.appendChild(el);

    // @ts-ignore
    window.setData = () => {
      const { graphModel, model } = this.props;
      graphModel.eventCenter.emit('custom:button-click', model);
    };
  }
}

class CustomHtmlNodeModel extends HtmlNodeModel {
  setAttributes() {
    console.log('this.properties', this.properties);
    const { width, height, radius } = this.properties as CustomProperties;
    this.width = width || 300;
    this.height = height || 150;
    this.text.editable = false;
    if (radius) {
      this.radius = radius;
    }
  }
}

export default {
  type: 'customHtml',
  view: CustomHtmlNode,
  model: CustomHtmlNodeModel,
};
