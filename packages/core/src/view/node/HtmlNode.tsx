import { createRef } from 'preact/compat'
import BaseNode from './BaseNode'
import { GraphModel, HtmlNodeModel } from '../../model'

export type IHtmlNodeProps = {
  model: HtmlNodeModel
  graphModel: GraphModel
}

export class HtmlNode<
  P extends IHtmlNodeProps = IHtmlNodeProps,
> extends BaseNode<P> {
  ref = createRef()
  currentProperties?: string
  preProperties?: string

  get rootEl() {
    return this.ref.current
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
  setHtml(rootEl: SVGForeignObjectElement) {
    rootEl.appendChild(document.createElement('div'))
  }

  // TODO: 1. 应该在什么时机进行更新呢？2. 如何精细化控制
  confirmUpdate(rootEl: SVGForeignObjectElement) {
    this.setHtml(rootEl)
  }

  /**
   * @overridable 支持重写
   * 和react的shouldComponentUpdate类似，都是为了避免出发不必要的render.
   * 但是这里不一样的地方在于，setHtml方法，我们只在properties发生变化了后再触发。
   * 而x,y等这些坐标相关的方法发生了变化，不会再重新触发setHtml.
   */
  shouldUpdate() {
    if (this.preProperties && this.preProperties === this.currentProperties) {
      return false
    }
    this.preProperties = this.currentProperties
    return true
  }

  componentDidMount() {
    // console.log('HtmlNode --->>> componentDidMount - 初始化内容')
    if (this.shouldUpdate() && this.rootEl) {
      this.setHtml(this.rootEl)
    }
  }

  componentDidUpdate() {
    // console.log('HtmlNode --->>> componentDidUpdate - 更新节点内容')
    // DONE: 将 componentDidMount 和 componentDidUpdate 区分开，如果写在一次，渲染 React 组件会重复初始化，消耗过多资源
    // 为了保证历史兼容性，先将默认 HTML 节点的 setHtml 和 confirmUpdate 保持一直，用户可通过自定义的方式重新定义
    if (this.shouldUpdate() && this.rootEl) {
      this.confirmUpdate(this.rootEl)
    }
  }

  componentWillUnmount() {
    super.componentWillUnmount()
    this.rootEl.innerHTML = ''
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
        ref={this.ref}
      />
    )
  }
}

export default HtmlNode
