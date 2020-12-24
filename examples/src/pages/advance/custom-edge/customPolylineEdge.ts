type RegisterCustomPolylineEdgeType = {
  PolylineEdge: any;
  PolylineEdgeModel: any;
};

export const registerCustomPolylineEdge: any = ({
  PolylineEdge,
  PolylineEdgeModel,
}: RegisterCustomPolylineEdgeType) => {
  class CustomPolylineEdge extends PolylineEdge {
    static extendKey = "CustomPolylineEdge";
    // 连线样式
    getAttributes() {
      const attr = super.getAttributes();
      if (attr.properties.isExecuted) {
        attr.stroke = "red";
      }
      return attr;
    }
    // 箭头样式
    getArrowStyle() {
      const style = super.getArrowStyle();
      style.fill = "transparent";
      return style;
    }
  }
  class CustomPolylineEdgeModel extends PolylineEdgeModel {}
  return {
    view: CustomPolylineEdge,
    model: CustomPolylineEdgeModel,
  };
};
