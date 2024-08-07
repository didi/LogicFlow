import React, { Component } from "react";
import LogicFlow from "@logicflow/core";
import Panel from "./components/panel";
import ExampleHeader from "../../../components/example-header";
import './index.css';

type IProps = {};
type IState = {};

export default class DndExample extends Component<IProps, IState> {
  lf: LogicFlow;

  componentDidMount() {
    this.lf = new LogicFlow({
      container: document.querySelector('#graph') as HTMLElement,
      stopScrollGraph: true,
      stopZoomGraph: true,
    });
    this.lf.render();
  }

  mouseDownHandle = (config: any) => {
    this.lf.dnd.startDrag(config);
  };

  render() {
    return (
      <>
        <ExampleHeader
          content="拖拽面板上的图形生成节点"
          githubPath="/basic/dnd/index.tsx"
        />
        <div className="dnd-example-container">
          <Panel mouseDownHandle={this.mouseDownHandle} />
          <div id="graph" className="viewport" />
        </div>
      </>
    );
  }
}
