import FunctionNode from './nodes/FunctionNode'
import SwitchNode from './nodes/SwitchNode'
import StartNode from './nodes/StartNode'
import FetchNode from './nodes/FetchNode'
import DelayNode from './nodes/DelayNode'
import FlowLink from './FlowLink'
import Palette from './tools/Palette.vue'
import VueHtmlNode from './nodes/VueHtmlNode'

class NodeRedExtension {
  static pluginName = 'NodeRedExtension'

  constructor({ lf }) {
    lf.register(FunctionNode)
    lf.register(SwitchNode)
    lf.register(StartNode)
    lf.register(FetchNode)
    lf.register(DelayNode)
    lf.register(VueHtmlNode)

    lf.register(FlowLink)
    lf.setDefaultEdgeType('flow-link')
  }

  render(lf, domOverlay) {
    console.log('node-red-extension')
    // const node = document.createElement('div')
    // node.className = 'node-red-palette'
    // domOverlay.appendChild(node)
    // this.app.mount(node)
  }

  destory() {
    console.log('destory')
    this.app.unmount()
    this.app = null
    console.log('this.app', this.app)
  }
}

export default NodeRedExtension
