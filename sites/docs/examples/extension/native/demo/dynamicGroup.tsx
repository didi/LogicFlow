// import LogicFlow from '@logicflow/core'
const { Control, DndPanel, DynamicGroup, SelectionSelect } = Extension;

import { Button, Divider, Flex } from 'antd';
import React, { useEffect, useRef } from 'react';

import '@logicflow/core/es/index.css';
import '@logicflow/extension/es/index.css';

const config: Partial<LogicFlow.Options> = {
  grid: true,
  multipleSelectKey: 'alt',
  autoExpand: false,
  allowResize: true,
  allowRotate: true,
  nodeTextDraggable: false,
  keyboard: {
    enabled: true,
  },
  plugins: [DynamicGroup, Control, DndPanel, SelectionSelect],
};

const customDndConfig: ShapeItem[] = [
  {
    type: 'dynamic-group',
    label: '内置动态分组',
    text: 'DynamicGroup',
    icon: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/examples/extension/group/group.png',
  },
  {
    type: 'circle',
    label: '圆形',
    text: 'Circle',
    icon: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/examples/extension/group/circle.png',
  },
  {
    type: 'rect',
    label: '矩形',
    text: 'Rect',
    icon: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/examples/extension/group/rect.png',
  },
  // {
  //   type: 'sub-process',
  //   label: '子流程-展开',
  //   text: 'SubProcess',
  //   icon: getImageUrl('/group/subprocess-expanded.png'),
  // },
  // {
  //   type: 'sub-process',
  //   label: '子流程-收起',
  //   text: 'SubProcess',
  //   icon: getImageUrl('/group/subprocess-collapsed.png'),
  // },
];

const getDndPanelConfig = (lf: LogicFlow): ShapeItem[] => [
  {
    label: '选区',
    icon: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/examples/extension/bpmn/select.png',
    callback: () => {
      lf.openSelectionSelect();
      lf.once('selection:selected', () => {
        lf.closeSelectionSelect();
      });
    },
  },
  ...customDndConfig,
];

const DynamicGroupExtension: React.FC = () => {
  const lfRef = useRef<LogicFlow>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!lfRef.current) {
      const lf = new LogicFlow({
        ...config,
        container: containerRef.current as HTMLElement,
      });

      const dndPanelConfig = getDndPanelConfig(lf);
      lf.setPatternItems(dndPanelConfig);

      // lf.register(customGroup)
      // lf.register(subProcess)

      // 获取渲染数据
      const graphData: LogicFlow.GraphConfigData = {
        nodes: [
          {
            id: 'circle_2',
            type: 'circle',
            x: 522,
            y: 170,
            text: {
              value: 'circle_2',
              x: 522,
              y: 170,
              editable: false,
              draggable: true,
            },
          },
          {
            id: 'dynamic-group_1',
            type: 'dynamic-group',
            x: 382,
            y: 189,
            // children: ["rect_3"],
            text: 'dynamic-group_1',
            resizable: true,
            properties: {
              // resizable: true,
              collapsible: true,
              width: 420,
              height: 250,
              radius: 5,
              isCollapsed: true,
            },
          },
          {
            id: 'dynamic-group_2',
            type: 'dynamic-group',
            x: 382,
            y: 393,
            // children: ["rect_3"],
            text: 'dynamic-group_2',
            resizable: true,
            properties: {
              width: 420,
              height: 250,
              radius: 5,
              collapsible: false,
              isCollapsed: false,
            },
          },
        ],
        edges: [],
        // 'nodes': [
        //   {
        //     'id': 'circle_2',
        //     'type': 'circle',
        //     'x': 800,
        //     'y': 140,
        //     'properties': {},
        //     'text': {
        //       'x': 800,
        //       'y': 140,
        //       'value': 'circle_2',
        //     },
        //   },
        //   {
        //     'id': 'dynamic-group_1',
        //     'type': 'dynamic-group',
        //     'x': 330,
        //     'y': 45,
        //     'properties': {
        //       'collapsible': true,
        //       'width': 420,
        //       'height': 250,
        //       'radius': 5,
        //       'isCollapsed': true,
        //       'children': [],
        //     },
        //     'text': {
        //       'x': 330,
        //       'y': 45,
        //       'value': 'dynamic-group_1',
        //     },
        //     'children': [],
        //   },
        //   {
        //     'id': 'dynamic-group_2',
        //     'type': 'dynamic-group',
        //     'x': 500,
        //     'y': 220,
        //     'properties': {
        //       'width': 420,
        //       'height': 250,
        //       'radius': 5,
        //       'collapsible': false,
        //       'isCollapsed': false,
        //       'children': [
        //         '60cff3ff-c20d-461f-9643-ee6a3b9badfc',
        //         '37869799-e2ee-45b8-9150-b38ccc8e65d3',
        //       ],
        //     },
        //     'text': {
        //       'x': 500,
        //       'y': 220,
        //       'value': 'dynamic-group_2',
        //     },
        //     'children': [
        //       '60cff3ff-c20d-461f-9643-ee6a3b9badfc',
        //       '37869799-e2ee-45b8-9150-b38ccc8e65d3',
        //     ],
        //   },
        //   {
        //     'id': '60cff3ff-c20d-461f-9643-ee6a3b9badfc',
        //     'type': 'circle',
        //     'x': 552,
        //     'y': 194,
        //     'properties': {},
        //     'text': {
        //       'x': 552,
        //       'y': 194,
        //       'value': 'Circle',
        //     },
        //   },
        //   {
        //     'id': '37869799-e2ee-45b8-9150-b38ccc8e65d3',
        //     'type': 'rect',
        //     'x': 390,
        //     'y': 214,
        //     'properties': {},
        //     'text': {
        //       'x': 390,
        //       'y': 214,
        //       'value': 'Rect',
        //     },
        //   },
        // ],
        // 'edges': [],
      };
      lf.render(graphData);

      lfRef.current = lf;
    }
  }, []);

  const getGraphData = () => {
    const graphData = lfRef.current?.getGraphRawData();
    console.log('cur graph data:', graphData);
  };

  const rerender = () => {};

  return (
    <>
      <Flex wrap="wrap" gap="small">
        <Button type="primary" key="getData" onClick={getGraphData}>
          获取数据
        </Button>
        <Button type="primary" key="rerender" onClick={rerender}>
          重新渲染
        </Button>
      </Flex>
      <Divider />
      <div ref={containerRef} id="graph" className="viewport"></div>
    </>
  );
};

const container = document.querySelector('#container');
const root = createRoot(container);
root.render(<DynamicGroupExtension></DynamicGroupExtension>);

insertCss(`
.lf-dnd-shape {
  background-size: contain;
}
`);
