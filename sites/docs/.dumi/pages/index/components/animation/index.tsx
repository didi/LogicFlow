import React from 'react';
import lottie from 'lottie-web';
import './index.less';
import introduce from './homepage.json';

export default class Animate extends React.Component {
  private container!: HTMLDivElement;
  componentDidMount() {
    lottie.loadAnimation({
      container: this.container,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData: introduce,
    });
  }
  refContainer = (container: HTMLDivElement) => {
    this.container = container;
  };

  componentWillUnmount() {}

  render() {
    return <div className="animation" ref={this.refContainer}></div>;
  }
}
