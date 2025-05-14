import LogicFlow from '@logicflow/core';

import {
  Card,
  Form,
  Divider,
  Row,
  Col,
  ColorPicker,
  Collapse,
  Radio,
  InputNumber,
  Button,
  message,
} from 'antd';
import { useEffect, useRef, useState } from 'react';
// import styles from './index.less'

import '@logicflow/core/es/index.css';
import '@logicflow/extension/es/index.css';

const formList = [
  { key: 'baseNode', label: '节点样式' },
  { key: 'baseEdge', label: '边样式' },
  { key: 'rect', label: '矩形节点样式' },
  { key: 'circle', label: '圆形样式' },
  { key: 'diamond', label: '菱形样式' },
  { key: 'ellipse', label: '椭圆样式' },
  { key: 'polygon', label: '多边形样式' },
  { key: 'line', label: '直线样式' },
  { key: 'polyline', label: '折线样式' },
  { key: 'bezier', label: '贝塞尔曲线样式' },
  { key: 'anchorLine', label: '从锚点拉出的边的样式' },
  { key: 'text', label: '文本节点样式' },
  { key: 'nodeText', label: '节点文本样式' },
  { key: 'edgeText', label: '边文本样式' },
  { key: 'inputText', label: '输入框样式' },
  { key: 'anchor', label: '锚点样式' },
  { key: 'arrow', label: '边上箭头的样式' },
  { key: 'snapline', label: '对齐线样式' },
  { key: 'rotateControl', label: '节点旋转控制点样式' },
  { key: 'resizeControl', label: '节点旋转控制点样式' },
  { key: 'resizeOutline', label: '节点调整大小时的外框样式' },
];

const config: Partial<LogicFlow.Options> = {
  isSilentMode: false,
  stopScrollGraph: true,
  stopZoomGraph: true,
};

const data = {
  nodes: [
    {
      id: '1',
      type: 'rect',
      x: 150,
      y: 100,
      text: '矩形',
      properties: {
        radius: 8,
      },
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

type FormValues = {
  [key: string]: object;
};

const initialFormValues: FormValues = formList.reduce((acc, item) => {
  acc[item.key] = {};
  return acc;
}, {} as FormValues);

export default function ThemeExample() {
  const lfRef = useRef<LogicFlow>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [form] = Form.useForm();
  const [themeModeList, setThemeModeList] = useState([
    { label: '默认主题', value: 'default' },
    { label: '圆角主题', value: 'radius' },
    { label: '彩色主题', value: 'colorful' },
    { label: '暗黑主题', value: 'dark' },
  ]);
  const [themeMode, setThemeMode] = useState('default');
  const [formValues, setFormValues] = useState(initialFormValues);

  useEffect(() => {
    lfRef.current?.setTheme(formValues, themeMode as any);
  }, [formValues]);
  useEffect(() => {
    lfRef.current?.setTheme({}, themeMode as any);
  }, [themeMode]);
  // 初始化 LogicFlow
  useEffect(() => {
    if (!lfRef.current) {
      const lf = new LogicFlow({
        ...config,
        container: containerRef.current as HTMLElement,
        height: 600,
        multipleSelectKey: 'shift',
        disabledTools: ['multipleSelect'],
        autoExpand: true,
        adjustEdgeStartAndEnd: true,
        allowRotate: true,
        edgeTextEdit: true,
        keyboard: {
          enabled: true,
        },
        // themeMode: 'radius',
        partial: true,
        background: {
          color: '#FFFFFF',
        },
        themeMode: 'radius',
        grid: true,
        edgeTextDraggable: true,
        edgeType: 'bezier',
        idGenerator(type) {
          return type + '_' + Math.random();
        },
        edgeGenerator: (sourceNode) => {
          // 限制'rect', 'diamond', 'polygon'节点的连线为贝塞尔曲线
          if (['rect', 'diamond', 'polygon'].includes(sourceNode.type))
            return 'bezier';
          return 'polyline';
        },
      });
      lf.render(data);
      lf.translateCenter();
      lfRef.current = lf;
    }
  }, []);
  const handleFormChange = (key: any, changedValues: any, allValues: any) => {
    // 处理颜色值，转换为十六进制
    const processedValues = { ...allValues };

    // 检查是否有颜色值需要转换
    Object.keys(changedValues).forEach((key) => {
      // 处理常见的颜色属性字段
      if (key === 'fill' || key === 'stroke' || key === 'color') {
        if (changedValues[key] && changedValues[key].toHexString) {
          processedValues[key] = changedValues[key].toHexString();
        }
      }
    });
    setFormValues({
      ...formValues,
      [key]: processedValues,
    });
  };

  const renderCard = (key) => (
    <div>
      <Form
        layout="vertical"
        size="small"
        initialValues={formValues[key]}
        fields={Object.entries(formValues[key] || {}).map(([name, value]) => ({
          name,
          value,
        }))}
        onValuesChange={(changedValues, allValues) =>
          handleFormChange(key, changedValues, allValues)
        }
      >
        <Form.Item label="背景颜色" name="fill">
          <ColorPicker size="small" showText />
        </Form.Item>
        <Form.Item label="边框宽度" name="strokeWidth">
          <InputNumber size="small" />
        </Form.Item>
        <Form.Item label="边框颜色" name="stroke">
          <ColorPicker size="small" showText />
        </Form.Item>
      </Form>
    </div>
  );

  const customPanel = () => (
    <div style={{ height: '400px', overflow: 'auto' }}>
      {formList.map((item) => (
        <Collapse key={item.key} defaultActiveKey={[]} ghost>
          <Collapse.Panel header={item.label} key="1">
            {renderCard(item.key)}
          </Collapse.Panel>
        </Collapse>
      ))}
    </div>
  );

  const handleThemeModeChange = (e: any) => {
    const theme = e.target.value;
    // 更新状态
    setThemeMode(theme);
    const curTheme = lfRef.current?.getTheme();
    // 重置表单值
    form.setFieldsValue(curTheme);
  };
  const exportTheme = () => {
    const theme = lfRef.current?.getTheme();
    const themeString = JSON.stringify(theme, null, 2);
    const blob = new Blob([themeString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'theme.json';
    a.click();
    URL.revokeObjectURL(url);
    message.success('主题导出成功');
  };
  const importTheme = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          try {
            const theme = JSON.parse(content);
            const time = new Date();
            const themeName = `customTheme-${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`;
            lfRef.current?.addThemeMode(themeName, theme);
            lfRef.current?.setTheme({}, themeName);
            setThemeModeList([
              ...themeModeList,
              {
                label: `自定义主题${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`,
                value: themeName,
              },
            ]);
            setThemeMode(themeName);
            form.setFieldsValue(theme);
            setFormValues(theme);
            message.success('主题导入成功');
            console.log('theme', formValues);
          } catch (error) {
            message.error(`主题导入失败：${error}`);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };
  const handleCopyTheme = () => {
    const theme = lfRef.current?.getTheme();
    const themeString = JSON.stringify(theme, null, 2);
    navigator.clipboard.writeText(themeString).then(
      () => {
        message.success('主题配置复制成功');
      },
      (err) => {
        message.error(`主题配置复制失败，错误信息: ${err}`);
      },
    );
  };

  return (
    <Card title="LogicFlow - Theme">
      <Row>
        <Col span={6}>
          <h3>主题设置</h3>
          <Radio.Group
            value={themeMode}
            name="themeMode"
            defaultValue="default"
            buttonStyle="solid"
            onChange={handleThemeModeChange}
          >
            {themeModeList.map((item) => (
              <Radio key={item.value} value={item.value}>
                {item.label}
              </Radio>
            ))}
          </Radio.Group>
          <Divider />
          <h3>样式定制</h3>
          <Button
            type="text"
            onClick={() => {
              form.setFieldsValue(initialFormValues);
              setFormValues(initialFormValues);
            }}
          >
            重置
          </Button>
          <Button type="link" onClick={() => importTheme()}>
            导入
          </Button>
          <Button type="link" onClick={() => handleCopyTheme()}>
            复制
          </Button>
          <Button type="link" onClick={() => exportTheme()}>
            导出
          </Button>
          <Divider />
          {customPanel()}
        </Col>
        <Col span={18}>
          <h3>效果预览</h3>
          <div ref={containerRef} id="graph"></div>
        </Col>
      </Row>
    </Card>
  );
}
