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

// 导流节点
export default function registerTransfer(lf) {
  class TransferNodeModel extends IvrNodeModel {
    getFeatureData(data) {
      return featureListData(data);
    }

    // 默认所有锚点都可以连入, 但是连出。分支可以连出
    getDefaultAnchorList() {
      return [
        {
          id: 1,
          x: this.width / 2,
          y: 0,
          isSourceAnchor: false,
          isTargetAnchor: true,
        },
        {
          id: 2,
          x: -this.width / 2,
          y: 0,
          isSourceAnchor: false,
          isTargetAnchor: true,
        },
        {
          id: 3,
          x: 0,
          y: -this.height / 2,
          isSourceAnchor: false,
          isTargetAnchor: true,
        },
        {
          id: 4,
          x: 0,
          y: this.height / 2,
          isSourceAnchor: false,
          isTargetAnchor: true,
        },
      ];
    }

    // getNodeTargetRules() {
    //   const { type } = this;
    //   const name = nodeName[type] || '未知类型';
    //   // 导流节点不能被开始接待相连
    //   const startRules = {
    //     message: `${name}不能被开始节点相连！`,
    //     validate: (source) => source.type !== 'startNode',
    //   };
    //   return [startRules];
    // }
  }
  class TransferNode extends IvrNode {
    getFeatureData(data) {
      return featureListData(data);
    }
  }
  lf.register({
    type: 'transferNode',
    view: TransferNode,
    model: TransferNodeModel,
  });
}
