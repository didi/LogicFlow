import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import LogicFlow from '@logicflow/core';
import PropertyPanel from './components/property';
import NodePanel from './components/NodePanel';
import RegisteNode from './components/registernNode';
import { themeApprove, data } from './config';
import './index.css';

const config = {
  stopScrollGraph: true,
  stopZoomGraph: true,
  grid: {
    size: 10,
    visible: true,
    type: 'mesh',
    config: {
      color: '#DCDCDC',  // 设置网格的颜色
    }
  },
  keyboard: { enabled: true },
  style: themeApprove,
}

export default function ApproveExample() {
  const [lf, setLf] = useState({} as LogicFlow);
  const [nodeData, setNodeData] = useState();

  useEffect(() => {
    const lf = new LogicFlow({
      ...config,
      container: document.querySelector('#graph') as HTMLElement
    });
    setLf(lf);
    RegisteNode(lf);
    lf.render(data);
    initEvent(lf);
  }, []);
  const initEvent = (lf: LogicFlow) => { 
    lf.on('element:click', ({ data }) => {
      setNodeData(data);
      console.log(JSON.stringify(lf.getGraphData()));
    });
    lf.on('connection:not-allowed', (data: any) => {
      message.error(data.msg);
    });
  }
  // 更新属性
  const updateProperty = (id: string, data: any) => {
    const node = lf.graphModel.nodesMap[id];
    const edge = lf.graphModel.edgesMap[id];
    if (node) {
      node.model.setProperties(Object.assign(node.model.properties, data));
    } else if (edge) {
      edge.model.setProperties(Object.assign(edge.model.properties, data));
    }
  }
  // 隐藏属性面板
  const hidePropertyPanel = () => { 
    setNodeData(undefined);
  }
  return (
    <div className="approve-example-container">
      <div className="node-panel">
        { NodePanel(lf) }
      </div>
      <div id="graph" className="viewport" />
      { nodeData ? <div className="property-panel">
        {PropertyPanel(nodeData, updateProperty, hidePropertyPanel)}
      </div> : ''} 
    </div>
  )
}
