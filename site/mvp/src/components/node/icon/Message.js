import IconNode from './IconNode'

// 左上角ICON为消息的节点
class MessageNode extends IconNode.view {
  getImageHref () {
    return 'https://dpubstatic.udache.com/static/dpubimg/1TZgBoaq8G/message.png';
  }
}


export default {
  type: 'icon-message',
  view: MessageNode,
  model: IconNode.model
}