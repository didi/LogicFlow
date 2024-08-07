import { Button, Divider, Flex } from 'antd';
import React, { useEffect, useRef } from 'react';

const {
  AutoLayout,
  BpmnElement,
  BpmnXmlAdapter,
  ContextMenu,
  Control,
  DndPanel,
  FlowPath,
  Menu,
  Group,
  MiniMap,
  SelectionSelect,
  Snapshot,
} = Extension;

const config: Partial<LogicFlow.Options> = {
  edgeTextDraggable: true,
  nodeTextDraggable: true,
  // adjustNodePosition: false,
  // stopMoveGraph: true,
  // multipleSelectedKey: 'meta', // alt, shift
  hideAnchors: false,
  plugins: [
    BpmnElement,
    MiniMap,
    FlowPath,
    AutoLayout,
    DndPanel,
    Menu,
    ContextMenu,
    Group,
    Control,
    BpmnXmlAdapter,
    Snapshot,
    SelectionSelect,
  ],
  // isSilentMode: true,
  grid: {
    type: 'dot',
    size: 20,
  },
  keyboard: {
    enabled: true,
  },
  snapline: true,
  height: 500,
};

const menuConfig: Record<string, any> = {
  nodeMenu: [
    {
      text: '分享',
      callback() {
        console.log('分享成功！');
      },
    },
    {
      text: '复制',
      callback() {
        console.log('分享成功！');
      },
    },
    {
      text: '修改',
      callback() {
        console.log('分享成功！');
      },
    },
  ],
  graphMenu: [
    {
      text: '分111享',
      callback() {
        console.log('分享成功22！');
      },
    },
  ],
};

const defaultIconConfig: ShapeItem[] = [
  {
    type: 'bpmn:startEvent',
    label: '开始',
    text: '开始',
    icon: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/examples/extension/bpmn/start-event-none.png',
  },
  {
    type: 'bpmn:userTask',
    label: '用户任务',
    icon: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/examples/extension/bpmn/user-task.png',
    properties: {
      actived: true,
    },
  },
  {
    type: 'bpmn:serviceTask',
    label: '系统任务',
    icon: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/examples/extension/bpmn/service-task.png',
    cls: 'import_icon',
  },
  {
    type: 'bpmn:exclusiveGateway',
    label: '条件判断',
    icon: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/examples/extension/bpmn/gateway-xor.png',
  },
  {
    type: 'bpmn:endEvent',
    label: '结束',
    icon: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/examples/extension/bpmn/end-event-none.png',
  },
  {
    type: 'group',
    label: '分组',
    icon: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/examples/extension/bpmn/task-none.png',
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
  ...defaultIconConfig,
];

const download = (filename: string, text: string) => {
  const element = document.createElement('a');
  element.setAttribute(
    'href',
    'data:text/plain;charset=utf-8,' + encodeURIComponent(text),
  );
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();
  document.body.removeChild(element);
};

const container = document.querySelector('#container');
const root = createRoot(container);

const BPMNExtension: React.FC = () => {
  const lfRef = useRef<LogicFlow>();
  const containerRef = useRef<HTMLDivElement>(null);

  const renderXml = (xml: any) => {
    const lf = lfRef.current;
    if (!lf) {
      return;
    }
    lf.render(xml);
  };

  useEffect(() => {
    if (!lfRef.current) {
      const lf = new LogicFlow({
        ...config,
        container: containerRef.current as HTMLElement,
      });

      lf.setMenuConfig(menuConfig);

      const commonMenuConfig = {
        icon: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/examples/extension/bpmn/delete.png',
        callback: (data: NodeData) => {
          lf.deleteElement(data.id);
          lf.hideContextMenu();
        },
      };
      lf.setContextMenuItems([commonMenuConfig]);
      lf.setContextMenuByType('bpmn:userTask', defaultIconConfig);
      // lf.setContextMenuByType('bpmn:serviceTask', defaultIconConfig);

      const dndPanelConfig = getDndPanelConfig(lf);
      lf.setPatternItems(dndPanelConfig);

      const { control, miniMap } = lf.extension;

      (control as Control).addItem({
        key: 'mini-map',
        iconClass: 'custom-minimap',
        title: '',
        text: '导航',
        onMouseEnter: (lf: LogicFlow, ev: MouseEvent) => {
          const position = lf.getPointByClient(ev.x, ev.y);
          (miniMap as MiniMap).show(
            position.domOverlayPosition.x - 120,
            position.domOverlayPosition.y + 35,
          );
        },
        onClick: (lf: LogicFlow, ev: MouseEvent) => {
          // console.log(MiniMap, ev);
          const position = lf.getPointByClient(ev.x, ev.y);
          // console.log(position);
          (miniMap as MiniMap).show(
            position.domOverlayPosition.x - 120,
            position.domOverlayPosition.y + 35,
          );
        },
      });

      lf.render({});

      lfRef.current = lf;
    }
  }, []);

  const handleDownloadData = () => {
    const data = lfRef.current?.getGraphData();
    download('logicflow.xml', data);
    window.sessionStorage.setItem('lf-data', data);
  };

  const handleUploadData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const xml = event.target?.result;
      renderXml(xml);
    };
    reader.onerror = (error) => console.log(error);

    file && reader.readAsText(file); // you could also read images and other binaries
  };

  const getPath = () => {
    const lf = lfRef.current;
    if (lf) {
      lf.setStartNodeType('bpmn:startEvent');
      const paths = lf.getPathes();
      console.log('paths', paths);
      window.sessionStorage.setItem('lf-paths', JSON.stringify(paths));
      // console.log(JSON.parse(window.sessionStorage.getItem('lf-pathes') ?? ''))
    }
  };

  const autoLayout = () => {
    const nextData = lfRef.current?.layout('bpmn:startEvent');
    console.log('after layout:', nextData);
  };

  const getSelectElements = () => {
    const data = lfRef.current?.getSelectElements(true);
    console.log('selected elements: ', data);
  };

  const showContextMenu = () => {
    const lf = lfRef.current;
    if (lf) {
      const { nodes } = lf.getSelectElements();
      console.log(nodes[0]);
      lf.showContextMenu(nodes[0]);
    }
  };

  return (
    <>
      <p>兼容BPMN官方DEMO，此处仅实现了bpmn中的一部分节点</p>
      <p>此页面绘制的图可以在BPMN官方DEMO中正常使用</p>
      <p>
        点击左下角下载xml，将文件上传到{' '}
        <a href="https://demo.bpmn.io/" target="_blank">
          https://demo.bpmn.io/
        </a>
        即可使用。
      </p>
      <Flex wrap="wrap" gap="small">
        <Button type="primary" key="getPath" onClick={getPath}>
          获取路径
        </Button>
        <Button
          type="primary"
          key="showPath"
          onClick={() => {
            const rawPath = lfRef.current?.getRawPathes();
            console.log('showPath', rawPath);
          }}
        >
          原始路径
        </Button>
        <Button type="primary" key="autoLayout" onClick={autoLayout}>
          自动布局
        </Button>
        <Button
          type="primary"
          key="getSelectElements"
          onClick={getSelectElements}
        >
          获取数据
        </Button>
        <Button type="primary" key="showMenu" onClick={showContextMenu}>
          显示菜单
        </Button>
        <Button
          type="primary"
          key="resize"
          onClick={() => lfRef.current?.resize(1200, 400)}
        >
          重设宽高
        </Button>
      </Flex>
      <Divider />
      <div ref={containerRef} id="graph"></div>
      <div className="graph-io">
        <div onClick={handleDownloadData}>
          <img
            src="https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/examples/extension/bpmn/export.png"
            alt="Download GraphData"
          />
        </div>
        <div onClick={() => lfRef.current?.getSnapshot()}>
          <img
            src="https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/examples/extension/bpmn/image.png"
            alt="Download Graph Image"
          />
        </div>
        <div>
          <input
            type="file"
            className="upload"
            id="upload"
            onChange={handleUploadData}
          />
          <img
            src="https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/examples/extension/bpmn/upload.png"
            alt="Upload Data"
          />
        </div>
      </div>
    </>
  );
};

root.render(<BPMNExtension></BPMNExtension>);

insertCss(`
.lf-dnd-shape {
  background-size: contain;
}

.graph-io {
  position: absolute;
  right: 15px;
  bottom: 10px;
  z-index: 9999;
  display: flex;
  padding: 10px;
  background: rgb(255 255 255 / 80%);
  border-radius: 5px;
  box-shadow: 0 1px 4px rgb(0 0 0 / 30%);
}

.graph-io > div {
  position: relative;
  width: 25px;
  margin: 0 5px;
  cursor: pointer;
}

.graph-io div img {
  width: 100%;
}

.custom-minimap {
  background: url('data:image/png;base64,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');
}

#upload {
  width: 100%;
  position: absolute;
  z-index: 99;
  left: 0;
  top: 0;
  opacity: 0;
  cursor: pointer;
}

.upload::-webkit-file-upload-button {
  cursor: pointer;
}
`);
