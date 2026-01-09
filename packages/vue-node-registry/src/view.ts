import { isVue2, isVue3, createApp, h, Vue2, defineComponent } from 'vue-demi'
// Vue2/3 兼容 API；使用 vue-demi 保持两端一致
import {
  throttle,
  round,
  get,
  isFunction,
  isArray,
  clamp,
  isNumber,
} from 'lodash-es'
import { HtmlNode } from '@logicflow/core'
import { vueNodesMap } from './registry'
import { isActive, connect, disconnect } from './teleport'
import { Container } from './components/container'

export class VueNodeView extends HtmlNode {
  root?: any
  private vm: any
  // 尺寸监听相关状态
  private __resizeObserver?: ResizeObserver
  private __resizeRafId?: number
  private __lastWidth?: number
  private __lastHeight?: number
  private __fallbackUnlisten?: () => void
  private __throttledUpdate = throttle(() => this.measureAndUpdate(), 80)
  // private isMounted: boolean = false

  getComponentContainer() {
    return this.root
  }

  protected targetId() {
    return `${this.props.graphModel.flowId}:${this.props.model.id}`
  }

  componentWillUnmount() {
    super.componentWillUnmount()
    this.unmount()
  }

  setHtml(rootEl: SVGForeignObjectElement) {
    // 创建节点内容容器并注入到 foreignObject（若已存在则复用）
    const existed = rootEl.querySelector('.custom-vue-node-content')
    if (!existed) {
      const el = document.createElement('div')
      el.className = 'custom-vue-node-content'
      this.root = el
      rootEl.appendChild(el)
    }
    // 渲染 Vue 组件并启用尺寸监听
    this.renderVueComponent()
    this.startResizeObserver()
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  confirmUpdate(_rootEl: SVGForeignObjectElement) {
    // TODO: 如有需要，可以先通过继承的方式，自定义该节点的更新逻辑；我们后续会根据实际需求，丰富该功能
    const { model } = this.props
    const { _showTitle = false } = model.properties || {}
    if (_showTitle) {
      this.setHtml(_rootEl)
    }
  }

  protected renderVueComponent() {
    this.unmountVueComponent()
    const root = this.getComponentContainer()
    const { model, graphModel } = this.props
    const { _showTitle = false } = model.properties || {}
    const wrapWithContainer = (child: any) =>
      defineComponent({
        name: 'LFVueNodeContainerWrapper',
        props: {
          node: { type: Object, required: true },
          graph: { type: Object, required: true },
        },
        render(this: any) {
          // 根据 _showTitle 决定是否用 Container 包裹，避免无标题时额外结构
          if (!_showTitle) {
            return h(child, { node: this.node, graph: this.graph })
          }
          return h(Container, { node: this.node, graph: this.graph }, [
            h(child, { node: this.node, graph: this.graph }),
          ])
        },
      })

    if (root) {
      const { component } = vueNodesMap[model.type]
      if (component) {
        if (isVue2) {
          const Vue = Vue2 as any
          const Composed = wrapWithContainer(component)
          this.vm = new Vue({
            el: root,
            render(h: any) {
              return h(Composed, {
                node: model,
                graph: graphModel,
              })
            },
            provide() {
              return {
                getNode: () => model,
                getGraph: () => graphModel,
              }
            },
          })
        } else if (isVue3) {
          if (isActive()) {
            const Composed = wrapWithContainer(component)
            connect(this.targetId(), Composed, root, model, graphModel)
          } else {
            const Composed = wrapWithContainer(component)
            this.vm = createApp({
              render() {
                return h(Composed, {
                  node: model,
                  graph: graphModel,
                })
              },
              provide() {
                return {
                  getNode: () => model,
                  getGraph: () => graphModel,
                }
              },
            })
            this.vm?.mount(root)
            // this.isMounted = true
          }
        }
      }
    }
  }

  private measureAndUpdate = () => {
    try {
      // 读取子组件（或容器本身）的实际尺寸并更新模型属性
      const root = this.getComponentContainer() as HTMLElement
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
      // 去掉标题占用的高度，保证内容区域与模型高度一致
      const baseHeight = clamp(height - extra, 1, Number.MAX_SAFE_INTEGER)
      this.props.model.setProperties({ width, height: baseHeight })
    } catch (err) {
      // swallow error
    }
  }

  private startResizeObserver() {
    // 启动尺寸监听：优先使用 ResizeObserver，退化到 window.resize
    const root = this.getComponentContainer() as HTMLElement
    if (!root) return
    try {
      if (isFunction((window as any).ResizeObserver)) {
        this.__resizeObserver = new (window as any).ResizeObserver(
          (entries: any[]) => {
            if (!isArray(entries) || !entries.length) return
            if (this.__resizeRafId) cancelAnimationFrame(this.__resizeRafId)
            // 使用 RAF 对齐绘制帧，再用节流函数合并频繁变更
            this.__resizeRafId = requestAnimationFrame(this.__throttledUpdate)
          },
        )
        const target = (root.firstElementChild as HTMLElement) || root
        this.__resizeObserver?.observe(target)
      } else {
        // 退化监听：在窗口尺寸变化时尝试更新
        window.addEventListener('resize', () => this.__throttledUpdate())
        this.__fallbackUnlisten = () =>
          window.removeEventListener('resize', () => this.__throttledUpdate())
      }
    } catch (err) {
      // swallow error
    }
  }

  private stopResizeObserver() {
    try {
      // 停止所有监听与异步回调，避免内存泄漏
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
      // swallow error
    }
  }

  protected unmountVueComponent() {
    const root = this.getComponentContainer()
    // 在卸载 Vue 实例前先停止尺寸监听
    this.stopResizeObserver()
    if (this.vm) {
      isVue2 && this.vm.$destroy()
      isVue3 && this.vm.unmount()
      this.vm = null
    }
    if (root && !isActive()) {
      root.innerHTML = ''
    }
    return root
  }

  unmount() {
    // Teleport 模式下断开连接，并清理视图与监听
    if (isActive()) {
      disconnect(this.targetId(), this.props.graphModel.flowId as string)
    }
    this.unmountVueComponent()
  }
}

export default VueNodeView
