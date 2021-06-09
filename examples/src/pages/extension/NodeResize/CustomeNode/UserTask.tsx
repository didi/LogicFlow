
import { h } from '@logicflow/core';
import { RectResize } from '@logicflow/extension';

class UserTaskModel extends RectResize.model {
  setAttributes() {
    this.width = 100;
    this.height = 80;
    this.radius = 10;
  }
}
// 自定义节点的 view
class UserTaskView extends RectResize.view {
  getShapeResize() {
    // 通过 getAttributes 获取 model 中的属性
    const { x, y, width, height, fill, stroke, strokeWidth, radius } = this.getAttributes();
    const attrs = {
      // rect 标签的 x，y 对应的是图形的左上角
      // 所以我们要将矩形的中心移动到 x，y
      x: x - width / 2,
      y: y - height / 2,
      width,
      height,
      stroke,
      fill,
      strokeWidth,
      rx: radius,
      ry: radius,
    }
    // getShape 的返回值是一个通过 h 方法创建的 svg 元素
    return h("g", {}, [
      h("rect", { ...attrs }),
      h(
        'svg',
        {
          x: x - width / 2 + 5,
          y: y - height / 2 + 5,
          width: 25,
          height: 25,
          viewBox: "0 0 1274 1024",
        },
        h(
          'path',
          {
            fill: stroke,
            d:
              "M655.807326 287.35973m-223.989415 0a218.879 218.879 0 1 0 447.978829 0 218.879 218.879 0 1 0-447.978829 0ZM1039.955839 895.482975c-0.490184-212.177424-172.287821-384.030443-384.148513-384.030443-211.862739 0-383.660376 171.85302-384.15056 384.030443L1039.955839 895.482975z",
          }
        )
      )
    ]
    );
  }
}

const UserTask = {
  type: 'bpmn:userTask',
  view: UserTaskView,
  model: UserTaskModel,
};

export { UserTaskView, UserTaskModel };
export default UserTask;
