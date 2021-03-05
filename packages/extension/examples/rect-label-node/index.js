window.onload = function () {
  LogicFlow.use(RectLabelNode);
  LogicFlow.use(ResizeNode);
  const lf = new LogicFlow({
    container: document.querySelector('#app'),
    width: 700,
    height: 600,
    tool: {
      menu: true,
      control: true,
    },
    background: {
      color: '#F0F0F0'
    },
    grid: {
      type: 'dot',
      size: 20,
    },
    graphMenuConfig: [
      {
        text: '分享',
        className: 'lf-menu-item',
        callback(graphModel) {
          alert('分享')
        },
      }
    ], 
    style: {
      rect: {
        fill: '#000000'
      }
    },
    // nodeTextDraggable: true,
    edgeTextDraggable: true
  });
  // 方便调试
  window.lf = lf;
  lf.register('user', ({ RectNode, RectNodeModel, h }) => {
    class UserNode extends RectNode {
      getShapeStyle(){
        let style = super.getShapeStyle();
        return {
          ...style,
          stroke: '#18905F',
          fill: 'red',
        }
      }
      getAnchorStyle() {
        return {
          stroke: '#18905F',
          strokeWidth: 2,
        };
      }

    getTextStyle() {
      return {
          fontSize: 12,
          fill: '#FFFFFF',
        };
      }
    }
    class UserModel extends RectNodeModel {
      constructor(data, graphModel) {
        super(data, graphModel);
        const { size } = data.properties;
        this.width = size * 40;
        this.height = size * 40;
        this.fill = 'green';
        this.radius = 0;
        this.menu = [
          {
            text: 'delete',
            className: 'lf-menu-item',
            callback(node) {
              const comfirm = window.confirm('你确定要删除吗？')
              comfirm && lf.deleteNode(node.id)
            },
          },
          {
            text: 'edit',
            className: 'lf-menu-item',
            callback(node) {
              lf.editNodeText(node.id)
            },
          },
          {
            text: 'copy',
            className: 'lf-menu-item',
            callback: function (node) {
              // 自定义User节点带有复制功能
              // 复制的时候，将背复制节点状态设置未选中和不显示菜单模式
              node.setSelected(false);
              const ElementStateDefault = 1;
              node.setElementState(ElementStateDefault);
              const newNode = lf.cloneNode(node.id);
              newNode.setSelected(true);
            },
          },
        ]
      }
    }
    return {
      view: UserNode,
      model: UserModel,
    };
  });
  lf.register('combine', ({ BaseNode, BaseNodeModel, h, mobx }) => {
    class CombineNode extends BaseNode {
      getShape() {
        const attributes = this.getAttributes();
        const { x, y } = attributes;
        const { model } = this.props;
        return h(
          'g',
          {
            transform: `matrix(1 0 0 1 ${x - 25} ${y - 25})`,
          },
          h('path', {
            d: 'm  0,6.65 l  0,36.885245901639344 c  1.639344262295082,8.196721311475411 47.540983606557376,8.196721311475411  49.18032786885246,0 l  0,-36.885245901639344 c -1.639344262295082,-8.196721311475411 -47.540983606557376,-8.196721311475411 -49.18032786885246,0c  1.639344262295082,8.196721311475411 47.540983606557376,8.196721311475411  49.18032786885246,0 m  -49.18032786885246,5.737704918032787c  1.639344262295082,8.196721311475411 47.540983606557376,8.196721311475411 49.18032786885246,0m  -49.18032786885246,5.737704918032787c  1.639344262295082,8.196721311475411 47.540983606557376,8.196721311475411  49.18032786885246,0',
            fill: 'orange',
            strokeWidth: 2,
            stroke: 'red',
            fillOpacity: 0.95,
          })
        )
      }
    }

    class CombineModel extends BaseNodeModel {
      constructor(data) {
        super(data);
        this.width = 50;
        this.height = 60;
        this.fill = 'orange';
      }

      get anchors() {
        return [
          { x: this.x, y: this.y - this.height / 2 },
          { x: this.x + this.width / 2, y: this.y },
          { x: this.x, y: this.y + this.height / 2 },
          { x: this.x - this.width / 2, y: this.y },
        ];
      }
    }

    mobx.decorate(CombineModel, {
      anchors: mobx.computed,
    });

    return {
      view: CombineNode,
      model: CombineModel,
    };
  });
  lf.register('star', ({ PolygonNode, PolygonNodeModel, h, }) => {
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
          [80, 90]
        ];
        this.fill = '#456789';
        this.stroke = this.fill;
      }
    }
    return {
      view: StarNode,
      model: StarModel,
    };
  });
  lf.register('connection', ({LineEdge, LineEdgeModel})=>{
    class Connection extends LineEdge {
      getTextStyle() {
        return {
          background: {
            fill: 'white',
            height: 20,
            stroke: 'transparent',
            radius: 0,
          }
        };
      }
    }
    class ConnnectionModel extends LineEdgeModel {
      constructor(data, graphModel) {
        super(data, graphModel);
      }
    }
    return {
      view: Connection,
      model: ConnnectionModel,
    }
  })
  lf.render({
    nodes: [
      {
        type: 'rect',
        fill: 'yellow',
        x: 300,
        y: 200,
        text: {
          value: '你好',
          x: 300,
          y: 200,
        },
        id: 10,
      },
      {
        type: 'rect-label',
        fill: 'red',
        x: 120,
        y: 200,
        text: {
          value: '你好1111',
          x: 120,
          y: 200,
          draggable: true,
        },
        id: 101,
        properties: {
          moreText: '用户节点'
        }
      },
      {
        type: 'text',
        x: 200,
        y: 400,
        text: {
          x: 200,
          y: 400,
          value: '我是单独的文本节点',
        }
      },
      {
        type: 'polygon',
        x: 200,
        y: 200,
        id: 50,
        text: {
          value: '你好a',
          x: 200,
          y: 200,
        },
      },
      {
        type: 'user',
        x: 500,
        y: 600,
        id: 20,
        fillOpacity: 1,
        text:{
          value: '111',
          x: 500,
          y: 600,
        },
        properties: {
          size: 1
        }
      },
      {
        type: 'user',
        x: 500 * Math.random(),
        y: 600 * Math.random(),
        id: 21,
        properties: {
          size: 2
        }
      },
      {
        type: 'star',
        x: 400,
        y: 300,
        id: 99
      },
      {
        type: 'combine',
        x: 222,
        y: 40,
        id: 30,
      },
      {
        type: 'circle',
        x: 500 * Math.random(),
        y: 600 * Math.random(),
        fill: 'blue',
        id: 40,
      },
    ],
    edges: [
    ],
  });
  lf.createEdge({
    type: 'connection',
    sourceNodeId: 10,
    targetNodeId: 21,
    text: '222',
  });
  lf.createEdge({
    type: 'polyline',
    sourceNodeId: 50,
    targetNodeId: 21,
  });
}