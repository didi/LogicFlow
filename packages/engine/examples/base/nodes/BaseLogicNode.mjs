class BaseLogicNodeModel extends RectNodeModel {
  initNodeData(data) {
    if (!data.text) {
      data.text = data.type;
    }
    super.initNodeData(data);
    
    if (data.output) {
      this.output = data.output;
    } else {
      this.output = [
        {
          outputName: 'default',
          outputDesc: ''
        }
      ]
    }
  }
  setAttributes() {
    const { output = [] } = this;
    this.height = 40 + (output.length ? output.length - 1: 0) * 20;
  }
  /**
     * 重写节点样式
     */
  getNodeStyle() {
    const style = super.getNodeStyle();
    style.fill = 'rgb(230, 224, 248)';
    if (this.isSelected) {
      style.strokeWidth = 2;
      style.stroke = '#ff7f0e';
    } else {
      style.strokeWidth = 1;
      style.stroke = '#999';
    }
    return style;
  }
  getAnchorStyle(anchorInfo) {
    const style = super.getAnchorStyle(anchorInfo);
    if (anchorInfo.type === 'input') {
      style.fill = 'red'
      style.hover.fill = 'transparent'
      style.hover.stroke = 'transparent'
      style.className = 'lf-hide-default'
    } else {
      style.fill = 'green'
    }
    return style;
  }
  
  getOutlineStyle() {
    const style = super.getOutlineStyle();
    style.stroke = 'transparent';
    style.hover.stroke = 'transparent';
    return style;
  }
  getData() {
    const data = super.getData();
    data.output = this.output;
    return data
  }
  getDefaultAnchor() {
    const { width, height, x, y, id, output = [] } = this;
    const anchors = [
      {
        x: x - width / 2,
        y,
        type: 'input',
        edgeAddable: false, // 控制锚点是否可以从此锚点手动创建连线。默认为true。
        id: `${id}_0`
      },
    ]
    const len = output.length;
    output.forEach((o, index) => {
      anchors.push({
        x: x + width / 2,
        y: y - height / 2 + (height / (len + 1)) * (index + 1),
        type: 'output',
        id: o.outputName || `${id}_output_${index}`
      })
    })
    return anchors;
  }
}
class BaseLogicNode extends RectNode {
  getAnchorShape(anchorData) {
    const { x, y, type } = anchorData;
    return h("rect", {
      x: x - 5,
      y: y - 5,
      width: 10,
      height: 10,
      className: `custom-anchor ${
        type === "input" ? "incomming-anchor" : "outgoing-anchor"
      }`
    });
  }
}

export default {
  type: 'BaseLogic',
  model: BaseLogicNodeModel,
  view: BaseLogicNode,
}
