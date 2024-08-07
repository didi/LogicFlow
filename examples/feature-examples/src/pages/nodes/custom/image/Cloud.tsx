import { CustomImage } from '@/components/nodes/custom-html'

// 云形状的图片节点
class CloudImageNode extends CustomImage.view {
  getImageHref = () => {
    return 'https://dpubstatic.udache.com/static/dpubimg/0oqFX1nvbD/cloud.png'
  }
}

export default {
  type: 'imageCloud',
  view: CloudImageNode,
  model: CustomImage.model,
}
