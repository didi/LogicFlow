import { IvrNodeModel, IvrNode } from './IvrNode.mjs';
// import { featureType } from '../config';

const featureListData = (data) => {
  const { buttonListConfig = {} } = data;
  const { enable = false, buttons = [] } = buttonListConfig;
  if (!enable) {
    return [];
  }
  const list = [];
  buttons &&
        buttons.length > 0 &&
        buttons.forEach(item => {
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

// 执行节点
export default function registerExecute(lf) {
  class ExecuteNodeModel extends IvrNodeModel {
    getFeatureData(data) {
      return featureListData(data);
    }
  }
  class ExecuteNode extends IvrNode {
    getFeatureData(data) {
      return featureListData(data);
    }
  }
  lf.register({
    type: 'executeNode',
    view: ExecuteNode,
    model: ExecuteNodeModel,
  });
}
