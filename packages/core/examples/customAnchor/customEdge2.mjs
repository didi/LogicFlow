// import { LineEdge, LineEdgeModel } from "@logicflow/core";

class CustomEdge2 extends LineEdge {}

class CustomEdgeModel2 extends LineEdgeModel {
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
  type: "custom-edge2",
  view: CustomEdge2,
  model: CustomEdgeModel2
};
