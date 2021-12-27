import ImageNode from './ImageNode'


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