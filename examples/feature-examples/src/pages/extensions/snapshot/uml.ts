import { HtmlNodeModel, HtmlNode } from '@logicflow/core'

class UmlModel extends HtmlNodeModel {
  setAttributes() {
    const width = 200
    const height = 230
    this.width = width
    this.height = height
    this.anchorsOffset = [
      [width / 2, 0],
      [0, height / 2],
      [-width / 2, 0],
      [0, -height / 2],
    ]
  }
}

class UmlNode extends HtmlNode {
  setHtml(rootEl: SVGForeignObjectElement) {
    const { properties } = this.props.model
    const el = document.createElement('div')
    el.className = 'uml-wrapper'
    const html = `
      <div>
        <div class="uml-head">Head</div>
        <div class="uml-body demo2">
          <div>+ ${properties.name}</div>
          <div>+ ${properties.body}</div>
        </div>
        <div class="uml-footer demo1">
          <div>+ setHead(Head $head)</div>
          <div>+ setBody(Body $body)</div>
        </div>
      </div>
    `
    el.innerHTML = html
    rootEl.innerHTML = ''
    rootEl.appendChild(el)
  }
}

export default {
  type: 'uml',
  view: UmlNode,
  model: UmlModel,
}
