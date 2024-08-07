import { HtmlNode, HtmlNodeModel, h } from '@logicflow/core';

class LevelNodeView extends HtmlNode {
  setHtml(rootEl: HTMLElement) {
    const { properties } = this.props.model;

    const el = document.createElement('div');
    el.className = 'color-wrapper';
    const changeLevel = (event: Event) => {
      this.props.model.properties.level = (event.target as any).value;
      const changeData = {
        lable: 'level',
        value: (event.target as any).value,
      };
      this.props.graphModel.eventCenter.emit('level:level-change', changeData);
    };
    const html = `
      <div>
        <div class="color-head">Zoom Level</div>
        <div class="color-body">
          <input id="cowbell" name="cowbell" min="0.1" max="1.9" value="${properties.level}" step="0.2" />
        </div>
      </div>
    `;

    el.innerHTML = html;
    // 需要先把之前渲染的子节点清除掉。
    rootEl.innerHTML = '';
    rootEl.appendChild(el);
    const levelDom = document.getElementById('cowbell');
    levelDom?.removeEventListener('change', changeLevel, false);
    levelDom?.addEventListener('change', changeLevel, false);
    const moveDome = (e: {
      stopImmediatePropagation: () => void;
      stopPropagation: () => void;
    }) => {
      e.stopImmediatePropagation();
      e.stopPropagation();
    };
    levelDom?.removeEventListener('mousedown', moveDome, false);
    levelDom?.removeEventListener('mousemove', moveDome, false);
    levelDom?.addEventListener('mousedown', moveDome, false);
    levelDom?.addEventListener('mousemove', moveDome, false);
  }
}

class LevelNodeModel extends HtmlNodeModel {
  setAttributes() {
    this.width = 150;
    this.height = 85;
    this.properties.level = 0.9; // 初始level
    this.text.value = '';
  }
}

export default {
  type: 'LevelNode',
  model: LevelNodeModel,
  view: LevelNodeView,
};
