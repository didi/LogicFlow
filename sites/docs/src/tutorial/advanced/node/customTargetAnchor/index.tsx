import React from 'react';
import LogicFlow from '@logicflow/core';
import '@logicflow/core/es/index.css';
import './index.less';

import data from './customAnchorData';

const SilentConfig = {
  stopScrollGraph: true,
  stopMoveGraph: true,
  stopZoomGraph: true,
};

export default class CustomAnchorExample extends React.Component {
  private container!: HTMLDivElement;
  private lf!: LogicFlow;

  componentDidMount() {
    if (!this.container) return;

    const lf = new LogicFlow({
      container: this.container,
      grid: true,
      // 自定义“拖拽连线到目标节点时”的落点锚点选择规则
      // 目标：无论鼠标释放在节点的哪个位置，都固定连接到最左侧锚点
      customTargetAnchor: (nodeModel) => {
        // nodeModel.anchors 为节点上所有锚点（已换算到画布坐标）
        const anchors = nodeModel?.anchors || [];
        if (!anchors.length) return;

        // 则选择 x 最小的锚点作为“最左侧锚点”
        const left = anchors.reduce(
          (min, a) => (a.x < min.x ? a : min),
          anchors[0],
        );

        // 返回 { index, anchor } 以告知 LogicFlow 最终应连接的目标锚点
        return {
          index: anchors.indexOf(left),
          anchor: left,
        };
      },
      ...SilentConfig,
    });
    this.lf = lf;

    lf.render(data);
    lf.translateCenter();
  }

  refContainer = (container: HTMLDivElement) => {
    this.container = container;
  };
  render() {
    return (
      <div className="custom-anchor-container">
        <div className="custom-anchor" ref={this.refContainer} />
      </div>
    );
  }
}
