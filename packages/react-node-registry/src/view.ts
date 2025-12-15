import { createElement, ReactPortal } from 'react'
import { createRoot, Root } from 'react-dom/client'
import { HtmlNode } from '@logicflow/core'
import {
  throttle,
  round,
  get,
  isFunction,
  isArray,
  clamp,
  isNumber,
} from 'lodash-es'
import { Wrapper } from './wrapper'
import { Portal } from './portal'
import { createPortal } from 'react-dom'

export class ReactNodeView extends HtmlNode {
  root?: Root
  private containerEl?: HTMLElement
  private __resizeObserver?: ResizeObserver
  private __resizeRafId?: number
  private __lastWidth?: number
  private __lastHeight?: number
  private __fallbackUnlisten?: () => void
  private __throttledUpdate = throttle(() => this.measureAndUpdate(), 80)

  protected targetId() {
    return `${this.props.graphModel.flowId}:${this.props.model.id}`
  }

  componentWillUnmount() {
    super.componentWillUnmount()
    this.unmount()
  }

  setHtml(rootEl: SVGForeignObjectElement) {
    const existed = rootEl.querySelector(
      '.custom-react-node-content',
    ) as HTMLElement | null
    if (existed) {
      this.containerEl = existed
    } else {
      const el = document.createElement('div')
      el.className = 'custom-react-node-content'
      this.containerEl = el
      this.renderReactComponent(el)
      rootEl.appendChild(el)
    }
    this.startResizeObserver()
  }

  // confirmUpdate(_rootEl: SVGForeignObjectElement) {
  //   // TODO: 如有需要，可以先通过继承的方式，自定义该节点的更新逻辑；我们后续会根据实际需求，丰富该功能
  //   console.log('_rootEl', _rootEl)
  // }

  protected renderReactComponent(container: HTMLElement) {
    this.unmountReactComponent()
    const { model, graphModel } = this.props

    if (container) {
      // 基于自定义节点新建 React 元素
      const elem = createElement(Wrapper, {
        node: model,
        graph: graphModel,
      })

      if (Portal.isActive()) {
        // 使用 Portal
        const portal = createPortal(elem, container, model.id) as ReactPortal
        Portal.connect(this.targetId(), portal)
      } else {
        // 创建 Root 元素
        this.root = createRoot(container)
        this.root.render(elem)
      }
    }
  }

  protected unmountReactComponent() {
    if (this.rootEl && this.root) {
      this.stopResizeObserver()
      this.root.unmount()
      this.root = undefined
      this.rootEl.innerHTML = ''
    }
  }

  // DONE: 是否需要 unmount 或 destroy 方法，在销毁后做一些处理
  unmount() {
    this.unmountReactComponent()
  }

  private measureAndUpdate = () => {
    try {
      const root = this.containerEl as HTMLElement
      if (!root) return
      const target = (root.firstElementChild as HTMLElement) || root
      const rect = target.getBoundingClientRect()
      const width = round(rect.width)
      const height = round(rect.height)
      if (width <= 0 || height <= 0) return
      if (width === this.__lastWidth && height === this.__lastHeight) return
      this.__lastWidth = width
      this.__lastHeight = height
      const props = this.props.model.properties as any
      const extra = get(props, '_showTitle')
        ? isNumber(get(props, '_titleHeight'))
          ? get(props, '_titleHeight')
          : 28
        : 0
      const baseHeight = clamp(height - extra, 1, Number.MAX_SAFE_INTEGER)
      this.props.model.setProperties({ width, height: baseHeight })
    } catch (err) {
      console.error('measureAndUpdate error', err)
    }
  }

  private startResizeObserver() {
    const root = this.containerEl as HTMLElement
    if (!root) return
    try {
      if (isFunction((window as any).ResizeObserver)) {
        this.__resizeObserver = new (window as any).ResizeObserver(
          (entries: any[]) => {
            if (!isArray(entries) || !entries.length) return
            if (this.__resizeRafId) cancelAnimationFrame(this.__resizeRafId)
            this.__resizeRafId = requestAnimationFrame(this.__throttledUpdate)
          },
        )
        const target = (root.firstElementChild as HTMLElement) || root
        this.__resizeObserver?.observe(target)
      } else {
        window.addEventListener('resize', () => this.__throttledUpdate())
        this.__fallbackUnlisten = () =>
          window.removeEventListener('resize', () => this.__throttledUpdate())
      }
    } catch (err) {
      console.error('startResizeObserver error', err)
    }
  }

  private stopResizeObserver() {
    try {
      if (this.__resizeObserver) {
        this.__resizeObserver.disconnect()
        this.__resizeObserver = undefined
      }
      if (this.__resizeRafId) {
        cancelAnimationFrame(this.__resizeRafId)
        this.__resizeRafId = undefined
      }
      if (this.__fallbackUnlisten) {
        this.__fallbackUnlisten()
        this.__fallbackUnlisten = undefined
      }
    } catch (err) {
      console.error('stopResizeObserver error', err)
    }
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
