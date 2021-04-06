export const Square: any = ({ RectNode, RectNodeModel, h }: any) => {
  class Model extends RectNodeModel {
    setAttributes() {
      const size = 80;
      const circleOnlyAsTarget = {
        message: "正方形节点下一个节点只能是圆形节点",
        validate: (source: any, target: any) => {
          return target.type === "circle";
        },
      };

      this.width = size;
      this.height = size;
      this.anchorsOffset = [
        [size / 2, 0],
        [-size / 2, 0]
      ];
      this.sourceRules.push(circleOnlyAsTarget);
    }
  }

  class View extends RectNode {
    getShape() {
      // 通过 getAttributes 获取 model 中的属性
      const { x, y, width, height, fill, stroke, strokeWidth, properties } = this.getAttributes();
      const attrs = {
        x: x - width / 2,
        y: y - height / 2,
        width,
        height,
        stroke,
        fill,
        strokeWidth
      }
      const userIcon = h(
        "svg",
        {
          x: x - width / 2 + 5,
          y: y - height / 2 + 5,
          width: 25,
          height: 25,
          viewBox: "0 0 1274 1024",
        },
        h("path", {
          fill: stroke,
          d:
            "M655.807326 287.35973m-223.989415 0a218.879 218.879 0 1 0 447.978829 0 218.879 218.879 0 1 0-447.978829 0ZM1039.955839 895.482975c-0.490184-212.177424-172.287821-384.030443-384.148513-384.030443-211.862739 0-383.660376 171.85302-384.15056 384.030443L1039.955839 895.482975z",
        })
      );
      // getShape 的返回值是一个通过 h 方法创建的 svg 元素
      return h('g', {}, [
          h('rect', { ...attrs }),
          properties.isUser ? userIcon : null
        ]
      );
    }
  }
  return {
    view: View,
    model: Model,
  };
};
