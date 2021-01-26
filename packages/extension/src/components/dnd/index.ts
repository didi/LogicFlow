import LogicFlow, { Extension } from '@logicflow/core';

type Shape = {
  text: string;
  type: string;
};

interface Dnd extends Extension {
  lf: LogicFlow;
  shapeList: Shape[];
  getDnd: () => HTMLElement;
  registerNode: () => void;
  handleMouseDown: (config: Shape) => void;
}

const Dnd: Dnd = {
  lf: null,
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
    Dnd.lf = lf;
    Dnd.registerNode();
    lf.setShapeList = (config) => {
      if (!Array.isArray(config)) {
        throw new TypeError('Dnd 的 ShapeList 必须是数组');
      } else if (config.length > 0) {
        Dnd.shapeList = config;
      }
    };
  },
  render(lf, container) {
    container.appendChild(Dnd.getDnd());
  },
  getDnd() {
    const { handleMouseDown } = Dnd;
    const dndContainer = document.createElement('div');
    dndContainer.className = 'lf-dnd';
    Dnd.shapeList.forEach((shape) => {
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
    const { lf } = Dnd;
    lf.register('star', ({ PolygonNode, PolygonNodeModel }) => {
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
      return {
        view: StarNode,
        model: StarModel,
      };
    });
    lf.register('triangle', ({ PolygonNode, PolygonNodeModel }) => {
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
      return {
        view: TriangleNode,
        model: TriangleModel,
      };
    });
    lf.register('ellipse', ({ EllipseNode, EllipseNodeModel }) => {
      class MyEllipseNode extends EllipseNode {
      }
      class MyEllipseModel extends EllipseNodeModel {
        constructor(data, graphModel) {
          super(data, graphModel);
          this.rx = 60;
          this.ry = 40;
        }
      }
      return {
        view: MyEllipseNode,
        model: MyEllipseModel,
      };
    });
    lf.register('hexagon', ({ PolygonNode, PolygonNodeModel }) => {
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
      return {
        view: HexagonNode,
        model: HexagonModel,
      };
    });
  },
  handleMouseDown(config) {
    const { lf } = Dnd;
    lf.dnd.startDrag(config);
  },
};

export default Dnd;
export {
  Dnd,
};
