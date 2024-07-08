import React from 'react';
import LogicFlow from '@logicflow/core';
import '@logicflow/core/es/index.css';

import CustomEllipse from './customEllipse';
import CustomCircle from './customCircle';
import CustomPolygon from './customPolygon';
import CustomDiamond from './customDiamond';
import CustomRect from './customRect';

import data from './customData';
import '../../../index.less';

const SilentConfig = {
  isSilentMode: true,
  stopScrollGraph: true,
  stopMoveGraph: true,
  stopZoomGraph: true,
  adjustNodePosition: true,
};

export default class Example extends React.Component {
  private container?: HTMLDivElement;

  componentDidMount() {
    const lf = new LogicFlow({
      container: this.container!,
      grid: true,
      ...SilentConfig,
    });

    lf.register(CustomEllipse);
    lf.register(CustomCircle);
    lf.register(CustomPolygon);
    lf.register(CustomDiamond);
    lf.register(CustomRect);

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
