const { RectNode, RectNodeModel } = window

class CustomNode extends RectNode {

}

class CustomNodeModel extends RectNodeModel {
  setAttributes () {
    this.width = 260;
    this.height = 30;
    this.fill = 'red'
  }
}

export default {
  type: 'custom-node',
  model: CustomNodeModel,
  view: CustomNode
}