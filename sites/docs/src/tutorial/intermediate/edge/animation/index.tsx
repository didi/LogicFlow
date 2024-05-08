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
  private container!: HTMLDivElement;
  private lf?: LogicFlow;

  componentDidMount() {
    const lf = new LogicFlow({
      container: this.container,
      grid: true,
      ...SilentConfig,
      // adjustEdgeStartAndEnd: true, // 开启两端的调整连线功能
      edgeGenerator: (sourceNode) => {
        if (sourceNode.type === 'circle') {
          return 'line';
        }
      },
    });

    lf.register(customEdge);
    lf.setDefaultEdgeType('custom-edge');

    lf.render(data);
    lf.translateCenter();
    this.lf = lf;
  }

  refContainer = (container: HTMLDivElement) => {
    this.container = container;
  };

  edgeAnimation = () => {
    const lf = this.lf;
    const { edges } = lf?.getGraphRawData() ?? {};
    edges?.forEach(({ id }) => {
      lf?.openEdgeAnimation(id);
    });
  };

  render() {
    return (
      <div className="helloworld-app">
        <div className="app-content" ref={this.refContainer} />

        <button onClick={this.edgeAnimation} className="btn">
          让边动起来
        </button>
      </div>
    );
  }
}
