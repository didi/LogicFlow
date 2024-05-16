import { CustomImage } from '@/components/nodes/custom-html'

// 云形状的图片节点
class StartNode extends CustomImage.view {
  getImageHref = () => {
    return 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/core/start.png'
  }
}

export class StartNodeModel extends CustomImage.model {
  setAttributes() {
    this.width = 50
    this.height = 50
    this.radius = 5
    this.text.value = ''
  }
}

export default {
  type: 'start',
  view: StartNode,
  model: StartNodeModel,
}
