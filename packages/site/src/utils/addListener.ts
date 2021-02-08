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
  }
}

export default CustomListener;
