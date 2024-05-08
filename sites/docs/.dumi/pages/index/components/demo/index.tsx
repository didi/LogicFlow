import React from 'react';
import LogicFlow from '@logicflow/core';
import '@logicflow/core/es/index.css';
import './index.less';

import StepNode from './node/stepNode';
import CircleNode from './node/circleNode';

const data = {
  nodes: [
    {
      id: '1',
      type: 'StepNode',
      text: 'Node 1',
      x: 80,
      y: 200,
      properties: { level: 1 },
    },
    {
      id: '2',
      type: 'StepNode',
      text: 'Node 2',
      x: 280,
      y: 200,
      properties: { level: 2 },
    },
    {
      id: '3',
      type: 'StepNode',
      text: 'Node 3',
      x: 480,
      y: 100,
      properties: { level: 3 },
    },
    {
      id: '5',
      type: 'StepNode',
      text: 'Node 5',
      x: 720,
      y: 100,
      properties: { level: 4 },
    },
    {
      id: '4',
      type: 'StepNode',
      text: 'Node 4',
      x: 480,
      y: 300,
      properties: { level: 3 },
    },
    {
      id: '6',
      type: 'StepNode',
      text: 'Node 6',
      x: 720,
      y: 240,
      properties: { level: 4 },
    },
    {
      id: '8',
      type: 'StepNode',
      text: 'Node 8',
      x: 940,
      y: 240,
      properties: { level: 5 },
    },
    {
      id: '7',
      type: 'StepNode',
      text: 'Node 7',
      x: 720,
      y: 340,
      properties: { level: 4 },
    },
    {
      id: '9',
      type: 'StepNode',
      text: 'Node 9',
      x: 940,
      y: 340,
      properties: { level: 5 },
    },
    // {
    //   id: '5',
    //   type: 'StepNode',
    //   text: 'Node 5',
    //   x: 900,
    //   y: 100,
    // },
  ],
  edges: [
    {
      id: 'edges-1',
      sourceNodeId: '1',
      targetNodeId: '2',
      type: 'polyline',
      startPoint: {
        x: 135,
        y: 200,
      },
      endPoint: {
        x: 220,
        y: 200,
      },
      properties: { level: 1 },
    },
    {
      id: 'edges-2',
      sourceNodeId: '2',
      targetNodeId: '3',
      type: 'polyline',
      startPoint: {
        x: 280,
        y: 175,
      },
      endPoint: {
        x: 420,
        y: 100,
      },
      properties: { level: 2 },
    },
    {
      id: 'edges-4',
      sourceNodeId: '3',
      targetNodeId: '5',
      type: 'polyline',
      startPoint: {
        x: 535,
        y: 100,
      },
      endPoint: {
        x: 660,
        y: 100,
      },
      properties: { level: 3 },
    },
    {
      id: 'edges-3',
      sourceNodeId: '2',
      targetNodeId: '4',
      type: 'polyline',
      startPoint: {
        x: 280,
        y: 220,
      },
      endPoint: {
        x: 420,
        y: 300,
      },
      properties: { level: 2 },
    },
    {
      id: 'edges-5',
      sourceNodeId: '4',
      targetNodeId: '6',
      type: 'polyline',
      startPoint: {
        x: 535,
        y: 300,
      },
      endPoint: {
        x: 660,
        y: 240,
      },
      pointsList: [
        {
          x: 535,
          y: 300,
        },
        {
          x: 587,
          y: 300,
        },
        {
          x: 587,
          y: 240,
        },
        {
          x: 600,
          y: 240,
        },
        {
          x: 630,
          y: 240,
        },
        {
          x: 660,
          y: 240,
        },
      ],
      properties: { level: 3 },
    },
    {
      id: 'edges-7',
      sourceNodeId: '6',
      targetNodeId: '8',
      type: 'polyline',
      startPoint: {
        x: 720,
        y: 215,
      },
      endPoint: {
        x: 940,
        y: 215,
      },
      properties: { level: 4 },
    },
    {
      id: 'edges-6',
      sourceNodeId: '4',
      targetNodeId: '7',
      type: 'polyline',
      startPoint: {
        x: 535,
        y: 300,
      },
      endPoint: {
        x: 660,
        y: 340,
      },
      pointsList: [
        {
          x: 535,
          y: 300,
        },
        {
          x: 570,
          y: 300,
        },
        {
          x: 587,
          y: 300,
        },
        {
          x: 587,
          y: 340,
        },
        {
          x: 630,
          y: 340,
        },
        {
          x: 660,
          y: 340,
        },
      ],
      properties: { level: 3 },
    },
    {
      id: 'edges-8',
      sourceNodeId: '7',
      targetNodeId: '9',
      type: 'polyline',
      startPoint: {
        x: 720,
        y: 360,
      },
      endPoint: {
        x: 940,
        y: 360,
      },
      properties: {
        level: 4,
      },
    },
  ],
};
const SilentConfig = {
  isSilentMode: true,
  // stopScrollGraph: true,
  stopMoveGraph: 'vertical',
  stopZoomGraph: true,
  adjustNodePosition: true,
  allowRotation: false,
  hoverOutline: false,
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
      stroke: '#3487fc',
    },
    polyline: {
      stroke: '#A7AEBC',
    },
    outline: {
      hover: {
        stroke: 'none',
      },
    },
  },
};

export default class Example extends React.Component {
  private container!: HTMLDivElement;
  lf!: LogicFlow;
  state = {
    start: false,
    isActiveLeft: false,
    isActiveRight: false,
  };
  isEnglish = window.location.href.includes('en');

  componentDidMount() {
    const lf = new LogicFlow({
      container: this.container,
      grid: true,
      ...SilentConfig,
      ...styleConfig,
    } as any);

    this.lf = lf;
    lf.register(StepNode);
    lf.register(CircleNode);

    lf.render(data);
    lf.translateCenter();
  }

  edgeAnimation = () => {
    const lf = this.lf;
    const { edges, nodes } = lf.getGraphRawData();

    const eleArr: any[] = [...nodes, ...edges];
    const eleObj: any = {};
    eleArr.forEach((item) => {
      const level: number = item.properties?.level;

      if (!eleObj[level]) {
        eleObj[level] = [item];
      } else {
        eleObj[level].push(item);
      }
    });
    for (const i in eleObj) {
      ((i) => {
        const index = Number(i);
        const itemArr = eleObj[i];

        setTimeout(() => {
          itemArr.forEach((item: any) => {
            const { id, properties, type } = item;
            if (type.includes('line')) {
              lf.openEdgeAnimation(id);
            } else if (type.includes('Node')) {
              lf.setProperties(id, {
                ...properties,
                isAnimation: true,
              });
            }
          });
        }, index * 300);
        setTimeout(
          () => {
            itemArr.forEach((item: any) => {
              const { id, properties, type } = item;
              if (type.includes('line')) {
                lf.closeEdgeAnimation(id);
              } else if (type.includes('Node')) {
                lf.setProperties(id, {
                  ...properties,
                  isAnimation: false,
                });
              }
            });
          },
          (index + 1) * 330,
        );
      })(i);
    }
  };

  edgeAnimationSingle = () => {
    const lf = this.lf;
    const { edges, nodes } = lf.getGraphRawData();
    const eleArr: any[] = [];
    nodes.forEach((item, idx) => {
      eleArr.push(item);
      if (edges[idx]) {
        eleArr.push(edges[idx]);
      }
    });
    eleArr.forEach(({ id, properties, type }, index) => {
      ((index) => {
        setTimeout(() => {
          if (type.includes('line')) {
            lf.openEdgeAnimation(id);
          } else if (type.includes('Node')) {
            lf.setProperties(id, {
              ...properties,
              isAnimation: true,
            });
          }
        }, index * 300);

        setTimeout(
          () => {
            if (type.includes('line')) {
              lf.closeEdgeAnimation(id);
            } else if (type.includes('Node')) {
              lf.setProperties(id, {
                ...properties,
                isAnimation: false,
              });
            }
          },
          (index + 1) * 330,
        );
      })(index);
    });
  };

  handleAnimation = (type: string) => {
    if (this.state.start) return;
    if (type === '1') {
      this.setState({ isActiveLeft: true });
      this.setState({ isActiveRight: false });
      this.edgeAnimation();
      setTimeout(() => {
        this.setState({ start: false });
        this.setState({ isActiveLeft: false });
        this.setState({ isActiveRight: false });
      }, 2000);
    } else {
      this.setState({ isActiveLeft: false });
      this.setState({ isActiveRight: true });
      this.edgeAnimationSingle();
      setTimeout(() => {
        this.setState({ start: false });
        this.setState({ isActiveLeft: false });
        this.setState({ isActiveRight: false });
      }, 5500);
    }
    this.setState({ start: true });
  };

  stopEdgeAnimation = () => {
    const lf = this.lf;
    const { edges, nodes } = lf.getGraphRawData();
    edges.forEach(({ id }) => {
      lf.closeEdgeAnimation(id);
    });
    nodes.forEach(({ id, properties }) => {
      lf.setProperties(id, {
        ...properties,
        isAnimation: false,
      });
    });
  };

  refContainer = (container: HTMLDivElement) => {
    this.container = container;
  };

  componentWillUnmount() {}

  render() {
    return (
      <div className="helloworld-app demo">
        <div className="app-content" ref={this.refContainer} />
        <div className="run-btn">
          <button
            disabled={this.state.start}
            className={`${this.state.start ? 'is-disabled' : ''} ${
              this.state.isActiveLeft ? 'active' : ''
            }`}
            onClick={() => this.handleAnimation('1')}
          >
            {this.isEnglish ? 'parallel' : '并行'}
          </button>
          <button
            disabled={this.state.start}
            className={`${this.state.start ? 'is-disabled' : ''} ${
              this.state.isActiveRight ? 'active' : ''
            }`}
            onClick={() => this.handleAnimation('2')}
          >
            {this.isEnglish ? 'serial' : '串行'}
          </button>
          {/* <span onClick={this.stopEdgeAnimation}>stop</span> */}
        </div>
      </div>
    );
  }
}
