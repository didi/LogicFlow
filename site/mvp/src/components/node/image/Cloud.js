import ImageNode from './ImageNode'

// 云形状的图片节点
class CloudNode extends ImageNode.view {
  getImageHref () {
    return 'https://dpubstatic.udache.com/static/dpubimg/0oqFX1nvbD/cloud.png';
  }
}


export default {
  type: 'image-cloud',
  view: CloudNode,
  model: ImageNode.model
}