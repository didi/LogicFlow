
class HexagonModel extends RectResize.model {
  initNodeData(data) {
    super.initNodeData(data);
    this.width = 80;
    this.height = 80;
  }
  getNodeStyle() {
    const style = super.getNodeStyle();
    style.fill = "#f1a131";
    style.strokeWidth = 1;
    return style;
  }
}

class HexagonView extends RectResize.view {
  getResizeShape() {
    const { x, y, width, height } = this.props.model;
    const style = this.props.model.getNodeStyle();
    const pointList = [
      [x - 0.28 * width, y - 0.5 * height],
      [x + 0.28 * width, y - 0.5 * height],
      [x + 0.5 * width, y],
      [x + 0.28 * width, y + 0.5 * height],
      [x - 0.28 * width, y + 0.5 * height],
      [x - 0.5 * width, y]
    ];
    const points = pointList.map((item) => {
      return `${item[0]},${item[1]}`;
    });
    const attrs = {
      ...style,
      x,
      y,
      width,
      height,
      points: points.join(" ")
    };

    return h("g", {}, [h("polygon", { ...attrs })]);
  }
}

export default {
  type: "resizable-hexagon",
  view: HexagonView,
  model: HexagonModel
};
