import React, { Component } from 'react';
import LogicFlow from '@logicflow/core';
import ExampleHeader from '../../../components/example-header';
import { Button } from 'antd';
import 'antd/lib/button/style/index.css';
import './index.css';

type GridType = 'dot' | 'mesh';

type IProps = {};

type IState = {
  currentGrid: GridType
};

const config = {
  isSilentMode: true,
  stopScrollGraph: true,
  stopZoomGraph: true,
  tool: {
    menu: false,
    control: false
  }
};

const data = {
  nodes: [
    {
      id: 10,
      type: 'rect',
      x: 100,
      y: 100,
      text: '你好！'
    },
    {
      id: 20,
      type: 'circle',
      x: 400,
      y: 100,
      text: '你好！'
    }
  ],
  edges: [
    {
      type: 'line',
      sourceNodeId: 10,
      targetNodeId: 20,
      endPoint: {
        id: '150-150',
        x: 350,
        y: 100
      }
    }
  ]
};

export default class GridExample extends Component<IProps, IState> {
  dotlf: any;
  meshlf: any;

  constructor(props: IProps) {
    super(props);
    this.dotlf = null;
    this.meshlf = null;
    this.state = {
      currentGrid: 'dot'
    }
  }

  componentDidMount() {
    this.dotlf = new LogicFlow({
      ...config,
      grid: {
        size: 10,
        type: 'dot',
      },
      container: document.querySelector('#graphDot') as HTMLElement
    });

    this.meshlf = new LogicFlow({
      ...config,
      grid: {
        size: 10,
        type: 'mesh',
      },
      container: document.querySelector('#graphMesh') as HTMLElement
    });
    this.dotlf.render(data);
    this.meshlf.render(data);
  }

  handleClick = (grid: GridType) => {
    const { currentGrid } = this.state;
    if (grid === currentGrid) return;
    else {
      this.setState({
        currentGrid: grid
      })
    }
  }

  render() {
    const { currentGrid } = this.state;

    return (
      <div>
        <ExampleHeader>
          网格类型：
          <Button onClick={() => { this.handleClick('dot') }}>Dot</Button>
          <Button onClick={() => { this.handleClick('mesh') }}>Mesh</Button>
        </ExampleHeader>
        <div
          id="graphDot"
          className={`viewport example-grid-${currentGrid === 'dot' ? 'visible' : 'hidden'}`}
        />
        <div
          id="graphMesh"
          className={`viewport example-grid-${currentGrid === 'mesh' ? 'visible' : 'hidden'}`}
        />
      </div>
    );
  }
}
