import LogicFlow from '@logicflow/core';
import { DndPanel } from '@logicflow/extension';
import { Dagre } from '@logicflow/layout';
import {
  Card,
  Flex,
  Form,
  Divider,
  Button,
  Select,
  Switch,
  InputNumber,
  Space,
  message,
} from 'antd';
import { useEffect, useRef, useState } from 'react';
import styles from './index.module.less';

import '@logicflow/core/es/index.css';
import '@logicflow/extension/es/index.css';

// 布局方向选项
const rankdirOptions = [
  { value: 'LR', label: '从左到右(LR)' },
  { value: 'TB', label: '从上到下(TB)' },
  { value: 'BT', label: '从下到上(BT)' },
  { value: 'RL', label: '从右到左(RL)' },
];

// 节点对齐选项
const alignOptions = [
  { value: '', label: '居中对齐(默认)' },
  { value: 'UL', label: '上左对齐(UL)' },
  { value: 'UR', label: '上右对齐(UR)' },
  { value: 'DL', label: '下左对齐(DL)' },
  { value: 'DR', label: '下右对齐(DR)' },
];

// 排序算法选项
const rankerOptions = [
  { value: 'tight-tree', label: '紧凑树(tight-tree)' },
  { value: 'network-simplex', label: '网络单纯形(network-simplex)' },
  { value: 'longest-path', label: '最长路径(longest-path)' },
];

const config: Partial<LogicFlow.Options> = {
  isSilentMode: false,
  stopScrollGraph: false,
  stopZoomGraph: false,
  stopMoveGraph: false,
  textEdit: false,
  nodeTextEdit: false,
  edgeTextEdit: false,
  keyboard: {
    enabled: true,
  },
  grid: {
    size: 20,
  },
};

// 示例图数据
const data = {
  nodes: [
    {
      id: 'start',
      type: 'circle',
      text: '开始',
      x: 200,
      y: 130,
    },
    {
      id: 'decision',
      type: 'diamond',
      text: '条件',
      x: 500,
      y: 120,
    },
    {
      id: 'task1',
      type: 'rect',
      text: '任务',
      x: 800,
      y: 70,
    },
    {
      id: 'task2',
      type: 'rect',
      text: '任务',
      x: 770,
      y: 255,
    },
    {
      id: 'task3',
      type: 'rect',
      text: '任务',
      x: 1070,
      y: 70,
    },
    {
      id: 'task4',
      type: 'rect',
      text: '任务',
      x: 1200,
      y: 200,
    },
    {
      id: 'end1',
      type: 'circle',
      text: '结束',
      x: 1530,
      y: 270,
    },
    {
      id: 'end2',
      type: 'circle',
      text: '结束',
      x: 870,
      y: 395,
    },
  ],
  edges: [
    {
      id: 'edge1',
      type: 'polyline',
      sourceNodeId: 'start',
      targetNodeId: 'decision',
      properties: {},
    },
    {
      id: 'edge2',
      type: 'polyline',
      sourceNodeId: 'decision',
      targetNodeId: 'task1',
      properties: {
        text: '条件1',
      },
    },
    {
      id: 'edge3',
      type: 'polyline',
      sourceNodeId: 'decision',
      targetNodeId: 'task2',
      properties: {
        text: '条件2',
      },
    },
    {
      id: 'edge4',
      type: 'polyline',
      sourceNodeId: 'task1',
      targetNodeId: 'task3',
      properties: {},
    },
    {
      id: 'edge5',
      type: 'polyline',
      sourceNodeId: 'task3',
      targetNodeId: 'task4',
      properties: {},
    },
    {
      id: 'edge6',
      type: 'polyline',
      sourceNodeId: 'task4',
      targetNodeId: 'end1',
      properties: {},
    },
    {
      id: 'edge7',
      type: 'polyline',
      sourceNodeId: 'task2',
      targetNodeId: 'end2',
      properties: {},
    },
  ],
};

/**
 * 自动布局插件 Layout 示例
 */
export default function LayoutExample() {
  const lfRef = useRef<LogicFlow>();
  const containerRef = useRef<HTMLDivElement>(null);

  // 布局配置状态
  const [layoutConfig, setLayoutConfig] = useState({
    rankdir: 'LR',
    align: '',
    ranker: 'tight-tree',
    nodesep: 50,
    ranksep: 80,
    isDefaultAnchor: true,
  });

  // 初始化 LogicFlow
  useEffect(() => {
    if (!lfRef.current && containerRef.current) {
      const lf = new LogicFlow({
        ...config,
        container: containerRef.current,
        plugins: [DndPanel, Dagre],
      });

      lf.setTheme({
        rect: {
          radius: 5,
          stroke: '#1890ff',
        },
        circle: {
          r: 35,
          stroke: '#1890ff',
        },
        diamond: {
          rx: 5,
          ry: 5,
          stroke: '#1890ff',
        },
        polyline: {
          stroke: '#1890ff',
          strokeWidth: 2,
          hoverStroke: '#ff4d4f',
        },
      });

      // 设置工具面板
      lf.setPatternItems([
        {
          type: 'circle',
          text: '开始',
          label: '开始节点',
          icon: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/core/start.png',
        },
        {
          type: 'diamond',
          text: '条件',
          label: '条件节点',
          icon: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/core/diamond.png',
        },
        {
          type: 'rect',
          text: '任务',
          label: '任务节点',
          icon: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/core/rect.png',
        },
        {
          type: 'circle',
          text: '结束',
          label: '结束节点',
          icon: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/core/end.png',
        },
      ]);

      lf.render(data);
      lf.translateCenter(); // 居中显示

      lfRef.current = lf;
    }
  }, []);

  // 执行布局
  const applyLayout = () => {
    if (lfRef.current?.extension.dagre) {
      const { rankdir, align, ranker, nodesep, ranksep, isDefaultAnchor } =
        layoutConfig;

      try {
        (lfRef.current.extension.dagre as Dagre)?.layout({
          rankdir: rankdir as any,
          align: align || undefined,
          ranker: ranker as any,
          nodesep,
          ranksep,
          isDefaultAnchor,
        });

        // 适配视图
        lfRef.current.fitView();
        message.success('布局应用成功');
      } catch (error) {
        message.error(`布局应用失败: ${error}`);
      }
    }
  };

  // 重置为初始数据
  const resetGraph = () => {
    if (lfRef.current) {
      lfRef.current.render(data);
      lfRef.current.translateCenter();
      message.success('已重置图表');
    }
  };

  // 处理配置项变更
  const handleConfigChange = (key: string, value: any) => {
    setLayoutConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <Card title="布局示例">
      <Flex wrap gap="middle">
        <Form layout="vertical" style={{ width: '100%' }}>
          <Flex wrap gap="small">
            <Form.Item label="布局方向" style={{ minWidth: 200 }}>
              <Select
                options={rankdirOptions}
                value={layoutConfig.rankdir}
                onChange={(value) => handleConfigChange('rankdir', value)}
              />
            </Form.Item>

            <Form.Item label="对齐方式" style={{ minWidth: 200 }}>
              <Select
                options={alignOptions}
                value={layoutConfig.align}
                onChange={(value) => handleConfigChange('align', value)}
              />
            </Form.Item>

            <Form.Item label="排名算法" style={{ minWidth: 200 }}>
              <Select
                options={rankerOptions}
                value={layoutConfig.ranker}
                onChange={(value) => handleConfigChange('ranker', value)}
              />
            </Form.Item>

            <Form.Item label="节点间距" style={{ minWidth: 150 }}>
              <InputNumber
                min={10}
                max={500}
                value={layoutConfig.nodesep}
                onChange={(value) => handleConfigChange('nodesep', value)}
              />
            </Form.Item>

            <Form.Item label="层级间距" style={{ minWidth: 150 }}>
              <InputNumber
                min={10}
                max={500}
                value={layoutConfig.ranksep}
                onChange={(value) => handleConfigChange('ranksep', value)}
              />
            </Form.Item>

            <Form.Item label="自动调整连线锚点" style={{ minWidth: 200 }}>
              <Switch
                checked={layoutConfig.isDefaultAnchor}
                onChange={(value) =>
                  handleConfigChange('isDefaultAnchor', value)
                }
              />
            </Form.Item>
          </Flex>

          <Form.Item>
            <Space>
              <Button type="primary" onClick={applyLayout}>
                应用布局
              </Button>
              <Button onClick={resetGraph}>重置图表</Button>
            </Space>
          </Form.Item>
        </Form>
      </Flex>

      <Divider />

      <div ref={containerRef} className={styles.graph}></div>
    </Card>
  );
}
