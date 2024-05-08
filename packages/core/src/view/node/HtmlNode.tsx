import BaseNode from './BaseNode'

export class HtmlNode extends BaseNode {
  ref?: HTMLElement
  currentProperties?: string
  preProperties?: string
  setRef = (dom): void => {
    this.ref = dom
  }

  get rootEl() {
    return this.ref
  }

  /**
   * @overridable 支持重写
   * 自定义HTML节点内容
   * @param {HTMLElement} rootEl 自定义HTML节点内容可以挂载的dom节点
   * @example
   * class CustomHtmlNode extends HtmlNode {
   *   setHtml(rootEl) {
   *     const input = document.createElement('input');
   *     rootEl.appendChild(input)
   *   }
   * }
   */
  setHtml(rootEl: HTMLElement) {
    rootEl.appendChild(document.createElement('div'))
  }

  /**
   * @overridable 支持重写
   * 和react的shouldComponentUpdate类似，都是为了避免出发不必要的render.
   * 但是这里不一样的地方在于，setHtml方法，我们只在properties发生变化了后再触发。
   * 而x,y等这些坐标相关的方法发生了变化，不会再重新触发setHtml.
   */
  shouldUpdate() {
    if (this.preProperties && this.preProperties === this.currentProperties)
      return
    this.preProperties = this.currentProperties
    return true
  }

  componentDidMount() {
    if (this.shouldUpdate() && this.rootEl) {
      this.setHtml(this.rootEl)
    }
  }

  componentDidUpdate() {
    if (this.shouldUpdate() && this.rootEl) {
      this.setHtml(this.rootEl)
    }
  }

  getShape() {
    const { model } = this.props
    const { x, y, height, width } = model
    const style = model.getNodeStyle()
    this.currentProperties = JSON.stringify(model.properties)
    return (
      <foreignObject
        {...style}
        x={x - width / 2}
        y={y - height / 2}
        width={width}
        height={height}
        ref={this.setRef}
      />
    )
  }
}

export default HtmlNode
