import { HtmlNode, HtmlNodeModel, h } from '@logicflow/core';

class TypeNodeView extends HtmlNode {
  setHtml(rootEl: HTMLElement) {
    const { properties } = this.props.model;

    const el = document.createElement('div');
    el.className = 'color-wrapper';
    const changeType = (event: Event) => {
      if ((event.target as any).checked) {
        this.props.model.properties.type = (event.target as any).value;
        const changeData = {
          lable: 'type',
          value: (event.target as any).value,
        };
        this.props.graphModel.eventCenter.emit('type:type-change', changeData);
      }
    };
    const html = `
      <div>
        <div class="color-head">Shape Type</div>
        <div class="color-body">
          <div>
            <input type="radio" id="circle" name="domeType" value="circle" ${
              properties.type === 'circle' ? 'checked' : ''
            } />
            <label for="circle">circle</label>
          </div>
          <div>
            <input type="radio" id="square" name="domeType" value="square" ${
              properties.type === 'square' ? 'checked' : ''
            }/>
            <label for="square">square</label>
          </div>
        </div>
      </div>
    `;

    el.innerHTML = html;
    // 需要先把之前渲染的子节点清除掉。
    rootEl.innerHTML = '';
    rootEl.appendChild(el);
    const circleDom = document.getElementById('circle');
    const squareDom = document.getElementById('square');
    circleDom?.removeEventListener('change', changeType, false);
    circleDom?.addEventListener('change', changeType, false);
    squareDom?.removeEventListener('change', changeType, false);
    squareDom?.addEventListener('change', changeType, false);
  }
}

class TypeNodeModel extends HtmlNodeModel {
  setAttributes() {
    this.width = 150;
    this.height = 105;
    this.properties.type = 'circle'; // 初始样式
    this.text = '';
  }
}

export default {
  type: 'TypeNode',
  model: TypeNodeModel,
  view: TypeNodeView,
};
