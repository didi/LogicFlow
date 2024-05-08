import React from 'react';
import LogicFlow from '@logicflow/core';
import '@logicflow/core/es/index.css';
import sqlNode from './sqlNode';
import sqlEdge from './sqlEdge';

import data from './sqlData';
import './index.less';

const SilentConfig = {
  stopScrollGraph: true,
  stopMoveGraph: true,
  stopZoomGraph: true,
};

export default class Example extends React.Component {
  private container!: HTMLDivElement;

  componentDidMount() {
    const lf = new LogicFlow({
      container: this.container,
      grid: true,
      ...SilentConfig,
    });

    lf.register(sqlNode);
    lf.register(sqlEdge);

    lf.setDefaultEdgeType('sql-edge');
    lf.setTheme({
      bezier: {
        stroke: '#afafaf',
        strokeWidth: 1,
      },
    });

    lf.render(data);
    lf.translateCenter();

    // 1.1.28新增，可以自定义锚点显示时机了
    lf.on('anchor:dragstart', ({ data, nodeModel }: any) => {
      console.log('dragstart', data);
      if (nodeModel.type === 'sql-node') {
        lf.graphModel.nodes.forEach((node) => {
          // @ts-ignore
          if (node.type === 'sql-node' && nodeModel.id !== node.id) {
            node.isShowAnchor = true;
            node.setProperties({
              isConnection: true,
            });
          }
        });
      }
    });
    lf.on('anchor:dragend', ({ data, nodeModel }: any) => {
      console.log('dragend', data);
      if (nodeModel.type === 'sql-node') {
        lf.graphModel.nodes.forEach((node) => {
          // @ts-ignore
          if (node.type === 'sql-node' && nodeModel.id !== node.id) {
            node.isShowAnchor = false;
            lf.deleteProperty(node.id, 'isConnection');
          }
        });
      }
    });

    // @ts-ignore
    document.querySelector('#js_add-field').addEventListener('click', () => {
      const nodeModel = lf.getNodeModelById('node_id_1');
      if (typeof nodeModel?.addField === 'function') {
        nodeModel.addField({
          key: Math.random().toString(36).substring(2, 7),
          type: ['integer', 'long', 'string', 'boolean'][
            Math.floor(Math.random() * 4)
          ],
        });
      }
    });
  }

  refContainer = (container: HTMLDivElement) => {
    this.container = container;
  };

  render() {
    return (
      <div className="helloworld-app sql">
        <button id="js_add-field">Users添加字段</button>
        <div className="app-content" ref={this.refContainer} />
      </div>
    );
  }
}
