import { Button, Divider, Flex } from 'antd';
import React, { useEffect, useRef } from 'react';
const { Control, DndPanel, Group, SelectionSelect, GroupNode, GroupNodeModel } =
  Extension;

class CustomGroup extends GroupNode {}

class CustomGroupModel extends GroupNodeModel {
  foldedText?: TextConfig;

  initNodeData(data: NodeConfig) {
    super.initNodeData(data);
    this.isRestrict = true;
    this.resizable = true;
    this.width = 480;
    this.height = 280;
  }

  getNodeStyle() {
    const style = super.getNodeStyle();
    style.stroke = '#AEAFAE';
    style.strokeWidth = 1;
    return style;
  }

  foldGroup(folded: boolean) {
    super.foldGroup(folded);
    // this.isFolded = folded

    if (folded) {
      if (this.foldedText) {
        this.text = { ...this.foldedText };
      }
      if (!this.text.value) {
        this.text.value = '已折叠分组';
      }
      this.text.x = this.x + 10;
      this.text.y = this.y;
    } else {
      this.foldedText = { ...this.text };
      this.text.value = '';
    }
  }

  // isAllowAppendIn(nodeData) {
  //   if (nodeData.type === 'rect') {
  //     return false
  //   }
  //   return true
  // }
}

const customGroup = {
  type: 'custom-group',
  view: CustomGroup,
  model: CustomGroupModel,
};

class SubProcess extends GroupNode {}

class SubProcessModel extends GroupNodeModel {
  foldedText?: TextConfig;
  setAttributes() {
    // const size = 80
    const circleOnlyAsTarget = {
      message: '正方形节点下一个节点只能是圆形节点',
      validate: () => {
        return false;
      },
    };
    this.targetRules.push(circleOnlyAsTarget);
  }

  initNodeData(data: NodeData) {
    super.initNodeData(data);
    this.foldable = true;
    this.resizable = true;
    this.width = 400;
    this.height = 200;
  }

  getNodeStyle() {
    const style = super.getNodeStyle();
    style.stroke = '#989891';
    style.strokeWidth = 1;
    style.strokeDasharray = '3 3';
    if (this.isSelected) {
      style.stroke = 'rgb(124, 15, 255)';
    }
    if (this.isFolded) {
      style.fill = '#47C769';
    }
    return style;
  }

  foldGroup(folded: boolean) {
    super.foldGroup(folded);
    if (folded) {
      if (this.foldedText) {
        this.text = { ...this.foldedText };
      }
      if (!this.text.value) {
        this.text.value = '已折叠分组已折叠分组已折叠分组';
      }
      this.text.x = this.x + 10;
      this.text.y = this.y;
    } else {
      this.foldedText = { ...this.text };
      this.text.value = '';
    }
  }

  // isAllowAppendIn(nodeData) {
  //   return false
  // }
}

const subProcess = {
  type: 'sub-process',
  view: SubProcess,
  model: SubProcessModel,
};

const config: Partial<LogicFlow.Options> = {
  grid: true,
  multipleSelectKey: 'alt',
  autoExpand: false,
  keyboard: {
    enabled: true,
  },
  plugins: [Group, Control, DndPanel, SelectionSelect],
};

const customDndConfig: ShapeItem[] = [
  {
    type: 'custom-group',
    label: '自定义分组',
    text: 'CustomGroup',
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
  {
    type: 'sub-process',
    label: '子流程-展开',
    text: 'SubProcess',
    icon: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/examples/extension/group/subprocess-expanded.png',
  },
  {
    type: 'sub-process',
    label: '子流程-收起',
    text: 'SubProcess',
    icon: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/examples/extension/group/subprocess-collapsed.png',
  },
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

const container = document.querySelector('#container');
const root = createRoot(container);

const BPMNExtension: React.FC = () => {
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

      lf.register(customGroup);
      lf.register(subProcess);

      // 获取渲染数据
      const graphData: GraphConfigData = {
        nodes: [
          {
            id: 'group_1',
            type: 'sub-process',
            x: 300,
            y: 120,
            // children: ["rect_3"],
            text: 'sub-process-1',
            properties: {
              isFolded: false,
            },
          },
        ],
        edges: [],
      };
      lf.render(graphData);

      lfRef.current = lf;
    }
  }, []);

  const getGraphData = () => {
    if (lfRef.current) {
      const graphData = lfRef.current?.getGraphRawData();
      console.log('graphData --->>>', graphData);
    }
  };

  const rerender = () => {
    lfRef.current &&
      lfRef.current.render({
        nodes: [
          {
            id: 'group_1',
            type: 'sub-process',
            x: 300,
            y: 120,
            text: 'sub-process-1',
            properties: {
              isFolded: false,
            },
          },
        ],
        edges: [],
      });
  };

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
      <div ref={containerRef} id="graph"></div>
    </>
  );
};

root.render(<BPMNExtension></BPMNExtension>);

insertCss(`
.lf-dnd-shape {
  background-size: contain;
}
#graph {
  height: calc(100% - 70px);
}
`);
