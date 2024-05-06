import React from 'react';
import LogicFlow from '@logicflow/core';
// import '@logicflow/core/es/index.css';
import '@logicflow/core/dist/style/index.css';
import sequence from './sequence';

import data from './data';
import '../../../index.less';

const SilentConfig = {
  stopScrollGraph: true,
  stopMoveGraph: true,
  stopZoomGraph: true,
};

export default class Example extends React.Component {
  private container: HTMLDivElement;

  componentDidMount() {
    const lf = new LogicFlow({
      container: this.container,
      grid: true,
      animation: true,
      ...SilentConfig,
    });

    lf.register(sequence);
    lf.setDefaultEdgeType('sequence');

    lf.render(data);
    lf.translateCenter();

    // lf.on('edge:click', ({ data }) => {
    //   lf.getEdgeModelById(data.id).setText({
    //     draggable: true,
    //   });
    // });
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
