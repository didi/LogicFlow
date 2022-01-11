// import { RectNode, RectNodeModel, h } from "@logicflow/core";

class UserTaskView extends RectNode {
  getLabelShape() {
    const { model } = this.props;
    const { x, y, width, height } = model;
    const style = model.getNodeStyle();
    return h(
      "svg",
      {
        x: x - width / 2 + 5,
        y: y - height / 2 + 5,
        width: 25,
        height: 25,
        viewBox: "0 0 1274 1024"
      },
      h("path", {
        fill: style.stroke,
        d:
          "M655.807326 287.35973m-223.989415 0a218.879 218.879 0 1 0 447.978829 0 218.879 218.879 0 1 0-447.978829 0ZM1039.955839 895.482975c-0.490184-212.177424-172.287821-384.030443-384.148513-384.030443-211.862739 0-383.660376 171.85302-384.15056 384.030443L1039.955839 895.482975z"
      })
    );
  }
  getShape() {
    const { model } = this.props;
    const { x, y, width, height, radius, properties } = model;
    const style = model.getNodeStyle();
    return h("g", {}, [
      h("rect", {
        ...style,
        x: x - width / 2,
        y: y - height / 2,
        rx: radius,
        ry: radius,
        width,
        height
      }),
      this.getLabelShape()
    ]);
  }
}

class UserTaskModel extends RectNodeModel {
  setAttributes() {
    this.width = 100;
    this.height = 100;
    const circleOnlyAsTarget = {
      message: "正方形节点下一个节点只能是圆形节点",
      validate: (source, target, sourceAnchor, targetAnchor) => {
        console.log(source, target, sourceAnchor, targetAnchor);
        return true;
      },
    };
    this.sourceRules.push(circleOnlyAsTarget);
  }
  getDetaultAnchor() {
    const { width, height, x, y } = this; 
    return [
      {
        x: x - width / 2,
        y,
        id: this.id + '_0'
      },
      {
        x: x + width / 2,
        y,
        id: this.id + '_1'
      }
    ]
  }
  
  getNodeStyle() {
    const style = super.getNodeStyle();
    const properties = this.properties;
    // console.log(this.getProperties());
    if (properties.disabled) {
      style.stroke = "red";
    } else {
      style.stroke = "rgb(24, 125, 255)";
    }
    return style;
  }
  getTextStyle() {
    const style = super.getTextStyle();
    style.color = "red";
    style.overflowMode = "ellipsis";
    style.textAlign = "right";
    style.fontSize = 20;
    return style;
  }
}

export default {
  type: "UserTask",
  view: UserTaskView,
  model: UserTaskModel
};
