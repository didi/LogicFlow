import React, { FC } from 'react';
import LogicFlow from '@logicflow/core';
import { register, ReactNodeProps } from '@logicflow/react-node-registry';
import { Card, ColorPicker, Space, Tooltip } from 'antd';
import { CheckCircleTwoTone } from '@ant-design/icons';

import '@logicflow/core/es/index.css';
import './index.less';

const NodeComponent: FC<ReactNodeProps> = ({ node }) => {
  const data = node.getData();
  if (!data.properties) data.properties = {};

  return (
    <div className="react-algo-node">
      <img src={require('@/public/didi.png')} alt="滴滴出行" />
      <span>{data.properties.name as string}</span>
    </div>
  );
};

const NextAntdNode: FC = () => {
  return (
    <Space direction="vertical" className="antd-node-wrapper">
      <CheckCircleTwoTone twoToneColor="#52c41a" style={{ fontSize: 40 }} />
      <ColorPicker defaultValue="#1677ff" size="large" showText />
      <Tooltip title="prompt text">
        <span>Show Tooltip</span>
      </Tooltip>
    </Space>
  );
};

export default class Example extends React.Component {
  private container!: HTMLDivElement;
  private count = 0;
  private timer?: ReturnType<typeof setTimeout>;

  componentDidMount() {
    const lf = new LogicFlow({
      container: this.container,
      grid: {
        size: 20,
      },
    });

    lf.render({});

    register(
      {
        type: 'custom-react-node',
        component: NodeComponent,
      },
      lf,
    );
    register(
      {
        type: 'custom-antd-node',
        component: NextAntdNode,
      },
      lf,
    );

    const node1 = lf.addNode({
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
    console.log('node1 --->>>', node1);

    const node2 = lf.addNode({
      id: 'react-node-2',
      type: 'custom-antd-node',
      x: 500,
      y: 80,
      properties: {
        width: 130,
        height: 130,
      },
    });
    console.log('node2 --->>>', node2);

    const update = () => {
      // lf.setProperties('react-node-1', { name: `逻辑回归 ${(this.count += 1)}` })
      node1.setProperty('name', `今日出行 ${(this.count += 1)}`);
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

  refContainer = (container: HTMLDivElement) => {
    this.container = container;
  };

  render() {
    return (
      <Card title="React 自定义节点">
        <div ref={this.refContainer} id="graph"></div>
      </Card>
    );
  }
}
