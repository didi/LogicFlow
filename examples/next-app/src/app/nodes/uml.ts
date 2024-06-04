import { HtmlNode, HtmlNodeModel } from '@logicflow/core'

export class UmlModel extends HtmlNodeModel {
  createId() {
    return Math.random() + '_uml'
  }
  setAttributes() {
    const width = 200
    const height = 130
    this.width = width
    this.height = height
    this.textHeight = 60
    this.text = {
      ...this.text,
      y: this.y - this.height / 2,
    }

    this.anchorsOffset = [
      {
        x: width / 2,
        y: 0,
        isSourceAnchor: false,
        isTargetAnchor: true,
      },
    ]
    // this.anchorsOffset = [
    //   [width / 2, 0],
    //   [0, height / 2],
    //   [-width / 2, 0],
    //   [0, -height / 2],
    // ]
  }
}
export class UmlNode extends HtmlNode {
  setHtml(rootEl: HTMLElement) {
    const { properties } = this.props.model
    const el = document.createElement('div')
    el.className = 'uml-wrapper'
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
