import React from 'react';
import LogicFlow from '@logicflow/core';
import '@logicflow/core/es/index.css';
import customEdge from './customEdge';

import data from './data';
import '../../../index.less';

const SilentConfig = {
  stopScrollGraph: true,
  stopMoveGraph: true,
  stopZoomGraph: true,
};

export default class Example extends React.Component {
  private container?: HTMLDivElement;

  componentDidMount() {
    const lf = new LogicFlow({
      container: this.container!,
      grid: true,
      ...SilentConfig,
    });

    lf.register(customEdge);
    lf.setDefaultEdgeType('custom-edge');

    lf.setTheme({
      edgeText: {
        textWidth: 100,
        overflowMode: 'autoWrap',
        fontSize: 12,
        background: {
          fill: '#FFFFFF',
        },
      },
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
