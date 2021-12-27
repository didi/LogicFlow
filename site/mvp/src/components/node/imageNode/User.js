import ImageNode from './ImageNode'


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