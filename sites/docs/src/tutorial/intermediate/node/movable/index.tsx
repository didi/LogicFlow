import React from 'react';
import LogicFlow from '@logicflow/core';
// import '@logicflow/core/es/index.css';
import '@logicflow/core/dist/style/index.css';
import customNode from './customNode';
import movableNode from './movableNode';

import data from './movableData';
import '../../../index.less';

const SilentConfig = {
  stopScrollGraph: true,
  stopMoveGraph: true,
};

export default class Example extends React.Component {
  private container: HTMLDivElement;

  componentDidMount() {
    const lf = new LogicFlow({
      container: this.container,
      grid: true,
      ...SilentConfig,
    });

    lf.register(customNode);
    lf.register(movableNode);

    lf.graphModel.addNodeMoveRules((model, deltaX, deltaY) => {
      if (model.isGroup && model.children) {
        // 如果移动的是分组，那么分组的子节点也跟着移动。
        lf.graphModel.moveNodes(model.children, deltaX, deltaY, true);
      }
      return true;
    });

    lf.render(data);
    lf.translateCenter();
  }

  refContainer = (container: HTMLDivElement) => {
    this.container = container;
  };

  render() {
    return (
      <div className="helloworld-app">
        <div className="app-content" ref={this.refContainer} />
      </div>
    );
  }
}
