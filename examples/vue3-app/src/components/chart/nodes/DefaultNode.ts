import { HtmlNode, HtmlNodeModel } from '@logicflow/core'
import { createApp, h } from 'vue'
import type { INodeProps } from '../types.d'
import { size } from '../confg'
import DefaultNode from './DefaultNode.vue'

class DefaultNodeView extends HtmlNode {
  isMounted
  r
  app

  constructor(props: INodeProps) {
    super(props)
    this.isMounted = false
    this.r = h(DefaultNode, {
      properties: props.model.getProperties()
    })
    this.app = createApp({
      render: () => this.r
    })
  }

  setHtml(rootEl: SVGForeignObjectElement) {
    if (!this.isMounted) {
      this.isMounted = true
      const node = document.createElement('div')
      node.className = 'w-full h-full'
      rootEl.appendChild(node)
      this.app.mount(node)
    } else {
      this.r.component!.props.properties = this.props.model.getProperties()
    }
  }
}

class DefaultNodeModel extends HtmlNodeModel {
  initNodeData(data: any) {
    super.initNodeData(data)
    this.width = size.defaultNodeWidth
    this.height = size.defaultNodeHeight
    this.text.editable = false
  }
}

export default {
  type: 'defaultNode',
  view: DefaultNodeView,
  model: DefaultNodeModel
}
