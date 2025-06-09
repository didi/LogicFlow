import { Button, Card, Divider, Flex, message } from 'antd';
import React, { useEffect, useRef } from 'react';

const { Control, DndPanel, DynamicGroup, SelectionSelect } = Extension;

function insertCss(cssText: string) {
  const style = document.createElement('style');
  style.textContent = cssText;
  document.head.appendChild(style);
}

const config: Partial<LogicFlow.Options> = {
  // grid: true,
  multipleSelectKey: 'alt',
  autoExpand: false,
  allowResize: true,
  allowRotate: true,
  nodeTextDraggable: false,
  stopMoveGraph: true,
  grid: {
    size: 10,
  },
  snapGrid: false,
  keyboard: {
    enabled: true,
  },
  plugins: [DynamicGroup, Control, DndPanel, SelectionSelect],
};

const customDndConfig = [
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
  //   icon: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/examples/extension/group/subprocess-expanded.png',
  // },
  // {
  //   type: 'sub-process',
  //   label: '子流程-收起',
  //   text: 'SubProcess',
  //   icon: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/examples/extension/group/subprocess-collapsed.png',
  // },
];

const getDndPanelConfig = (lf: LogicFlow): ShapeItem[] => [
  {
    label: '单次框选',
    icon: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/examples/extension/bpmn/select.png',
    callback: () => {
      lf.openSelectionSelect();
      lf.once('selection:selected', () => {
        lf.closeSelectionSelect();
      });
    },
  },
  {
    label: '开启框选',
    icon: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/examples/extension/bpmn/select.png',
    callback: () => {
      lf.openSelectionSelect();
    },
  },
  {
    label: '关闭框选',
    icon: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/examples/extension/bpmn/select.png',
    callback: () => {
      lf.closeSelectionSelect();
    },
  },
  ...customDndConfig,
];

export default function DynamicGroupDemo() {
  const lfRef = useRef<LogicFlow>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!lfRef.current) {
      const lf = new LogicFlow({
        ...config,
        height: 600,
        container: containerRef.current as HTMLElement,
      });

      // 添加自定义控制按钮
      (lf.extension.control as Control).addItem({
        key: 'move-group',
        iconClass: 'lf-control-move',
        title: '',
        text: '右移分组',
        onClick: (lf) => {
          const { nodes } = lf.getSelectElements();
          const selectedNode = nodes[0];
          if (!selectedNode) {
            return;
          }
          const isGroup = lf.getModelById(selectedNode.id)?.isGroup;
          if (!isGroup) {
            return;
          }
          lf.graphModel.moveNode(selectedNode.id, 10, 0);
        },
      });

      (lf.extension.control as Control).addItem({
        key: 'add-child',
        iconClass: 'lf-control-add',
        title: '',
        text: 'addChild',
        onClick: (lf) => {
          const groupModel = lf.getNodeModelById('#2041_dynamic-group_1');
          groupModel?.addChild('#2041_circle_1');
          groupModel?.addChild('#2041_circle_2');
        },
      });

      const dndPanelConfig = getDndPanelConfig(lf);
      lf.setPatternItems(dndPanelConfig);

      // lf.register(customGroup)
      // lf.register(subProcess)

      // 获取渲染数据
      const graphData: GraphConfigData = {
        nodes: [
          {
            id: 'circle_2',
            type: 'circle',
            x: 800,
            y: 140,
            text: {
              value: 'circle_2',
              x: 800,
              y: 140,
              editable: false,
              draggable: true,
            },
          },
          {
            id: 'circle_3',
            type: 'circle',
            x: 544,
            y: 94,
            properties: {},
            text: {
              x: 544,
              y: 94,
              value: 'Circle',
            },
          },
          {
            id: 'dynamic-group_1',
            type: 'dynamic-group',
            x: 500,
            y: 140,
            text: 'dynamic-group_1',
            resizable: true,
            properties: {
              collapsible: true,
              width: 420,
              height: 250,
              radius: 5,
              isCollapsed: true,
              children: ['circle_3', 'circle_2'],
            },
          },
          {
            id: 'rect_1',
            type: 'rect',
            x: 455,
            y: 243,
            properties: {
              width: 40,
              height: 40,
            },
          },
          {
            id: 'dynamic-group_2',
            type: 'dynamic-group',
            x: 544,
            y: 376,
            text: 'dynamic-group_2',
            resizable: true,
            properties: {
              transformWithContainer: false,
              width: 520,
              height: 350,
              radius: 5,
              collapsible: false,
              isCollapsed: false,
              isRestrict: false,
              children: ['rect_1', 'dynamic-group-inner-2'],
            },
          },
          {
            id: 'dynamic-group-inner-2',
            type: 'dynamic-group',
            x: 544,
            y: 376,
            text: 'dynamic-group-inner-2',
            resizable: true,
            properties: {
              transformWithContainer: false,
              width: 320,
              height: 150,
              radius: 5,
              collapsible: false,
              isCollapsed: false,
              isRestrict: false,
              children: ['inner-rect'],
            },
          },
          {
            id: 'inner-rect',
            type: 'rect',
            x: 452,
            y: 357,
            properties: {
              width: 100,
              height: 80,
            },
            text: {
              x: 452,
              y: 357,
              value: 'Rect',
            },
          },
          // #2041 - 演示动态添加子节点的功能
          {
            id: '#2041_circle_1',
            type: 'circle',
            x: 1022,
            y: 170,
            text: {
              value: 'circle_1',
              x: 1022,
              y: 170,
              draggable: true,
            },
          },
          {
            id: '#2041_circle_2',
            type: 'circle',
            x: 1180,
            y: 170,
            text: {
              value: 'circle_2',
              x: 1180,
              y: 170,
              draggable: true,
            },
          },
          {
            id: '#2041_dynamic-group_1',
            type: 'dynamic-group',
            x: 1042,
            y: 189,
            text: 'dynamic-group_fix_#2041',
            resizable: true,
            properties: {
              width: 420,
              height: 250,
              radius: 5,
            },
          },
        ],
        edges: [],
      };
      lf.render(graphData);
      // lf.setSelectionSelectMode(true)

      // 添加事件监听
      lf.on('node:properties-change', (event: unknown) => {
        console.log('node:properties-change', event);
      });

      lf.on('dynamicGroup:collapse', ({ collapse, nodeModel }) => {
        message.info(`分组${nodeModel.id} ${collapse ? '收起' : '展开'}`);
      });

      lfRef.current = lf;
    }
  }, []);

  const getGraphData = () => {
    const graphData = lfRef.current?.getGraphRawData();
    console.log('cur graph data:', graphData);
  };

  const rerender = () => {};

  return (
    <Card
      title="LogicFlow Extension - DynamicGroup"
      className="control-container"
    >
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
    </Card>
  );
}

const container = document.querySelector('#container')!;
const root = createRoot(container);
root.render(<DynamicGroupDemo></DynamicGroupDemo>);

insertCss(`
.viewport {
  position: relative;
  height: 70vh;
  overflow: hidden;
}

.lf-dnd-shape {
  background-size: contain;
}

.lf-control-move {
  background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAKJJREFUOE/tld0NgCAMhI/NdDJ1MtlMOQIE+QfxzSZEg83ntT1UAFgAbOYKLw61J83y94v3QsGuQgaBazMNwA+MulXrIQfKHBdve8iBPl46A0h1DtoDZHlcftC/NjS0Fbgb89csKWcDj1YglVFlGMMl50q1x3ZoKCnodNtMN3akumcoNcvo558Az8QJsGr41U7ZJauWCtlYQsOgFexvoKlcJt2i9jtU9QFt2QAAAABJRU5ErkJggg==');
}

.lf-control-add {
  background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAMZJREFUOE/FlFESgjAMRJeTqSdTToaeDN2O2wkloWTsjP2E8Pq6CZ0weE2DebDAB4B7YoMbgGdbb4ErgPlTQHBvLQBeXq2AVwAsykTAb0JDD8hnZyLYmEaG2TxpykzrEVvDLLCyIkPmyU3skoU2dxv8F6A6qfBts+wpitwZw6NRslm7QE2/zbB077tkKzNruwGynhAu/i2cv5+aIgMegRbDgAJHY8PGXBz73Ry2M+UBexfGLkP7QTS8EbTeUpnbpWdY3g8HvgGE0DMVMaLiBgAAAABJRU5ErkJggg==');
}
`);
