import { Component, h } from 'preact';
import LogicFlow from '@logicflow/core';
import { Snapshot, Dnd, Menu } from '@logicflow/extension';
import Share from './component/Share';
import Setting from './component/Setting';
import Links from './component/Links';
import './index.less';
import CustomNode from './lib/utils/registerNode';

LogicFlow.use(Snapshot);
LogicFlow.use(Dnd);
LogicFlow.use(Menu);

type IProps = {
};

type IState = {
};

export default class App extends Component<IProps, IState> {
  lf: LogicFlow;

  componentDidMount() {
    this.lf = new LogicFlow({
      container: document.querySelector('#graph'),
      background: {
        color: '#FFFFFF',
      },
      grid: {
        size: 15,
        type: 'dot',
      },
      keyboard: {
        enabled: true,
      },
    });

    const customNode = new CustomNode(this.lf);
    customNode.registerAll();
    this.lf.render({});
  }

  exportIMG = () => {
    this.lf.getSnapshot();
  };

  getGraphData = () => {
    const data = this.lf.getGraphData();
    console.log('图数据为：', data);
  };

  render() {
    return (
      <div className="designer">
        <div className="viewport" id="graph" />
        <div className="designer-right">
          <Share exportIMG={this.exportIMG} getGraphData={this.getGraphData} />
          <Setting />
          <Links />
        </div>
      </div>
    );
  }
}
