import React from 'react';
import { Card } from 'antd';
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import { nodeType } from '../config';

export default function hoverPanel(hoverStyle: React.CSSProperties | undefined, nodeData: any) {
 
  const getList = (data: any) => {
    if (!data) {
      return
    }
    const properties = nodeData.properties;
    // @ts-ignore
    return <Card title={nodeType[nodeData.type]} style={{ width: 300 }}>
      <p>{properties.usernameZh}{properties.username ? <span>({properties.username})</span> : ''}</p>
      <p>{properties.time}</p>
      {properties.result ? <p>
        {properties.result === '通过' ? <CheckCircleFilled style={{color: 'green'}} /> : <CloseCircleFilled style={{color: 'red'}}/>}
        <span style={{marginLeft: '10px'}}>{properties.result}</span>
      </p> : ''}
      {properties.desc ? <p>说明: {properties.desc}</p> : ''}
    </Card>
  }

  return <div className="hover-panel" style={{ ...hoverStyle }}>
    {getList(nodeData)}
  </div>
}