import { RectNode, RectNodeModel } from '@logicflow/core';

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

export const Rect = {
  type: 'rect',
  view: RectNode,
  model: CustomRectModel,
};
