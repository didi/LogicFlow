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
        x: 140,
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
        x: 540,
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
        y: 225,
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
        x: 540,
        y: 300,
      },
      endPoint: {
        x: 660,
        y: 240,
      },
      pointsList: [
        {
          x: 540,
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
        x: 540,
        y: 300,
      },
      endPoint: {
        x: 660,
        y: 340,
      },
      pointsList: [
        {
          x: 540,
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
        y: 365,
      },
      endPoint: {
        x: 940,
        y: 365,
      },
      properties: {
        level: 4,
      },
    },
  ],
};
const SilentConfig = {
  isSilentMode: true,
  stopScrollGraph: true,
  // stopMoveGraph: true,
  stopZoomGraph: true,
  adjustNodePosition: true,
  allowRotation: false,
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
        <div className="run-btn">
          <span onClick={this.edgeAnimation}>Run Multiple</span>
          <span onClick={this.edgeAnimationSingle}>Run Single</span>
          {/* <span onClick={this.stopEdgeAnimation}>stop</span> */}
        </div>
      </div>
    );
  }
}
