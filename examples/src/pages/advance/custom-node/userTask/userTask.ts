import { BaseNodeModel, ConnectRule } from "@logicflow/core";

const EXCLUSIVE_GATEWAY_NAME = "gateway";

type RegisterUserTaskType = {
  RectNode: any;
  RectNodeModel: any;
  h: any;
};

export const registerUserTaskNode: any = ({
  RectNode,
  RectNodeModel,
  h,
}: RegisterUserTaskType) => {
  class UserTaskView extends RectNode {
    getLabelShape() {
      const attributes = this.getAttributes();
      const { x, y, width, height, stroke } = attributes;
      return h(
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
    }
    getShape() {
      const attributes = this.getAttributes();
      const {
        x,
        y,
        width,
        height,
        fill,
        stroke,
        strokeWidth,
        radius,
      } = attributes;

      return h("g", {}, [
        h("rect", {
          x: x - width / 2,
          y: y - height / 2,
          rx: radius,
          ry: radius,
          fill,
          stroke,
          strokeWidth,
          width,
          height,
        }),
        this.getLabelShape(),
      ]);
    }
  }
  class UserTaskModel extends RectNodeModel {
    // 自定义连线规则
    getConnectedSourceRules(): ConnectRule[] {
      const rules = super.getConnectedSourceRules();
      const gatewayOnlyAsTarget = {
        message: "流程节点下一个节点只能是网关节点",
        validate: (source: BaseNodeModel, target: BaseNodeModel | any) => {
          let isValid = true;
          if (target.type !== EXCLUSIVE_GATEWAY_NAME) {
            isValid = false;
          }
          return isValid;
        },
      };
      rules.push(gatewayOnlyAsTarget);
      return rules;
    }
  }
  return {
    view: UserTaskView,
    model: UserTaskModel,
  };
};
