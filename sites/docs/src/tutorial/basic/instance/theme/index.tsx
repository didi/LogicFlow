import LogicFlow from '@logicflow/core';
import {
  Button,
  ColorPicker,
  Form,
  InputNumber,
  Select,
  Tabs,
  Input,
  message,
} from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import '@logicflow/core/es/index.css';
import '@logicflow/extension/es/index.css';

// 类型定义
interface FieldConfig {
  type: 'color' | 'number' | 'select' | 'text';
  label: string;
  options?: Array<{ label: string; value: string | number | boolean }>;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}

interface ThemeConfig {
  label: string;
  category: 'basic' | 'node' | 'edge' | 'text' | 'other' | 'canvas';
  fields: string[];
  nestedFields?: Record<string, string[]>;
}

type FormValues = Record<string, any>;

// 主题配置项定义
const themeFieldConfigs: Record<string, ThemeConfig> = {
  // 基础主题
  baseNode: {
    label: '基础节点',
    category: 'basic',
    fields: ['fill', 'stroke', 'strokeWidth', 'radius'],
  },
  baseEdge: {
    label: '基础边',
    category: 'basic',
    fields: [
      'stroke',
      'strokeWidth',
      'strokeDasharray',
      'startArrowType',
      'endArrowType',
    ],
  },

  // 画布配置
  background: {
    label: '画布背景',
    category: 'canvas',
    fields: [
      'background',
      'backgroundImage',
      'backgroundRepeat',
      'backgroundPosition',
      'backgroundSize',
      'backgroundOpacity',
      'filter',
    ],
  },
  grid: {
    label: '网格配置',
    category: 'canvas',
    fields: ['size', 'visible', 'type'],
    nestedFields: {
      config: ['color', 'thickness'],
    },
  },

  // 节点主题
  rect: {
    label: '矩形节点',
    category: 'node',
    fields: ['fill', 'stroke', 'strokeWidth', 'radius'],
  },
  circle: {
    label: '圆形节点',
    category: 'node',
    fields: ['fill', 'stroke', 'strokeWidth'],
  },
  diamond: {
    label: '菱形节点',
    category: 'node',
    fields: ['fill', 'stroke', 'strokeWidth', 'radius'],
  },
  ellipse: {
    label: '椭圆节点',
    category: 'node',
    fields: ['fill', 'stroke', 'strokeWidth'],
  },
  polygon: {
    label: '多边形节点',
    category: 'node',
    fields: ['fill', 'stroke', 'strokeWidth', 'radius'],
  },

  // 边主题
  line: {
    label: '直线',
    category: 'edge',
    fields: [
      'stroke',
      'strokeWidth',
      'strokeDasharray',
      'startArrowType',
      'endArrowType',
    ],
  },
  polyline: {
    label: '折线',
    category: 'edge',
    fields: [
      'stroke',
      'strokeWidth',
      'strokeDasharray',
      'startArrowType',
      'endArrowType',
    ],
  },
  bezier: {
    label: '贝塞尔曲线',
    category: 'edge',
    fields: [
      'stroke',
      'strokeWidth',
      'strokeDasharray',
      'startArrowType',
      'endArrowType',
    ],
    nestedFields: {
      adjustLine: ['stroke', 'strokeWidth'],
      adjustAnchor: ['r', 'fill', 'stroke', 'strokeWidth'],
    },
  },
  anchorLine: {
    label: '锚点连线',
    category: 'edge',
    fields: ['stroke', 'strokeWidth', 'strokeDasharray'],
  },

  // 文本主题
  text: {
    label: '文本节点',
    category: 'text',
    fields: ['color', 'fontSize', 'fontFamily', 'fontWeight'],
    nestedFields: {
      background: ['fill', 'stroke', 'strokeWidth', 'radius'],
    },
  },
  nodeText: {
    label: '节点文本',
    category: 'text',
    fields: [
      'color',
      'fontSize',
      'fontFamily',
      'fontWeight',
      'textWidth',
      'overflowMode',
      'lineHeight',
      'textAnchor',
    ],
    nestedFields: {
      background: ['fill', 'stroke', 'strokeWidth', 'radius'],
      wrapPadding: ['top', 'right', 'bottom', 'left'],
    },
  },
  edgeText: {
    label: '边文本',
    category: 'text',
    fields: [
      'color',
      'fontSize',
      'fontFamily',
      'fontWeight',
      'textWidth',
      'overflowMode',
    ],
    nestedFields: {
      background: ['fill', 'stroke', 'strokeWidth', 'radius', 'wrapPadding'],
    },
  },

  // 其他元素主题
  anchor: {
    label: '锚点',
    category: 'other',
    fields: ['r', 'fill', 'stroke', 'strokeWidth'],
    nestedFields: {
      hover: ['r', 'fill', 'stroke', 'strokeWidth', 'fillOpacity'],
    },
  },
  arrow: {
    label: '箭头',
    category: 'other',
    fields: [
      'offset',
      'verticalLength',
      'refX',
      'refY',
      'fill',
      'stroke',
      'strokeWidth',
      'strokeLinecap',
      'strokeLinejoin',
      'startArrowType',
      'endArrowType',
    ],
  },
  snapline: {
    label: '对齐线',
    category: 'other',
    fields: ['stroke', 'strokeWidth', 'strokeDasharray'],
  },
  outline: {
    label: '选中外框',
    category: 'other',
    fields: ['fill', 'stroke', 'strokeWidth', 'strokeDasharray', 'radius'],
    nestedFields: {
      hover: ['stroke', 'strokeWidth'],
    },
  },
};

// 字段类型配置
const fieldTypeConfigs: Record<string, FieldConfig> = {
  // 颜色类型
  fill: { type: 'color', label: '填充颜色' },
  stroke: { type: 'color', label: '边框颜色' },
  color: { type: 'color', label: '文字颜色' },
  background: { type: 'color', label: '背景颜色' },

  // 数字类型
  strokeWidth: { type: 'number', label: '边框宽度', min: 0, step: 1 },
  radius: { type: 'number', label: '圆角半径', min: 0, step: 1 },
  r: { type: 'number', label: '半径', min: 0, step: 1 },
  fontSize: { type: 'number', label: '字体大小', min: 8, step: 1 },
  textWidth: { type: 'number', label: '文本宽度', min: 50, step: 10 },
  lineHeight: { type: 'number', label: '行高', min: 1, step: 0.1 },
  offset: { type: 'number', label: '箭头偏移', min: 0, step: 1 },
  verticalLength: { type: 'number', label: '箭头垂直长度', min: 0, step: 1 },
  refX: { type: 'number', label: '参考X', step: 1 },
  refY: { type: 'number', label: '参考Y', step: 1 },
  fillOpacity: {
    type: 'number',
    label: '填充透明度',
    min: 0,
    max: 1,
    step: 0.1,
  },
  backgroundOpacity: {
    type: 'number',
    label: '背景透明度',
    min: 0,
    max: 1,
    step: 0.1,
  },
  size: { type: 'number', label: '网格大小', min: 1, step: 1 },
  thickness: { type: 'number', label: '网格线宽度', min: 1, step: 1 },

  // 布尔类型 - 使用select来渲染
  visible: {
    type: 'select',
    label: '是否可见',
    options: [
      { label: '显示', value: true },
      { label: '隐藏', value: false },
    ],
  },

  // 选择类型
  type: {
    type: 'select',
    label: '网格类型',
    options: [
      { label: '点状网格', value: 'dot' },
      { label: '交叉线网格', value: 'mesh' },
    ],
  },
  overflowMode: {
    type: 'select',
    label: '溢出模式',
    options: [
      { label: '默认', value: 'default' },
      { label: '自动换行', value: 'autoWrap' },
      { label: '省略号', value: 'ellipsis' },
    ],
  },
  textAnchor: {
    type: 'select',
    label: '文本对齐',
    options: [
      { label: '左对齐', value: 'start' },
      { label: '居中', value: 'middle' },
      { label: '右对齐', value: 'end' },
    ],
  },
  startArrowType: {
    type: 'select',
    label: '起始箭头',
    options: [
      { label: '无', value: 'none' },
      { label: '实心', value: 'solid' },
      { label: '空心', value: 'hollow' },
      { label: '菱形', value: 'diamond' },
      { label: '圆形', value: 'circle' },
    ],
  },
  endArrowType: {
    type: 'select',
    label: '结束箭头',
    options: [
      { label: '无', value: 'none' },
      { label: '实心', value: 'solid' },
      { label: '空心', value: 'hollow' },
      { label: '菱形', value: 'diamond' },
      { label: '圆形', value: 'circle' },
    ],
  },
  fontFamily: {
    type: 'select',
    label: '字体',
    options: [
      { label: '默认', value: 'inherit' },
      { label: '微软雅黑', value: 'Microsoft YaHei' },
      { label: '宋体', value: 'SimSun' },
      { label: 'Arial', value: 'Arial' },
      { label: 'Times New Roman', value: 'Times New Roman' },
    ],
  },
  fontWeight: {
    type: 'select',
    label: '字重',
    options: [
      { label: '正常', value: 'normal' },
      { label: '粗体', value: 'bold' },
      { label: '细体', value: 'lighter' },
    ],
  },

  // 字符串类型
  strokeDasharray: { type: 'text', label: '虚线样式', placeholder: '如: 5,5' },
  backgroundImage: {
    type: 'text',
    label: '背景图片',
    placeholder: "输入链接，格式：url('图片链接')",
  },
  backgroundSize: {
    type: 'text',
    label: '背景尺寸',
    placeholder: '如: cover, contain, 100px 50px',
  },
  filter: { type: 'text', label: '滤镜', placeholder: '如: blur(2px)' },
};

// 渲染表单项的组件
const renderFormField = (fieldName: string, fieldConfig: FieldConfig) => {
  const { type, label, options, min, max, step, placeholder } = fieldConfig;

  switch (type) {
    case 'color':
      return (
        <Form.Item key={fieldName} label={label} name={fieldName}>
          <ColorPicker
            size="small"
            showText
            format="hex"
            onChange={(color) => color.toHexString()}
          />
        </Form.Item>
      );
    case 'number':
      return (
        <Form.Item key={fieldName} label={label} name={fieldName}>
          <InputNumber size="small" min={min} max={max} step={step} />
        </Form.Item>
      );
    case 'select':
      return (
        <Form.Item key={fieldName} label={label} name={fieldName}>
          <Select size="small" options={options} />
        </Form.Item>
      );
    case 'text':
      return (
        <Form.Item key={fieldName} label={label} name={fieldName}>
          <Input placeholder={placeholder} />
        </Form.Item>
      );
    default:
      return null;
  }
};

// 独立的表单组件
const ThemeFormComponent: React.FC<{
  themeKey: string;
  themeConfig: ThemeConfig;
  initialValues: any;
  onFormChange: (themeKey: string, changedValues: any, allValues: any) => void;
}> = ({ themeKey, themeConfig, initialValues, onFormChange }) => {
  const [form] = Form.useForm();
  const { fields = [], nestedFields = {} } = themeConfig;

  useEffect(() => {
    form.setFieldsValue(initialValues);
  }, [form, initialValues]);

  return (
    <Form
      form={form}
      layout="vertical"
      size="small"
      initialValues={initialValues}
      onValuesChange={(changedValues, allValues) =>
        onFormChange(themeKey, changedValues, allValues)
      }
    >
      {/* 渲染基础字段 */}
      {fields.map((fieldName) => {
        const fieldConfig = fieldTypeConfigs[fieldName];
        return fieldConfig ? renderFormField(fieldName, fieldConfig) : null;
      })}

      {/* 渲染嵌套字段 */}
      {Object.entries(nestedFields).map(([nestedKey, nestedFieldNames]) => (
        <div
          key={nestedKey}
          style={{
            marginTop: 16,
            padding: 12,
            background: '#f9f9f9',
            borderRadius: 6,
          }}
        >
          <h4
            style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 'bold' }}
          >
            {nestedKey === 'background'
              ? '背景样式'
              : nestedKey === 'hover'
                ? '悬停样式'
                : nestedKey === 'adjustLine'
                  ? '调整线样式'
                  : nestedKey === 'adjustAnchor'
                    ? '调整锚点样式'
                    : nestedKey === 'wrapPadding'
                      ? '内边距'
                      : nestedKey === 'config'
                        ? '网格样式'
                        : nestedKey}
          </h4>
          {(nestedFieldNames as string[]).map((fieldName) => {
            const fieldConfig = fieldTypeConfigs[fieldName];
            return fieldConfig
              ? renderFormField(`${nestedKey}.${fieldName}`, fieldConfig)
              : null;
          })}
        </div>
      ))}
    </Form>
  );
};

// 渲染主题表单
const renderThemeForm = (
  themeKey: string,
  themeConfig: ThemeConfig,
  formValues: FormValues,
  handleFormChange: (
    themeKey: string,
    changedValues: any,
    allValues: any,
  ) => void,
) => {
  const currentFormValues = formValues[themeKey] || {};

  return (
    <ThemeFormComponent
      themeKey={themeKey}
      themeConfig={themeConfig}
      initialValues={currentFormValues}
      onFormChange={handleFormChange}
    />
  );
};

const initialFormValues: FormValues = Object.keys(themeFieldConfigs).reduce(
  (acc, key) => {
    acc[key] = {};
    return acc;
  },
  {} as FormValues,
);

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

const config = {
  container: {
    id: 'LF-theme',
  },
  width: 700,
  height: 600,
  background: {
    backgroundImage:
      'url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZTBlMGUwIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=)',
    backgroundRepeat: 'repeat' as const,
    backgroundSize: '40px 40px',
  },
  grid: {
    size: 20,
    visible: true,
    type: 'dot' as const,
    config: {
      color: '#ababab',
      thickness: 1,
    },
  },
};

export default function ThemeExample() {
  const lfRef = useRef<LogicFlow>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [themeModeList, setThemeModeList] = useState([
    { label: '默认主题', value: 'default' },
    { label: '圆角主题', value: 'radius' },
    { label: '彩色主题', value: 'colorful' },
    { label: '暗黑主题', value: 'dark' },
  ]);
  const [themeMode, setThemeMode] = useState('default');
  const [formValues, setFormValues] = useState(initialFormValues);
  const [modifiedThemes, setModifiedThemes] = useState<Set<string>>(new Set());

  const handleFormChange = (
    themeKey: string,
    changedValues: any,
    allValues: any,
  ) => {
    const processedValues = { ...allValues };

    // 处理颜色值
    const processColorValues = (obj: any) => {
      for (const key in obj) {
        if (obj[key] && typeof obj[key] === 'object') {
          if (
            obj[key].toHexString &&
            typeof obj[key].toHexString === 'function'
          ) {
            obj[key] = obj[key].toHexString();
          } else if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
            processColorValues(obj[key]);
          }
        }
      }
    };

    processColorValues(processedValues);

    // 特殊处理背景和网格配置
    if (themeKey === 'background' && lfRef.current) {
      lfRef.current.graphModel.updateBackgroundOptions(processedValues);
    } else if (themeKey === 'grid' && lfRef.current) {
      const gridOptions = {
        ...processedValues,
        config: processedValues.config
          ? {
              color: processedValues.config.color,
              thickness: processedValues.config.thickness,
            }
          : undefined,
      };
      Object.keys(gridOptions).forEach((key) => {
        if (gridOptions[key] === undefined) {
          delete gridOptions[key];
        }
      });
      lfRef.current.graphModel.updateGridOptions(gridOptions);
    }

    const newModifiedThemes = new Set(Array.from(modifiedThemes));
    newModifiedThemes.add(themeMode);
    setModifiedThemes(newModifiedThemes);

    setFormValues((prev) => ({
      ...prev,
      [themeKey]: processedValues,
    }));
  };

  const handleThemeModeChange = (mode: string) => {
    if (!lfRef.current) return;

    const modifiedThemesArray = Array.from(modifiedThemes);
    if (modifiedThemesArray.includes(themeMode)) {
      const currentTheme = lfRef.current.getTheme();
      const modifiedConfig = Object.entries(formValues).reduce(
        (acc, [key, value]) => {
          if (value && Object.keys(value).length > 0) {
            acc[key] = value;
          }
          return acc;
        },
        {} as Record<string, any>,
      );

      LogicFlow.addThemeMode?.(themeMode, {
        ...currentTheme,
        ...modifiedConfig,
      });
    }

    lfRef.current.setTheme({}, mode);
    setThemeMode(mode);

    const newTheme = lfRef.current.getTheme();
    const newFormValues: FormValues = {};

    Object.entries(themeFieldConfigs).forEach(([themeKey]) => {
      if (themeKey === 'background') {
        if (lfRef.current?.graphModel.background) {
          newFormValues[themeKey] = lfRef.current.graphModel.background;
        }
      } else if (themeKey === 'grid') {
        if (lfRef.current?.graphModel.grid) {
          newFormValues[themeKey] = lfRef.current.graphModel.grid;
        }
      } else if (newTheme[themeKey as keyof typeof newTheme]) {
        newFormValues[themeKey] = newTheme[themeKey as keyof typeof newTheme];
      }
    });

    setFormValues({});
    setTimeout(() => {
      setFormValues(newFormValues);
    }, 0);
  };

  const handleExportTheme = () => {
    if (!lfRef.current) return;

    const currentTheme = lfRef.current.getTheme();
    const themeConfig = {
      name: themeMode,
      theme: modifiedThemes.has(themeMode)
        ? {
            ...currentTheme,
            ...Object.entries(formValues).reduce(
              (acc, [key, value]) => {
                if (value && Object.keys(value).length > 0) {
                  acc[key] = value;
                }
                return acc;
              },
              {} as Record<string, any>,
            ),
          }
        : currentTheme,
      timestamp: new Date().toISOString(),
    };

    const themeConfigStr = JSON.stringify(themeConfig, null, 2);
    const blob = new Blob([themeConfigStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `logicflow-theme-${themeMode}-${new Date().getTime()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    message.success('主题配置导出成功');
  };

  const handleImportTheme = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const themeConfig = JSON.parse(event.target?.result as string);

          if (!themeConfig.theme || typeof themeConfig.theme !== 'object') {
            throw new Error('无效的主题配置格式');
          }

          const newThemeMode = {
            label: themeConfig.name || '导入的主题',
            value:
              themeConfig.name?.toLowerCase().replace(/\s+/g, '-') ||
              `imported-theme-${Date.now()}`,
          };

          const existingMode = themeModeList.find(
            (mode) => mode.value === newThemeMode.value,
          );
          if (existingMode) {
            newThemeMode.value = `${newThemeMode.value}-${Date.now()}`;
          }

          if (lfRef.current) {
            LogicFlow.addThemeMode?.(newThemeMode.value, themeConfig.theme);
            setThemeModeList([...themeModeList, newThemeMode]);
            lfRef.current.setTheme({}, newThemeMode.value);
            setThemeMode(newThemeMode.value);

            const importedFormValues: FormValues = {};
            Object.entries(themeConfig.theme).forEach(([key, value]) => {
              if (themeFieldConfigs[key]) {
                importedFormValues[key] = value;
              }
            });

            setFormValues({});
            setTimeout(() => {
              setFormValues(importedFormValues);
            }, 0);

            message.success('主题配置导入成功');
          }
        } catch (error) {
          message.error('导入失败：无效的主题配置文件');
          console.error('Import theme error:', error);
        }
      };

      reader.readAsText(file);
    };

    input.click();
  };

  useEffect(() => {
    if (lfRef.current) {
      lfRef.current.setTheme({}, themeMode);

      const modifiedThemesArray = Array.from(modifiedThemes);
      if (modifiedThemesArray.includes(themeMode)) {
        const modifiedConfig = Object.entries(formValues).reduce(
          (acc, [key, value]) => {
            if (value && Object.keys(value).length > 0) {
              acc[key] = value;
            }
            return acc;
          },
          {} as Record<string, any>,
        );

        if (Object.keys(modifiedConfig).length > 0) {
          lfRef.current.setTheme(modifiedConfig, themeMode);
        }
      }
    }
  }, [themeMode, Array.from(modifiedThemes)]);

  useEffect(() => {
    if (!lfRef.current) {
      const lf = new LogicFlow({
        ...config,
        container: containerRef.current as HTMLElement,
        height: 600,
        width: 600,
        multipleSelectKey: 'shift',
        disabledTools: ['multipleSelect'],
        autoExpand: true,
        adjustEdgeStartAndEnd: true,
        allowRotate: true,
        edgeTextEdit: true,
        keyboard: {
          enabled: true,
        },
        partial: true,
        edgeTextDraggable: true,
        edgeType: 'bezier',
        idGenerator(type) {
          return type + '_' + Math.random();
        },
        edgeGenerator: (sourceNode) => {
          if (['rect', 'diamond', 'polygon'].includes(sourceNode.type))
            return 'bezier';
          return 'polyline';
        },
      });
      lf.render(data);
      lf.translateCenter();
      lfRef.current = lf;

      // 加载当前主题到表单
      setTimeout(() => {
        const currentTheme = lf.getTheme();
        const graphModel = lf.graphModel;

        const mappedFormValues: FormValues = {};
        Object.keys(themeFieldConfigs).forEach((themeKey) => {
          if (themeKey === 'background') {
            if (
              graphModel.background &&
              typeof graphModel.background === 'object'
            ) {
              mappedFormValues[themeKey] = graphModel.background;
            }
          } else if (themeKey === 'grid') {
            if (graphModel.grid) {
              mappedFormValues[themeKey] = graphModel.grid;
            }
          } else if (currentTheme[themeKey as keyof typeof currentTheme]) {
            mappedFormValues[themeKey] =
              currentTheme[themeKey as keyof typeof currentTheme];
          }
        });

        setFormValues(mappedFormValues);
      }, 100);
    }
  }, []);

  // 按分类组织主题项
  const themeCategories: Record<
    string,
    { label: string; items: Array<ThemeConfig & { key: string }> }
  > = {
    basic: { label: '基础主题', items: [] },
    node: { label: '节点主题', items: [] },
    edge: { label: '边主题', items: [] },
    text: { label: '文本主题', items: [] },
    other: { label: '其他元素', items: [] },
    canvas: { label: '画布配置', items: [] },
  };

  Object.entries(themeFieldConfigs).forEach(([key, config]) => {
    themeCategories[config.category].items.push({ key, ...config });
  });

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%' }}>
      {/* 左侧画布 */}
      <div style={{ background: '#f0f2f5' }}>
        <div style={{ padding: 16 }}>
          <div
            style={{
              marginBottom: 16,
              display: 'flex',
              gap: 8,
              alignItems: 'center',
            }}
          >
            <span>主题模式:</span>
            <Select
              value={themeMode}
              style={{ width: 200 }}
              onChange={handleThemeModeChange}
              options={themeModeList}
            />
            <Button type="primary" onClick={handleExportTheme}>
              导出主题配置
            </Button>
            <Button onClick={handleImportTheme}>导入主题配置</Button>
          </div>
        </div>
        <div ref={containerRef} id="LF-theme" />
      </div>

      {/* 右侧表单面板 */}
      <div
        style={{
          width: 500,
          background: '#fff',
          borderLeft: '1px solid #e8e8e8',
          overflow: 'auto',
        }}
      >
        <div style={{ padding: 16 }}>
          <h3 style={{ margin: 0, marginBottom: 16 }}>主题配置</h3>

          <Tabs
            type="card"
            size="small"
            items={Object.entries(themeCategories).map(
              ([categoryKey, category]) => ({
                key: categoryKey,
                label: category.label,
                children: (
                  <div
                    style={{
                      maxHeight: 'calc(100vh - 200px)',
                      overflow: 'auto',
                    }}
                  >
                    {category.items.map((item) => (
                      <div
                        key={item.key}
                        style={{
                          marginBottom: 24,
                          padding: 16,
                          border: '1px solid #f0f0f0',
                          borderRadius: 8,
                        }}
                      >
                        <h4
                          style={{
                            margin: '0 0 12px 0',
                            color: '#666',
                            fontSize: 13,
                          }}
                        >
                          {item.label}
                        </h4>
                        {renderThemeForm(
                          item.key,
                          item,
                          formValues,
                          handleFormChange,
                        )}
                      </div>
                    ))}
                  </div>
                ),
              }),
            )}
          />
        </div>
      </div>
    </div>
  );
}
