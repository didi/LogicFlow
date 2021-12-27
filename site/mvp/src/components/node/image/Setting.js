import ImageNode from './ImageNode'

class SettingModel extends ImageNode.model {
  constructor(data, graphData) {
    super(data, graphData)
    this.width = 60
    this.height = 60
  }
}
class SettingNode extends ImageNode.view {
  getImageHref () {
    return 'https://dpubstatic.udache.com/static/dpubimg/UzI4AFUcfO/setting.png';
  }
}


export default {
  type: 'image-setting',
  view: SettingNode,
  model: SettingModel,
}