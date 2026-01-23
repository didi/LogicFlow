import React from 'react';
import { Button, Space, message } from 'antd';
import LogicFlow from '@logicflow/core';

interface Props {
  lf: LogicFlow;
}

const StatusButtons: React.FC<Props> = ({ lf }) => {
  const getCurrentEdge = () => {
    const { edges } = lf.getSelectElements();
    return edges?.[0];
  };

  const onSetEdgeStatus = (status: 'todo' | 'done') => {
    const edge = getCurrentEdge();
    if (!edge) {
      message.warning('请先选择一条边');
      return;
    }

    // 改变边的properties
    lf.setProperties(edge.id, { status });
  };

  return (
    <Space>
      <Button danger onClick={() => onSetEdgeStatus('todo')}>
        未完成
      </Button>
      <Button type="primary" onClick={() => onSetEdgeStatus('done')}>
        已完成
      </Button>
    </Space>
  );
};

export default StatusButtons;
