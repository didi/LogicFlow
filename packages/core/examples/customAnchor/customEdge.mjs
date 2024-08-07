// import { BezierEdge, BezierEdgeModel } from "@logicflow/core";

class CustomEdge extends BezierEdge {}

class CustomEdgeModel extends BezierEdgeModel {
  getEdgeStyle() {
    const style = super.getEdgeStyle();
    // svg属性
    style.strokeWidth = 1;
    style.stroke = "#ababac";
    return style;
  }
  /**
   * 重写此方法，使保存数据是能带上锚点数据。
   */
  getData() {
    const data = super.getData();
    data.sourceAnchorId = this.sourceAnchorId;
    data.targetAnchorId = this.targetAnchorId;
    return data;
  }
}

export default {
  type: "custom-edge",
  view: CustomEdge,
  model: CustomEdgeModel
};
