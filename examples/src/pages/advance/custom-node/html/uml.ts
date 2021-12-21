import { HtmlNodeModel, HtmlNode } from '@logicflow/core';
// import HtmlNode from '@logicflow/core';
import './uml.css';

class UmlModel extends HtmlNodeModel {
  setAttributes() {
    this.text.editable = false;
    const width = 200;
    const height = 130;
    this.width = width;
    this.height = height;
    this.anchorsOffset = [
      [width / 2, 0],
      [0, height / 2],
      [-width / 2, 0],
      [0, -height/2],
    ]
  }
}
class UmlNode extends HtmlNode {
  currrentProperties: string;
  // 由于setHtml会跟随节点的render触发
  // 所以自定义html节点需要自己判断组件是否需要更新。
  // setHtml除了properties发生变化会触发外，节点移动了，
  // 节点被选中了等model上所有的属性发生变化都会触发。
  shouldUpdate() {
    const { properties } = this.props.model;
    if (this.currrentProperties && this.currrentProperties === JSON.stringify(properties)) return false;
    this.currrentProperties = JSON.stringify(properties)
    return true;
  }
  setHtml(rootEl: HTMLElement) {
    const { properties } = this.props.model;
    if (!this.shouldUpdate()) return;
  
    const el = document.createElement('div');
    el.className = 'uml-wrapper';
    const html = `
      <div>
        <div class="uml-head">Head</div>
        <div class="uml-body">
          <div>+ ${properties.name}</div>
          <div>+ ${properties.body}</div>
        </div>
        <div class="uml-footer">
          <div>+ setHead(Head $head)</div>
          <div>+ setBody(Body $body)</div>
        </div>
      </div>
    `
    el.innerHTML = html;
    // 需要先把之前渲染的子节点清除掉。
    rootEl.innerHTML = '';
    rootEl.appendChild(el);
  }
}

const uml = {
  type: 'uml',
  view: UmlNode,
  model: UmlModel
}
export default uml;