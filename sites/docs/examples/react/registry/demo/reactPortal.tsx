/**
 * 提前挂载到window，可直接使用register、ReactNodeProps、Portal
 * (window as any).register = require('@logicflow/react-node-registry').register;
 * (window as any).ReactNodeProps = require('@logicflow/react-node-registry').ReactNodeProps;
 * (window as any).Portal = require('@logicflow/react-node-registry').Portal;
 */
import React, { FC, useContext } from 'react';
import { Button, Divider } from 'antd';

const LFReactPortalProvider = Portal.getProvider(); // 注意，一个 LogicFlow 实例只能生命一个 portal provider
const ThemeContext = React.createContext('light');

const container = document.querySelector('#container');
const root = createRoot(container);

const NodeComponent: FC<ReactNodeProps> = ({ node }) => {
  const theme = useContext(ThemeContext);
  const data = node.getData();
  if (!data.properties) data.properties = {};

  return (
    <div className={`react-algo-node ${theme === 'light' ? 'light' : 'dark'}`}>
      <img
        src="https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/examples/react/custom-react/didi.png"
        alt="滴滴出行"
      />
      <span>{data.properties.name as string}</span>
    </div>
  );
};

class Example extends React.Component {
  private container!: HTMLDivElement;
  private count = 0;
  private timer?: ReturnType<typeof setTimeout>;

  state = {
    theme: 'light',
  };

  componentDidMount() {
    const lf = new LogicFlow({
      container: this.container,
    });

    lf.render({
      nodes: [
        {
          type: 'rect',
          x: 400,
          y: 100,
          text: '???',
          properties: {
            name: '矩形',
          },
        },
      ],
    });

    register(
      {
        type: 'custom-react-node',
        component: NodeComponent,
      },
      lf,
    );

    const node = lf.addNode({
      id: 'react-node-1',
      type: 'custom-react-node',
      x: 80,
      y: 80,
      properties: {
        name: '今日出行',
        width: 120,
        height: 28,
      },
    });
    console.log('node --->>>', node);

    const update = () => {
      // lf.setProperties('react-node-1', { name: `逻辑回归 ${(this.count += 1)}` })
      node.setProperty('name', `今日出行 ${(this.count += 1)}`);
      this.timer = setTimeout(update, 1000);
    };

    update();
  }

  componentWillUnmount() {
    console.log('0-0-0 componentWillUnmount 0-0-0');
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  changeTheme = () => {
    this.setState({
      theme: this.state.theme === 'light' ? 'dark' : 'light',
    });
  };

  refContainer = (container: HTMLDivElement) => {
    this.container = container;
  };

  render() {
    return (
      <>
        <ThemeContext.Provider value={this.state.theme}>
          <LFReactPortalProvider />
        </ThemeContext.Provider>
        <Button onClick={this.changeTheme}>
          {this.state.theme === 'light' ? '切换到暗色' : '切换到亮色'}
        </Button>
        <Divider />
        <div ref={this.refContainer} id="graph"></div>
      </>
    );
  }
}

root.render(<Example></Example>);

insertCss(`
#graph{
  width: 100%;
  height: 100%;
}
.react-algo-node {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  border: 1px solid #e59b68;
  border-radius: 14px;

  img {
    width: 24px;
    height: 24px;
  }

  span {
    margin-left: 4px;
    color: #000000a6;
    font-size: 12px;
  }

  &.dark {
    background-color: #141414;

    span {
      color: #fff;
    }
  }
}
`);
