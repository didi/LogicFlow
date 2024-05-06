import React from 'react';
import LogicFlow from '@logicflow/core';
// import '@logicflow/core/es/index.css';
import '@logicflow/core/dist/style/index.css';
import './index.less';

import ColorNode from './node/colorNode';
import TypeNode from './node/typeNode';
import LevelNode from './node/levelNode';
import OutputNode from './node/outputNode';

const data = {
  nodes: [
    {
      id: '1',
      type: 'ColorNode',
      x: 150,
      y: 80,
    },
    {
      id: '2',
      type: 'TypeNode',
      x: 100,
      y: 200,
    },
    {
      id: '3',
      type: 'LevelNode',
      x: 150,
      y: 320,
    },
    {
      id: '4',
      type: 'OutputNode',
      x: 500,
      y: 200,
    },
  ],
  edges: [
    {
      sourceNodeId: '1',
      targetNodeId: '4',
      type: 'bezier',
      startPoint: {
        x: 215,
        y: 80,
      },
      endPoint: {
        x: 350,
        y: 200,
      },
    },
    {
      sourceNodeId: '2',
      targetNodeId: '4',
      type: 'bezier',
      startPoint: {
        x: 150,
        y: 200,
      },
      endPoint: {
        x: 350,
        y: 200,
      },
    },
    {
      sourceNodeId: '3',
      targetNodeId: '4',
      type: 'bezier',
      startPoint: {
        x: 215,
        y: 320,
      },
      endPoint: {
        x: 350,
        y: 200,
      },
    },
  ],
};
const SilentConfig = {
  isSilentMode: true,
  stopScrollGraph: true,
  stopMoveGraph: true,
  stopZoomGraph: true,
  adjustNodePosition: true,
};
const styleConfig: Partial<LogicFlow.Options> = {
  style: {
    rect: {
      rx: 5,
      ry: 5,
      strokeWidth: 2,
    },
    circle: {
      fill: '#f5f5f5',
      stroke: '#fff',
    },
    edgeAnimation: {
      stroke: '#d2d2d2',
    },
  },
};

export default class Example extends React.Component {
  private container!: HTMLDivElement;
  lf!: LogicFlow;
  timer: NodeJS.Timer | undefined;

  componentDidMount() {
    const lf = new LogicFlow({
      container: this.container,
      grid: true,
      ...SilentConfig,
      ...styleConfig,
    });

    this.lf = lf;
    lf.register(ColorNode);
    lf.register(TypeNode);
    lf.register(LevelNode);
    lf.register(OutputNode);

    lf.render(data);
    this.edgeAnimation();
    this.handleAnimation();

    lf.on(
      'color:color-change,level:level-change,type:type-change',
      (data: any) => {
        lf.setProperties('4', {
          [data.lable]: data.value,
        });
      },
    );
  }

  changeOutput = () => {
    const targetNode = document.querySelectorAll('.menu-item') || [];
    targetNode.forEach((itemNode) => {
      const isHas = itemNode.classList.contains('choose');
      if (isHas) {
        itemNode.classList.remove('choose');
      } else {
        itemNode.classList.add('choose');
      }
    });
  };

  handleAnimation = () => {
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.timer = setInterval(() => {
      this.changeOutput();
    }, 2000);
  };

  edgeAnimation = () => {
    const lf = this.lf;
    const { edges } = lf.getGraphRawData();
    edges.forEach(({ id }) => {
      lf.openEdgeAnimation(id);
    });
  };

  refContainer = (container: HTMLDivElement) => {
    this.container = container;
  };

  componentWillUnmount() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  render() {
    return (
      <div className="helloworld-app demo">
        <div className="app-content" ref={this.refContainer} />
      </div>
    );
  }
}
