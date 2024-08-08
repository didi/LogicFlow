import LogicFlow from '@logicflow/core';
import { Control, MiniMap } from '@logicflow/extension';

import { Button, Card, Flex, Divider, Select, Form, Space } from 'antd';
import { useState, useEffect, useRef } from 'react';
import styles from './index.module.less';

import '@logicflow/core/es/index.css';
import '@logicflow/extension/es/index.css';

const config: Partial<LogicFlow.Options> = {
  isSilentMode: false,
  stopScrollGraph: false,
  stopZoomGraph: false,
  style: {
    rect: {
      rx: 5,
      ry: 5,
      strokeWidth: 2,
    },
    text: {
      color: '#b85450',
      fontSize: 12,
    },
  },
};

const nodes: LogicFlow.NodeConfig[] = [];
const edges: LogicFlow.EdgeConfig[] = [];

for (let i = 0; i < 200; i++) {
  const nodeStartId = `${i * 2 + 1}`;
  const nodeEndId = `${i * 2 + 2}`;
  const nodeStart: LogicFlow.NodeConfig = {
    id: nodeStartId,
    type: 'rect',
    x: 400 * (i % 10) - 200,
    y: 100 * Math.floor(i / 10) - 500,
    text: `${i}-start`,
  };
  const nodeEnd: LogicFlow.NodeConfig = {
    id: nodeEndId,
    type: 'rect',
    x: 400 * (i % 10),
    y: 100 * Math.floor(i / 10) - 500,
    text: `${i}-end`,
  };
  const edge: LogicFlow.EdgeConfig = {
    id: `e_${i}`,
    type: 'polyline',
    sourceNodeId: nodeStartId,
    targetNodeId: nodeEndId,
  };
  nodes.push(nodeStart);
  nodes.push(nodeEnd);
  edges.push(edge);
}

const data: LogicFlow.GraphConfigData = {
  nodes,
  edges,
};

const miniMapOptions: MiniMap.MiniMapOption = {
  isShowHeader: false,
  isShowCloseIcon: true,
  headerTitle: 'MiniMap',
  width: 200,
  height: 120,
  // leftPosition: 100,
  // topPosition: 100,
};

export default function MiniMapExtension() {
  const lfRef = useRef<LogicFlow>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [showEdge, setShowEdge] = useState(false);
  const [position, setPosition] = useState('right-bottom');

  useEffect(() => {
    LogicFlow.use(MiniMap);
    if (!lfRef.current) {
      const lf = new LogicFlow({
        ...config,
        container: containerRef.current as HTMLElement,
        grid: {
          size: 20,
        },
        // plugins: [Control, MiniMap],
        plugins: [Control],
        pluginsOptions: {
          miniMap: {
            ...miniMapOptions,
            showEdge,
          },
        },
      });

      lf.on('miniMap:close', () => {
        setVisible(false);
      });

      lf.render(data);
      lfRef.current = lf;
    }
  }, []);

  const toggleVisible = () => {
    if (lfRef.current) {
      const miniMap = lfRef.current.extension.miniMap as MiniMap;
      if (visible) {
        miniMap.hide();
      } else {
        miniMap.show();
      }
      setVisible(!visible);
    }
  };

  const toggleShowEdge = () => {
    if (lfRef.current) {
      const miniMap = lfRef.current.extension.miniMap as MiniMap;
      miniMap.setShowEdge(!showEdge);
      setShowEdge(!showEdge);
    }
  };

  const handleReset = () => {
    if (lfRef.current) {
      (lfRef.current.extension.miniMap as MiniMap).reset();
    }
  };

  const updatePosition = (position: any) => {
    if (lfRef.current) {
      const miniMap = lfRef.current.extension.miniMap as MiniMap;
      miniMap.updatePosition(position);
      setPosition(position);
    }
  };

  const updatePositionWithObject1 = () => {
    (lfRef.current?.extension.miniMap as MiniMap).updatePosition({
      left: 100,
      top: 100,
    });
  };

  const updatePositionWithObject2 = () => {
    (lfRef.current?.extension.miniMap as MiniMap).updatePosition({
      right: 100,
      bottom: 100,
    });
  };

  return (
    <Card title="LogicFlow Extension - MiniMap">
      <Flex wrap="wrap" gap="middle" align="center" justify="space-between">
        <Space>
          <Button onClick={toggleVisible}>
            {visible ? '隐藏' : '显示'}小地图
          </Button>
          {visible && (
            <Button onClick={handleReset}>重置主画布（缩放&位移）</Button>
          )}
        </Space>
        {visible && (
          <Form layout="inline">
            <Form.Item label="小地图中显示连线">
              <Button onClick={toggleShowEdge}>
                {showEdge ? '隐藏' : '显示'}
              </Button>
            </Form.Item>
            <Form.Item label="小地图位置">
              <Select
                value={position}
                onChange={updatePosition}
                style={{ width: 80 }}
              >
                <Select.Option value="left-top">左上</Select.Option>
                <Select.Option value="left-bottom">左下</Select.Option>
                <Select.Option value="right-top">右上</Select.Option>
                <Select.Option value="right-bottom">右下</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item tooltip="left: 100; top: 100" label="小地图位置1">
              <Button onClick={updatePositionWithObject1}>设置</Button>
            </Form.Item>
            <Form.Item tooltip="right: 100; bottom: 100" label="小地图位置2">
              <Button onClick={updatePositionWithObject2}>设置</Button>
            </Form.Item>
          </Form>
        )}
      </Flex>
      <Divider />
      <div ref={containerRef} id="graph" className={styles.viewport}></div>
    </Card>
  );
}
