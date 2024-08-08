import LogicFlow from '@logicflow/core';
import { SelectionSelect } from '@logicflow/extension';

import { Card, Button, Flex, Form, Radio, Divider, Space } from 'antd';
import { useState, useEffect, useRef } from 'react';
import styles from './index.module.less';

import '@logicflow/core/es/index.css';
import '@logicflow/extension/es/index.css';

const config: Partial<LogicFlow.Options> = {
  isSilentMode: false,
  stopScrollGraph: false,
  stopZoomGraph: false,
  stopMoveGraph: true,
  style: {
    rect: {
      rx: 5,
      ry: 5,
      strokeWidth: 2,
    },
    circle: {
      fill: '#f5f5f5',
      stroke: '#666',
    },
    ellipse: {
      fill: '#dae8fc',
      stroke: '#6c8ebf',
    },
    polygon: {
      fill: '#d5e8d4',
      stroke: '#82b366',
    },
    diamond: {
      fill: '#ffe6cc',
      stroke: '#d79b00',
    },
    text: {
      color: '#b85450',
      fontSize: 12,
    },
  },
  allowRotate: true,
  allowResize: true,
};

const data = {
  nodes: [
    {
      id: '1',
      type: 'rect',
      x: 150,
      y: 100,
      text: '矩形',
    },
    {
      id: '2',
      type: 'circle',
      x: 350,
      y: 100,
      text: '圆形',
    },
    {
      id: '3',
      type: 'ellipse',
      x: 550,
      y: 100,
      text: '椭圆',
    },
    {
      id: '4',
      type: 'polygon',
      x: 150,
      y: 250,
      text: '多边形',
    },
    {
      id: '5',
      type: 'diamond',
      x: 350,
      y: 250,
      text: '菱形',
    },
    {
      id: '6',
      type: 'text',
      x: 550,
      y: 250,
      text: '纯文本节点',
    },
    {
      id: '7',
      type: 'html',
      x: 150,
      y: 400,
      text: 'html节点',
    },
  ],
  edges: [
    {
      id: 'e_1',
      type: 'polyline',
      sourceNodeId: '1',
      targetNodeId: '2',
    },
    {
      id: 'e_2',
      type: 'polyline',
      sourceNodeId: '2',
      targetNodeId: '3',
    },
    {
      id: 'e_3',
      type: 'polyline',
      sourceNodeId: '4',
      targetNodeId: '5',
    },
  ],
};

/**
 * 框选插件 SelectionSelect 示例
 */
export default function SelectionSelectExample() {
  const lfRef = useRef<LogicFlow>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSelectionSelectOpen, setIsSelectionSelectOpen] = useState(false);
  const [isWholeEdge, setIsWholeEdge] = useState(true);
  const [isWholeNode, setIsWholeNode] = useState(true);

  // 初始化 LogicFlow
  useEffect(() => {
    if (!lfRef.current) {
      const lf = new LogicFlow({
        ...config,
        container: containerRef.current!,
        grid: {
          size: 20,
        },
        plugins: [SelectionSelect],
      });

      lf.on(
        'selection:selected-area',
        ({ topLeft, bottomRight }: Record<string, LogicFlow.PointTuple>) => {
          console.log('get selection area:', topLeft, bottomRight);
        },
      );
      lf.render(data);
      lf.translateCenter();
      lfRef.current = lf;
    }
  }, []);

  useEffect(() => {
    if (lfRef.current) {
      const selectionSelect = lfRef.current.extension
        .selectionSelect as SelectionSelect;
      selectionSelect.setSelectionSense(isWholeEdge, isWholeNode);
    }
  }, [isWholeEdge, isWholeNode]);

  const handleOpenSelectionSelectOnce = () => {
    if (lfRef.current) {
      const lf = lfRef.current;
      const selectionSelect = lf.extension.selectionSelect as SelectionSelect;

      // 开启框选功能
      selectionSelect.openSelectionSelect();
      setIsSelectionSelectOpen(true);
      // 框选操作结束后关闭框选功能
      lf.once('selection:selected', () => {
        selectionSelect.closeSelectionSelect();
        setIsSelectionSelectOpen(false);
      });
    }
  };

  const handleOpenSelectionSelect = () => {
    if (lfRef.current) {
      const selectionSelect = lfRef.current.extension
        .selectionSelect as SelectionSelect;
      selectionSelect.openSelectionSelect();
      setIsSelectionSelectOpen(true);
    }
  };

  const handleCloseSelectionSelect = () => {
    if (lfRef.current) {
      const selectionSelect = lfRef.current.extension
        .selectionSelect as SelectionSelect;
      selectionSelect.closeSelectionSelect();
      setIsSelectionSelectOpen(false);
    }
  };

  return (
    <Card title="LogicFlow Extension - SelectionSelect">
      <Flex wrap="wrap" gap="middle" align="center" justify="space-between">
        <Space>
          <Button
            onClick={handleOpenSelectionSelectOnce}
            disabled={isSelectionSelectOpen}
          >
            单次框选
          </Button>
          <Button
            onClick={handleOpenSelectionSelect}
            disabled={isSelectionSelectOpen}
          >
            开启框选
          </Button>
          <Button
            onClick={handleCloseSelectionSelect}
            disabled={!isSelectionSelectOpen}
            danger
          >
            关闭框选
          </Button>
        </Space>
        <Form layout="inline">
          <Form.Item
            label="isWholeEdge"
            tooltip="是否要边的起点终点都在选区范围才算选中"
          >
            <Radio.Group
              value={isWholeEdge}
              onChange={(e) => setIsWholeEdge(e.target.value)}
            >
              <Radio.Button value={true}>true</Radio.Button>
              <Radio.Button value={false}>false</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            label="isWholeNode"
            tooltip="是否要节点的全部点都在选区范围才算选中"
          >
            <Radio.Group
              value={isWholeNode}
              onChange={(e) => setIsWholeNode(e.target.value)}
            >
              <Radio.Button value={true}>true</Radio.Button>
              <Radio.Button value={false}>false</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Flex>
      <Divider />
      <div ref={containerRef} id="graph" className={styles.viewport}></div>
    </Card>
  );
}
