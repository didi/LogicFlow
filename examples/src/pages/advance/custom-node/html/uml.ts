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
  setHtml(rootEl: HTMLElement) {
    console.log(111)
    const el = document.createElement('div');
    el.className = 'uml-wrapper';
    const html = `
      <div>
        <div class="uml-head">Head</div>
        <div class="uml-body">
          <div>+ $Name</div>
          <div>+ $Body</div>
        </div>
        <div class="uml-footer">
          <div>+ setHead(Head $head)</div>
          <div>+ setBody(Body $body)</div>
        </div>
      </div>
    `
    el.innerHTML = html;
    rootEl.appendChild(el);
  }
}

const uml = {
  type: 'uml',
  view: UmlNode,
  model: UmlModel
}
export default uml;