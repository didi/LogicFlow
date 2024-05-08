import React from 'react';
import LogicFlow from '@logicflow/core';
import '@logicflow/core/es/index.css';
// import '@logicflow/core/dist/style/index.css';
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

    lf.on('node:click', ({ data }: any) => {
      lf.setProperties(data.id, {
        disabled: !data.properties.disabled,
        scale: 1.5,
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
