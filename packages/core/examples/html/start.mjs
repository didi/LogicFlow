import { IvrNodeModel, IvrNode } from './IvrNode.mjs';

//  开始节点
export default function registerStart(lf) {
  class StartNodeModel extends IvrNodeModel {
    getAnchorList() {
      const anchorRule = {
        isSourceAnchor: true,
        isTargetAnchor: false,
      };
      const anchorList = [
        {
          x: this.width / 2,
          y: 0,
          ...anchorRule,
        },
        {
          x: -this.width / 2,
          y: 0,
          ...anchorRule,
        },
        {
          x: 0,
          y: -this.height / 2,
          ...anchorRule,
        },
        {
          x: 0,
          y: this.height / 2,
          ...anchorRule,
        },
      ];
      return anchorList;
    }

    getNodeTargetRules() {
      const startOnlyAsTarget = {
        message: '开始节点只能连出，不可以连入。',
        validate: (source) => {
          console.log(source);
          return source.type === 'start';
        },
      };
      return [startOnlyAsTarget];
    }
  }
  class StartNode extends IvrNode {
    getSubNodeName() { return ''; }
  }
  lf.register({
    type: 'startNode',
    view: StartNode,
    model: StartNodeModel,
  });
}
