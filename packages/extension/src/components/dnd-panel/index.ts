import LogicFlow, {
  Extension,
  PolygonNode,
  PolygonNodeModel,
  EllipseNode,
  EllipseNodeModel,
} from '@logicflow/core';

type Shape = {
  text: string;
  type: string;
};

interface DndPanel extends Extension {
  __dndEl: HTMLElement;
  lf: LogicFlow;
  shapeList: Shape[];
  getDnd: () => HTMLElement;
  __container: HTMLElement;
  registerNode: () => void;
  handleMouseDown: (config: Shape) => void;
}

const DndPanel: DndPanel = {
  name: 'dnd-panel',
  lf: null,
  __container: null,
  __dndEl: null,
  shapeList: [
    {
      type: 'rect',
      text: '矩形',
    },
    {
      type: 'circle',
      text: '圆形',
    },
    {
      type: 'polygon',
      text: '菱形',
    },
    {
      type: 'star',
      text: '五角星',
    },
    {
      type: 'triangle',
      text: '三角形',
    },
    {
      type: 'hexagon',
      text: '六边形',
    },
  ],
  install(lf) {
    DndPanel.lf = lf;
    DndPanel.registerNode();
    lf.setShapeList = (config) => {
      if (!Array.isArray(config)) {
        throw new TypeError('DndPanel 的 ShapeList 必须是数组');
      } else if (config.length > 0) {
        DndPanel.shapeList = config;
      }
    };
  },
  render(lf, container) {
    DndPanel.__container = container;
    DndPanel.__dndEl = DndPanel.getDnd();
    container.appendChild(DndPanel.__dndEl);
  },
  destroy() {
    DndPanel.__container.removeChild(DndPanel.__dndEl);
  },
  getDnd() {
    const { handleMouseDown } = DndPanel;
    const dndContainer = document.createElement('div');
    dndContainer.className = 'lf-dnd';
    DndPanel.shapeList.forEach((shape) => {
      const { type, text } = shape;
      const dndItem = document.createElement('div');
      const dndIcon = document.createElement('div');
      const dndText = document.createElement('span');
      dndItem.className = 'lf-dnd-item';
      dndIcon.className = `lf-dnd-${type}`;
      dndIcon.onmousedown = () => handleMouseDown(shape);
      dndText.innerText = text;
      dndItem.append(dndIcon, dndText);
      dndContainer.appendChild(dndItem);
    });
    return dndContainer;
  },
  registerNode() {
    const { lf } = DndPanel;
    class StarNode extends PolygonNode {
    }
    class StarModel extends PolygonNodeModel {
      constructor(data, graphModel) {
        super(data, graphModel);
        this.points = [
          [45, 0],
          [20, 90],
          [90, 30],
          [0, 30],
          [80, 90],
        ];
      }
    }
    lf.register({
      type: 'star',
      view: StarNode,
      model: StarModel,
    });

    class TriangleNode extends PolygonNode {
    }
    class TriangleModel extends PolygonNodeModel {
      constructor(data, graphModel) {
        if (data.text && typeof data.text === 'string') {
          data.text = {
            value: data.text,
            x: data.x,
            y: data.y + 20,
          };
        }
        super(data, graphModel);
        this.points = [
          [50, 0],
          [100, 100],
          [0, 100],
        ];
      }
    }
    lf.register({
      type: 'triangle',
      view: TriangleNode,
      model: TriangleModel,
    });

    class MyEllipseNode extends EllipseNode {
    }
    class MyEllipseModel extends EllipseNodeModel {
      constructor(data, graphModel) {
        super(data, graphModel);
        this.rx = 60;
        this.ry = 40;
      }
    }

    lf.register({
      type: 'ellipse',
      view: MyEllipseNode,
      model: MyEllipseModel,
    });

    class HexagonNode extends PolygonNode {
    }
    class HexagonModel extends PolygonNodeModel {
      constructor(data, graphModel) {
        super(data, graphModel);
        this.points = [
          [40, 0],
          [80, 20],
          [80, 60],
          [40, 80],
          [0, 60],
          [0, 20],
        ];
      }
    }

    lf.register({
      type: 'hexagon',
      view: HexagonNode,
      model: HexagonModel,
    });
  },
  handleMouseDown(config) {
    const { lf } = DndPanel;
    lf.dnd.startDrag(config);
  },
};

export default DndPanel;
export {
  DndPanel,
};
