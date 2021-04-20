import LogicFlow from '@logicflow/core';

class CustomNode {
  lf: LogicFlow;

  constructor(lf: LogicFlow) {
    this.lf = lf;
  }

  // 注册所有的自定义节点
  registerAll() {
    this.registerRect();
    // ...
  }

  registerRect() {
    this.lf.register('rect', ({ RectNode, RectNodeModel }) => {
      class CustomRectModel extends RectNodeModel {
        getConnectedSourceRules() {
          const rules = super.getConnectedSourceRules();
          const rule = {
            message: '不满足连线的校验规则',
            validate: (source, target) => {
              // 校验规则
              console.log(target);
              return true;
            },
          };
          rules.push(rule);
          return rules;
        }
      }
      return {
        view: RectNode,
        model: CustomRectModel,
      };
    });
  }
}

export default CustomNode;
