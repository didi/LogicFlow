import { IvrNodeModel, IvrNode } from './IvrNode.mjs';
// import { featureType } from '../config';

const featureLisrData = (data) => {
  const { subNodeType, buttonListConfig = {}, branchListConfig = {} } = data;
  let featureData = {};
  // 根据不同子节点，获取按键列表数据
  switch (subNodeType) {
    case 'menu': {
      const { enable = false, buttons = [] } = buttonListConfig;
      const listData = buttons.map(item => ({ ...item, type: 1 }));
      featureData = {
        enable,
        listData,
      };
      break;
    }
    case 'asr': {
      const { enable = false, branches = [] } = branchListConfig;
      const listData = branches.map(item => ({ ...item, type: 1 }));
      featureData = {
        enable,
        listData,
      };
      break;
    }
    default:
      break;
  }
  // 没有启用直接返回空数组
  const { enable = false, listData = [] } = featureData;
  if (!enable) {
    return [];
  }
  // 返回已启用的按键列表
  const list = [];
  listData &&
    listData.length > 0 &&
    listData.forEach(item => {
      const { type, ivrValue, name } = item;
      if (item.enable) {
        list.push({
          type,
          ivrValue,
          name,
        });
      }
    });
  return list;
};

// 用户节点
export default function registerUser(lf) {
  class UserNodeModel extends IvrNodeModel {
    getFeatureData(data) {
      return featureLisrData(data);
    }
  }
  class UserNode extends IvrNode {
    getFeatureData(data) {
      return featureLisrData(data);
    }
  }
  lf.register({
    type: 'userNode',
    view: UserNode,
    model: UserNodeModel,
  });
}
