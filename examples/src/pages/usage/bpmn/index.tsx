import React, { Component } from 'react';
import LogicFlow from '@logicflow/core';
import {
  BpmnElement,
  BpmnXmlAdapter,
  Snapshot,
  Control,
  Menu,
  SelectionSelect,
} from '@logicflow/extension';
import BpmnPattern from './pattern';
import BpmnIo from './io';
import './index.css';
import { Button } from 'antd';
import 'antd/lib/button/style/index.css';
import '@logicflow/extension/lib/style/index.css';
import ExampleHeader from '../../../components/example-header';

const config = {
  stopScrollGraph: true,
  stopZoomGraph: true,
  metaKeyMultipleSelected: true,
  grid: {
    size: 10,
    type: 'dot',
  },
  keyboard: {
    enabled: true,
  },
  snapline: true,
}

type IState = {
  rendered: boolean;
}
type IProps = {}

export default class BpmnExample extends Component<IProps, IState>{
  lf: LogicFlow;
  constructor(props: {} | Readonly<{}>) {
    super(props);
    this.state = {
      rendered: true,
    };
  }
  componentDidMount() {
    LogicFlow.use(BpmnElement);
    LogicFlow.use(BpmnXmlAdapter);
    LogicFlow.use(Snapshot);
    LogicFlow.use(Control);
    LogicFlow.use(Menu);
    LogicFlow.use(SelectionSelect);
    const lf = new LogicFlow({
      ...config,
      container: document.querySelector('#graph') as HTMLElement
    });
    lf.render()
    this.lf = lf;
    this.setState({
      rendered: true,
    });
  }
  render() {
    const { rendered } = this.state;
    let tools;
    if (rendered) {
      tools = (
        <div>
          <BpmnPattern lf={this.lf} />
          <BpmnIo lf={this.lf} />
        </div>
      );
    }
    return (
      <>
        <ExampleHeader>
          <div>
            点击左下角下载 XML，将文件上传到
            <Button type="link" href="https://demo.bpmn.io/" target="_blank">BPMN Demo</Button>
            即可使用
          </div>
        </ExampleHeader>
        <div className="bpmn-example-container">
          <div id="graph" className="viewport"></div>
          {tools}
        </div>
      </>
    )
  }
}

