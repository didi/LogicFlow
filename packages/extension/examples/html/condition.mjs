import { IvrNodeModel, IvrNode } from './IvrNode.mjs';
// import { featureType } from '../config';

const getLabelFeature = (data) => {
  const { labelConditionConfig = {} } = data;
  const { valueConfig = [] } = labelConditionConfig;
  return valueConfig.map(item => {
    const { ivrValue, name } = item;
    return {
      type: 1,
      ivrValue,
      name,
    };
  });
};

const featureListData = (data) => {
  const { branchListConfig = {}, subNodeType } = data;
  if (subNodeType === 'labelCondition') {
    return getLabelFeature(data);
  }
  const { enable = false, branches = [] } = branchListConfig;
  if (!enable) {
    return [];
  }
  const list = [];
  branches &&
        branches.length > 0 &&
        branches.forEach(item => {
          const { ivrValue, name } = item;
          if (item.enable) {
            list.push({
              type: 1,
              ivrValue,
              name,
            });
          }
        });
  return list;
};

// 判断节点
export default function registerCondition(lf) {
  class ConditionNodeModel extends IvrNodeModel {
    getFeatureData(data) {
      return featureListData(data);
    }
  }
  class ConditionNode extends IvrNode {
    getFeatureData(data) {
      return featureListData(data);
    }
  }
  lf.register({
    type: 'conditionNode',
    view: ConditionNode,
    model: ConditionNodeModel,
  });
}
