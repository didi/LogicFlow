import ImageNode from './ImageNode'


// 图片-用户节点
class UserNode extends ImageNode.view {
  getImageHref () {
    return 'https://dpubstatic.udache.com/static/dpubimg/-6Fd2uIoJ-/user.png';
  }
}


export default {
  type: 'image-user',
  view: UserNode,
  model: ImageNode.model
}