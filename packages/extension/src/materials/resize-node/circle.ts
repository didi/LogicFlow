export const getCircleModel = (
  CircleNodeModel,
) => {
  class ResizeCircleNodeModel extends CircleNodeModel {
    static extendKey = 'CircleNodeModel';
    updateRadius(r) {
      this.r = r;
    }
  }
  return ResizeCircleNodeModel;
};

export const getCircleView = (
  CircleNode, h,
) => {
  class ResizeCircleNode extends CircleNode {
    static extendKey = 'CircleNode';
    constructor(props) {
      super(props);
      this.state = {
        moveX: 0,
      };
    }
    getAttributes() {
      const attr = super.getAttributes();
      const properties = super.getProperties();
      let {
        width, height, fill, r,
      } = attr;
      if (properties.background) {
        fill = properties.background;
      }
      const { moveX } = this.state;
      width += moveX * 2;
      height += moveX * 2;
      r += moveX;
      return {
        ...attr,
        fill,
        width,
        height,
        r,
      };
    }
    startResize = (ev: MouseEvent) => {
      ev.stopPropagation();
      document.addEventListener('mousemove', this.handleMouseMove, false);
      document.addEventListener('mouseup', this.handleMouseUp, false);
      this.startX = ev.x;
      this.startY = ev.y;
      const { model } = this.props;
      model.setHitable(false);
    };
    handleMouseMove = (ev: MouseEvent) => {
      const moveX = ev.x - this.startX;
      const moveY = ev.y - this.startY;
      this.setState({
        moveX: moveX > moveY ? moveX : moveY,
      });
    };
    handleMouseUp = () => {
      document.removeEventListener('mousemove', this.handleMouseMove);
      document.removeEventListener('mouseup', this.handleMouseUp);
      const { moveX } = this.state;
      this.setState({
        moveX: 0,
      });
      const { r } = super.getAttributes();
      const { model } = this.props;
      model.updateRadius(r + moveX);
      this.r = r + moveX;
      model.setHitable(true);
      this.resetEdge();
    };

    resetEdge() {
      const { graphModel, model } = this.props;
      // eslint-disable-next-line
      graphModel.getNodeEdges(model.id).map((edgeModel) => {
        console.log(edgeModel);
        // todo: @xinxin93统一节点更新方法。
      });
    }

    getResizeShape() {
      const {
        x,
        y,
        width,
        height,
      } = this.getAttributes();
      return [
        h(
          'rect',
          {
            fill: '#FFF',
            width: 10,
            height: 10,
            x: x + width / 2,
            y: y + height / 2,
            stroke: '#8A8A8A',
            strokeWidth: 1,
            style: {
              cursor: 'se-resize',
            },
            onMouseDown: this.startResize,
          },
        ),
      ];
    }
    getShape() {
      const resizeShape = this.getResizeShape();
      const attr = this.getAttributes();
      let shapes = [
        h(
          'circle',
          {
            ...attr,
            cx: attr.x,
            cy: attr.y,
          },
        ),
      ];
      if (resizeShape) {
        shapes = shapes.concat(resizeShape);
      }
      return shapes;
    }
  }
  return ResizeCircleNode;
};
