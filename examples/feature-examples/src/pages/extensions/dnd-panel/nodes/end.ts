import { CustomImage } from '@/components/nodes/custom-html'

// 云形状的图片节点
class EndNode extends CustomImage.view {
  getImageHref = () => {
    return 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/core/end.png'
  }
}

export class EndNodeModel extends CustomImage.model {
  setAttributes() {
    this.width = 50
    this.height = 50
    this.radius = 5
    this.text.value = ''
  }
}

export default {
  type: 'end',
  view: EndNode,
  model: EndNodeModel,
}
