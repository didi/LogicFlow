import React from 'react';
import LogicFlow from '@logicflow/core';
import '@logicflow/core/es/index.css';
import { data, SilentConfig, styleConfig } from './reactData';
import CustomEdge from './customEdge';
import '../index.less';

export default class Example extends React.Component {
  private container!: HTMLDivElement;

  componentDidMount() {
    const lf = new LogicFlow({
      container: this.container,
      grid: true,
      ...SilentConfig,
      ...styleConfig,
    });

    lf.register(CustomEdge);
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
