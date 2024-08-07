import React, { useEffect, useRef } from 'react';

const { DndPanel } = Extension;

type CustomProperties = {
  // 形状属性
  width?: number;
  height?: number;
  radius?: number;

  imageHref: string;

  // 样式属性
  style?: LogicFlow.CommonTheme;
  textStyle?: LogicFlow.TextNodeTheme;
};

class CustomImageNode extends RectNode {
  getShape = (): h.JSX.Element => {
    const { model } = this.props;
    const { x, y, width, height, radius } = model;
    const href = this.getImageHref();
    console.log('model.modelType', model.modelType);
    const style = model.getNodeStyle();

    return h('g', {}, [
      h('image', {
        ...style,
        x: x - width / 2,
        y: y - height / 2,
        rx: radius,
        ry: radius,
        width,
        height,
        href,
        // 根据宽高缩放
        preserveAspectRatio: 'none meet',
      }),
    ]);
  };

  getImageHref = (): string => {
    return '';
  };
}

class CustomImageNodeModel extends RectNodeModel {
  setAttributes() {
    console.log('this.properties', this.properties);
    const { width, height, radius } = this.properties as CustomProperties;
    if (width) {
      this.width = width;
    }
    if (height) {
      this.height = height;
    }
    if (radius) {
      this.radius = radius;
    }
  }
}

const CustomImage = {
  type: 'customImage',
  view: CustomImageNode,
  model: CustomImageNodeModel,
};

class StartNodeView extends CustomImage.view {
  getImageHref = () => {
    return 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/core/start.png';
  };
}

class StartNodeModel extends CustomImage.model {
  setAttributes() {
    this.width = 50;
    this.height = 50;
    this.radius = 5;
    this.text.value = '';
  }
}

const StartNode = {
  type: 'start',
  view: StartNodeView,
  model: StartNodeModel,
};

class EndNodeView extends CustomImage.view {
  getImageHref = () => {
    return 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/core/end.png';
  };
}

class EndNodeModel extends CustomImage.model {
  setAttributes() {
    this.width = 50;
    this.height = 50;
    this.radius = 5;
    this.text.value = '';
  }
}

const EndNode = {
  type: 'end',
  view: EndNodeView,
  model: EndNodeModel,
};

const container = document.querySelector('#container');
const root = createRoot(container);

const config: Partial<LogicFlow.Options> = {
  isSilentMode: false,
  stopScrollGraph: true,
  stopZoomGraph: true,
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
};

const DndPanelExtension: React.FC = () => {
  const lfRef = useRef<LogicFlow>();
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!lfRef.current) {
      const lf = new LogicFlow({
        ...config,
        container: containerRef.current as HTMLElement,
        grid: {
          size: 10,
        },
        plugins: [DndPanel],
      });

      lf.render({
        nodes: [],
        edges: [],
      });

      lf.register(StartNode);
      lf.register(EndNode);
      // lf.batchRegister([StartNode, EndNode])

      // lf.extension.dndPanel.setPatternItems([])
      lf.setPatternItems([
        {
          type: 'start',
          text: '开始',
          label: '开始节点',
          icon: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/core/start.png',
        },
        {
          type: 'rect',
          label: '系统任务',
          icon: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/core/rect.png',
          className: 'import_icon',
        },
        {
          type: 'diamond',
          label: '条件判断',
          icon: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/core/diamond.png',
        },
        {
          type: 'end',
          text: '结束',
          label: '结束节点',
          icon: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/core/end.png',
        },
      ]);

      lfRef.current = lf;
    }
  }, []);

  return (
    <>
      <div ref={containerRef} id="graph"></div>
    </>
  );
};

root.render(<DndPanelExtension></DndPanelExtension>);

insertCss(`
#graph{
  width: 100%;
  height: 100%;
}

.lf-dnd-shape {
  background-size: contain;
}
`);
