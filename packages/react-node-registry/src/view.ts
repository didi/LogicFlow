import { createElement, ReactPortal } from 'react'
import { createRoot, Root } from 'react-dom/client'
import { HtmlNode } from '@logicflow/core'
import { Wrapper } from './wrapper'
import { Portal } from './portal'
import { createPortal } from 'react-dom'

export class ReactNodeView extends HtmlNode {
  root?: Root

  protected targetId() {
    return `${this.props.graphModel.flowId}:${this.props.model.id}`
  }

  componentWillUnmount() {
    super.componentWillUnmount()
    this.unmount()
  }

  setHtml(rootEl: SVGForeignObjectElement) {
    const el = document.createElement('div')
    el.className = 'custom-react-node-content'

    this.renderReactComponent(el)
    rootEl.appendChild(el)
  }

  confirmUpdate(_rootEl: SVGForeignObjectElement) {
    // TODO: 如有需要，可以先通过继承的方式，自定义该节点的更新逻辑；我们后续会根据实际需求，丰富该功能
    console.log('_rootEl', _rootEl)
  }

  protected renderReactComponent(container: HTMLElement) {
    console.log('render render render ===>>>')
    this.unmountReactComponent()
    const { model, graphModel } = this.props

    if (container) {
      const elem = createElement(Wrapper, {
        node: model,
        graph: graphModel,
      })

      if (Portal.isActive()) {
        const portal = createPortal(elem, container, model.id) as ReactPortal
        Portal.connect(this.targetId(), portal)
      } else {
        this.root = createRoot(container)
        this.root.render(elem)
      }
    }
  }

  protected unmountReactComponent() {
    if (this.rootEl && this.root) {
      this.root.unmount()
      this.root = undefined
      this.rootEl.innerHTML = ''
    }
  }

  // DONE: 是否需要 unmount 或 destroy 方法，在销毁后做一些处理
  unmount() {
    this.unmountReactComponent()
  }

  // TODO: 确认是否需要重写 onMouseDown 方法
  // handleMouseDown(ev: MouseEvent, x: number, y: number) {
  //   const target = ev.target as Element
  //   const tagName = target.tagName.toLowerCase()
  //   if (tagName === 'input') {
  //     const type = target.getAttribute('type')
  //     if (
  //       type == null ||
  //       [
  //         'text',
  //         'password',
  //         'number',
  //         'email',
  //         'search',
  //         'tel',
  //         'url',
  //       ].includes(type)
  //     ) {
  //       return
  //     }
  //   }
  //
  //   console.log('pointer position, x:', x, 'y: ', y)
  //   // TODO
  //   // super.handleMouseDown(ev)
  // }
}

export default ReactNodeView
