import { Component, h } from 'preact';
import LogicFlow from '@logicflow/core';
import { Snapshot, DndPanel, Menu } from '@logicflow/extension';
import Share from './component/Share';
import Setting from './component/Setting';
import Links from './component/Links';
import './index.less';
import CustomNode from './utils/registerNode';
import CustomListener from './utils/addListener';

LogicFlow.use(Snapshot);
LogicFlow.use(DndPanel);
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
    const customListener = new CustomListener(this.lf);
    customNode.registerAll();
    customListener.addAll();
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
