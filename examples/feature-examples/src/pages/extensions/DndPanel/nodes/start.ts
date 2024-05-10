import { CustomImage } from '@/components/nodes/CustomHtml'

// 云形状的图片节点
class StartNode extends CustomImage.view {
  getImageHref = () => {
    return 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/core/start.png'
  }
}

export default {
  type: 'start',
  view: StartNode,
  model: CustomImage.model,
}
