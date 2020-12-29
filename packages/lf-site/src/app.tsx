import { Component, h } from 'preact';
import { Snapshot } from '@logicflow/extension';
import LogicFlow from '@logicflow/core';
import Panel from './component/Panel';
import Share from './component/Share';
import Setting from './component/Setting';
import Links from './component/Links';
import Properties from './component/Properties';
import './index.less';
// import { NodeConfig } from '../src/type';
type IProps = {
};

type IState = {
  // node: NodeConfig;
};

export default class App extends Component<IProps, IState> {
  lf: LogicFlow;
  // constructor(props) {
  //   super(props);
  //   this.state = {
  //     node: '',
  //   };
  // }
  componentDidMount() {
    LogicFlow.use(Snapshot);
    this.lf = new LogicFlow({
      container: document.querySelector('#graph'),
      tool: {
        menu: true,
        control: true,
      },
      background: {
        color: '#F0F0F0',
      },
      // @ts-ignore
      grid: {
        size: 20,
        type: 'dot',
      },
      keyboard: {
        enabled: true,
      },
    });
    this.lf.register('circle', ({ CircleNode, CircleNodeModel }) => {
      class MyCircleNode extends CircleNode {
      }
      class MyCircleModel extends CircleNodeModel {
        constructor(data, graphModel) {
          if (data.text && typeof data.text === 'string') {
            data.text = {
              value: data.text,
              x: data.x,
              y: data.y,
            };
          }
          super(data, graphModel);
        }
      }
      return {
        view: MyCircleNode,
        model: MyCircleModel,
      };
    });
    this.lf.register('rect', ({ RectNode, RectNodeModel }) => {
      class UserNode extends RectNode {
      }
      class UserModel extends RectNodeModel {
        constructor(data, graphModel) {
          if (data.text && typeof data.text === 'string') {
            data.text = {
              value: data.text,
              x: data.x,
              y: data.y,
            };
          }
          super(data, graphModel);
        }
      }
      return {
        view: UserNode,
        model: UserModel,
      };
    });
    this.lf.register('star', ({ PolygonNode, PolygonNodeModel }) => {
      class StarNode extends PolygonNode {
      }
      class StarModel extends PolygonNodeModel {
        constructor(data, graphModel) {
          super(data, graphModel);
          this.points = [
            [45, 0],
            [20, 90],
            [90, 30],
            [0, 30],
            [80, 90],
          ];
        }
      }
      return {
        view: StarNode,
        model: StarModel,
      };
    });
    this.lf.register('triangle', ({ PolygonNode, PolygonNodeModel }) => {
      class TriangleNode extends PolygonNode {
      }
      class TriangleModel extends PolygonNodeModel {
        constructor(data, graphModel) {
          if (data.text && typeof data.text === 'string') {
            data.text = {
              value: data.text,
              x: data.x,
              y: data.y + 20,
            };
          }
          super(data, graphModel);
          this.points = [
            [50, 0],
            [100, 100],
            [0, 100],
          ];
        }
      }
      return {
        view: TriangleNode,
        model: TriangleModel,
      };
    });
    this.lf.register('ellipse', ({ EllipseNode, EllipseNodeModel }) => {
      class MyEllipseNode extends EllipseNode {
      }
      class MyEllipseModel extends EllipseNodeModel {
        constructor(data, graphModel) {
          super(data, graphModel);
          this.rx = 60;
          this.ry = 40;
        }
      }
      return {
        view: MyEllipseNode,
        model: MyEllipseModel,
      };
    });
    this.lf.register('hexagon', ({ PolygonNode, PolygonNodeModel }) => {
      class HexagonNode extends PolygonNode {
      }
      class HexagonModel extends PolygonNodeModel {
        constructor(data, graphModel) {
          super(data, graphModel);
          this.points = [
            [40, 0],
            [80, 20],
            [80, 60],
            [40, 80],
            [0, 60],
            [0, 20],
          ];
        }
      }
      return {
        view: HexagonNode,
        model: HexagonModel,
      };
    });
    this.lf.on('node:click', ({ id }) => {
      const nodeModel = this.lf.getNodeModel(id);
      this.setState({
        node: nodeModel,
      });
    });
    this.lf.render({});
  }

  mouseDownHandle = config => {
    this.lf.dnd.startDrag(config);
  };

  exportIMG = () => {
    // @ts-ignore
    this.lf.getSnapshot();
  };
  getGraphData = () => {
    const data = this.lf.getGraphData();
    console.log('图数据为：', data);
  };
  // gridChange = v => {
  //   console.log(v);
  // };
  changeNodeColor = (id, color) => {
    const nodeModel = this.lf.getNodeModel(id);
    nodeModel.setProperties({
      background: color,
    });
  };
  render() {
    const { node } = this.state;
    return (
      <div className="designer">
        <Panel mouseDownHandle={(config) => this.mouseDownHandle(config)} />
        <div
          className="viewport"
          id="graph"
        />
        <div className="designer-right">
          <Share exportIMG={this.exportIMG} getGraphData={this.getGraphData} />
          <Setting />
          <Links />
        </div>
        {
          node ? <Properties node={node} changeNodeColor={(color) => { this.changeNodeColor(node.id, color); }} /> : ''
        }
      </div>
    );
  }
}
