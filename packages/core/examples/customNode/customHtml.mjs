class CustomHtmlModel extends HtmlNodeModel {
  /**
   * HTML节点需要预先定义好节点的宽高
   */
  setAttributes() {
    this.width = 200;
    this.height = 160;
  }
}
class CustomHtmlNode extends HtmlNode {
  setHtml(rootEl) {
    console.log('3333')
    rootEl.innerHTML = ''
    const el = document.createElement('input')
    rootEl.appendChild(el);
  }
}
export default {
  type: 'customHtml',
  model: CustomHtmlModel,
  view: CustomHtmlNode
}
