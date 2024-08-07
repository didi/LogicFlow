import React from 'react';
import LogicFlow from '@logicflow/core';
import '@logicflow/core/es/index.css';
import UserTask from './userTask';

import data from './viewData';
import '../../../index.less';

const SilentConfig = {
  stopScrollGraph: true,
  stopMoveGraph: true,
  stopZoomGraph: true,
};

export default class Example extends React.Component {
  private container!: HTMLDivElement;

  componentDidMount() {
    const lf = new LogicFlow({
      container: this.container,
      grid: true,
      ...SilentConfig,
    });

    lf.register(UserTask);

    lf.render(data);
    lf.translateCenter();

    // node 点击事件
    lf.on('node:click', ({ data }: any) => {
      lf.setProperties(data.id, {
        // 改变业务属性
        isClicked: !data.properties.isClicked,
        scale: 0.8, // 缩小
      });
    });
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
