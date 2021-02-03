import LogicFlow from '@logicflow/core';

class CustomListener {
  lf: LogicFlow;

  constructor(lf: LogicFlow) {
    this.lf = lf;
  }

  addAll() {
    this.addNodeListener();
    // ...
  }

  addNodeListener() {
    const { lf } = this;
    lf.on('node:click', ({ data }) => {
      console.log('单击', data);
    });
    lf.on('node:dbclick', ({ data }) => {
      console.log('双击', data);
    });
    lf.on('node:mouseenter', (param) => {
      console.log(param);
    });
    lf.on('node:mouseleave', (param) => {
      console.log(param);
    });
    lf.on('edge:mouseenter', (param) => {
      console.log(param);
    });
    lf.on('edge:mouseleave', (param) => {
      console.log(param);
    });
  }
}

export default CustomListener;
