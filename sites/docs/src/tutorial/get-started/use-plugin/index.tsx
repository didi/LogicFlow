import React from 'react';
import LogicFlow from '@logicflow/core';
import { Control } from '@logicflow/extension';
import '@logicflow/core/es/index.css';
import '@logicflow/extension/lib/style/index.css';

import { data, SilentConfig, styleConfig } from './pluginData';
import '../index.less';

export default class Example extends React.Component {
  private container!: HTMLDivElement;

  componentDidMount() {
    const lf = new LogicFlow({
      container: this.container,
      grid: true,
      ...SilentConfig,
      ...styleConfig,
      plugins: [Control], // 局部使用 Control 插件
    });

    lf.render(data);
    lf.translateCenter();
  }

  refContainer = (container: HTMLDivElement) => {
    this.container = container;
  };

  render() {
    return (
      <div className="helloworld-app getting-started">
        <div className="app-content" ref={this.refContainer} />
      </div>
    );
  }
}
