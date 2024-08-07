import React, { useEffect, useRef } from 'react';
import { Button, Card, Divider, Flex } from 'antd';

type ICombineNodeProps = {
  model: CombineModel;
  graphModel: GraphModel;
};

class CombineNode extends BaseNode<ICombineNodeProps> {
  getShape() {
    const { x, y } = this.props.model;
    const { fill } = this.props.model.getNodeStyle();
    return h(
      'g',
      {
        transform: `matrix(1 0 0 1 ${x - 25} ${y - 25})`,
      },
      h('path', {
        d: 'm  0,6.65 l  0,36.885245901639344 c  1.639344262295082,8.196721311475411 47.540983606557376,8.196721311475411  49.18032786885246,0 l  0,-36.885245901639344 c -1.639344262295082,-8.196721311475411 -47.540983606557376,-8.196721311475411 -49.18032786885246,0c  1.639344262295082,8.196721311475411 47.540983606557376,8.196721311475411  49.18032786885246,0 m  -49.18032786885246,5.737704918032787c  1.639344262295082,8.196721311475411 47.540983606557376,8.196721311475411 49.18032786885246,0m  -49.18032786885246,5.737704918032787c  1.639344262295082,8.196721311475411 47.540983606557376,8.196721311475411  49.18032786885246,0',
        fill: fill,
        strokeWidth: 2,
        stroke: 'red',
        fillOpacity: 0.95,
      }),
    );
  }
}

class CombineModel extends BaseNodeModel {
  setAttributes() {
    this.width = 50;
    this.height = 60;
    this.fill = 'orange';

    this.anchorsOffset = [
      [0, -this.height / 2],
      [this.width / 2, 0],
      [0, this.height / 2],
      [-this.width / 2, 0],
    ];
  }
}

const combine = {
  type: 'combine',
  view: CombineNode,
  model: CombineModel,
};

class SquareModel extends RectNodeModel {
  setAttributes() {
    const size = 80;
    const circleOnlyAsTarget = {
      message: '正方形节点下一个节点只能是圆形节点',
      validate: (source?: BaseNodeModel, target?: BaseNodeModel | any) => {
        return target?.type === 'circle'; // 确认上面 target 类型定义
      },
    };

    this.width = size;
    this.height = size;
    this.anchorsOffset = [
      [size / 2, 0],
      [-size / 2, 0],
    ];
    this.sourceRules.push(circleOnlyAsTarget);
  }
}

class SquareView extends RectNode {
  getTextStyle() {
    const { model } = this.props;

    const style = model.getTextStyle();
    const {
      model: { properties = {} },
    } = this.props;
    if (properties.isUsed) {
      style.color = 'red';
    }
    return style;
  }

  // getShape 的返回值是一个通过 h 方法创建的 svg 元素
  getShape() {
    const { x, y, width, height } = this.props.model;
    const { fill, stroke, strokeWidth } = this.props.model.getNodeStyle();
    const attrs = {
      x: x - width / 2,
      y: y - height / 2,
      width,
      height,
      stroke,
      fill,
      strokeWidth,
    };
    // 使用 h 方法创建一个矩形
    return h('g', {}, [
      h('rect', { ...attrs }),
      h(
        'svg',
        {
          x: x - width / 2 + 5,
          y: y - height / 2 + 5,
          width: 25,
          height: 25,
          viewBox: '0 0 1274 1024',
        },
        h('path', {
          fill: stroke,
          d: 'M655.807326 287.35973m-223.989415 0a218.879 218.879 0 1 0 447.978829 0 218.879 218.879 0 1 0-447.978829 0ZM1039.955839 895.482975c-0.490184-212.177424-172.287821-384.030443-384.148513-384.030443-211.862739 0-383.660376 171.85302-384.15056 384.030443L1039.955839 895.482975z',
        }),
      ),
    ]);
  }
}

const square = {
  type: 'square',
  view: SquareView,
  model: SquareModel,
};

class StarModel extends PolygonNodeModel {
  setAttributes() {
    this.points = [
      [45, 0],
      [20, 90],
      [90, 30],
      [0, 30],
      [80, 90],
    ];
    this.fill = '#456789';
    this.stroke = '#456789';
  }
}

const star = {
  type: 'star',
  view: PolygonNode,
  model: StarModel,
};

class UmlModel extends HtmlNodeModel {
  createId() {
    return Math.random() + '_uml';
  }
  setAttributes() {
    const width = 200;
    const height = 130;
    this.width = width;
    this.height = height;
    this.textHeight = 60;
    this.text = {
      ...this.text,
      y: this.y - this.height / 2,
    };

    this.anchorsOffset = [
      {
        x: width / 2,
        y: 0,
        isSourceAnchor: false,
        isTargetAnchor: true,
      },
    ];
    // this.anchorsOffset = [
    //   [width / 2, 0],
    //   [0, height / 2],
    //   [-width / 2, 0],
    //   [0, -height / 2],
    // ]
  }
}

class UmlNode extends HtmlNode {
  setHtml(rootEl: HTMLElement) {
    const { properties } = this.props.model;
    const el = document.createElement('div');
    el.className = 'uml-wrapper';
    const html = `
            <div>
              <div class="uml-head">Head</div>
              <div class="uml-body">
                <div>+ ${properties.name}</div>
                <div>+ ${properties.body}</div>
              </div>
              <div class="uml-footer">
                <div>+ setHead(Head $head)</div>
                <div>+ setBody(Body $body)</div>
              </div>
            </div>
          `;
    el.innerHTML = html;
    rootEl.innerHTML = '';
    rootEl.appendChild(el);
  }
}

const uml = {
  type: 'uml',
  view: UmlNode,
  model: UmlModel,
};

type CustomProperties = {
  size: number;
};

class UserNode extends RectNode {
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
      autoWrap: true,
      lineHeight: 1.5,
      background: {
        fill: '#FF00FF',
        wrapPadding: '10,10',
      },
    };
  }
}

class UserModel extends RectNodeModel {
  setAttributes() {
    const { size } = this.properties as CustomProperties;
    this.width = size * 40;
    this.height = size * 40;
    this.textWidth = 150;
    this.stroke = '#18905F';
    this.fill = 'red';
    this.radius = 10;
    this.text.value = 'id:' + this.id;
  }
}

const user = {
  type: 'user',
  view: UserNode,
  model: UserModel,
};

class ConnectionView extends PolylineEdge {
  getAdjustPointShape(x: number, y: number): h.JSX.Element {
    return h('g', {}, [
      h('image', {
        x: x - 9,
        y: y - 9,
        width: 18,
        height: 18,
        cursor: 'move',
        href: 'data:image/svg+xml;base64,PCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj48c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSIyMnB4IiBoZWlnaHQ9IjIycHgiIHZlcnNpb249IjEuMSI+PGNpcmNsZSBjeD0iMTEiIGN5PSIxMSIgcj0iNyIgc3Ryb2tlPSIjZmZmIiBmaWxsPSIjMjliNmYyIi8+PGNpcmNsZSBjeD0iMTEiIGN5PSIxMSIgcj0iMyIgc3Ryb2tlPSIjZmZmIiBmaWxsPSJ0cmFuc3BhcmVudCIvPjwvc3ZnPg==',
      }),
    ]);
  }

  getTextStyle() {
    return {
      background: {
        fill: 'white',
        height: 20,
        stroke: 'transparent',
        radius: 0,
      },
    };
  }

  getEndArrow() {
    const { model } = this.props;
    const {
      properties: { arrowType },
    } = model;
    const { stroke, strokeWidth } = model.getArrowStyle();
    const pathAttr = {
      stroke,
      strokeWidth,
    };
    // 空心箭头
    if (arrowType === 'empty') {
      return h('path', {
        ...pathAttr,
        fill: '#FFF',
        d: 'M -10 0  -20 -5 -30 0 -20 5 z',
      });
    } else if (arrowType === 'half') {
      // 半箭头
      return h('path', {
        ...pathAttr,
        d: 'M 0 0 -10 5',
      });
    }
    return h('path', {
      ...pathAttr,
      fill: stroke,
      d: 'M 0 0 -10 -5 -10 5 z',
    });
  }
}

class ConnectionModel extends PolylineEdgeModel {
  setAttributes() {
    this.textWidth = 200;
    const { properties } = this;
    if (properties.isActived) {
      this.stroke = 'red';
    }
    if (properties.arrow) {
      this.arrowConfig.markerEnd = (properties.arrow as any).markerEnd; // TODO: 定义 properties 类型
    }
  }

  getArrowStyle() {
    const style = super.getArrowStyle();
    style.stroke = 'green';
    return style;
  }
}

const connection = {
  type: 'connection',
  view: ConnectionView,
  model: ConnectionModel,
};

class AnimationEdge extends BezierEdge {}

class AnimationEdgeModel extends BezierEdgeModel {
  getEdgeAnimationStyle() {
    const style = super.getEdgeAnimationStyle();
    style.stroke = 'blue';
    style.animationDuration = '30s';
    style.animationDirection = 'reverse';
    return style;
  }
}

const animation = {
  type: 'animation-edge',
  view: AnimationEdge,
  model: AnimationEdgeModel,
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
    // 下面的 style 移动到此处，不然会覆盖上面设置的各图形的主题样式
    inputText: {
      background: 'black',
      color: 'white',
    },
  },
};

const customTheme: Partial<LogicFlow.Theme> = {
  baseNode: {
    stroke: '#4E93F5',
  },
  nodeText: {
    overflowMode: 'ellipsis',
    lineHeight: 1.5,
    fontSize: 13,
  },
  edgeText: {
    overflowMode: 'ellipsis',
    lineHeight: 1.5,
    fontSize: 13,
    textWidth: 100,
  }, // 确认 textWidth 是否必传 ❓
  polyline: {
    stroke: 'red',
  },
  rect: {
    width: 200,
    height: 40,
  },
  arrow: {
    offset: 4, // 箭头长度
    verticalLength: 2, // 箭头垂直于边的距离
  },
};

// 画布元素
const graphData = {
  nodes: [
    {
      id: 'custom-node-1',
      rotate: 1.1722738811284763,
      text: {
        x: 600,
        y: 200,
        value: 'node-1',
      },
      type: 'rect',
      x: 600,
      y: 200,
      properties: {
        width: 80,
        height: 120,
        style: {
          radius: 20,
        },
      },
    },
    {
      id: 'custom-node-2',
      text: 'node-2',
      type: 'polygon',
      x: 90,
      y: 94,
    },
  ],
};

const App: React.FC = () => {
  const lfRef = useRef<LogicFlow>();
  const containerRef = useRef<HTMLDivElement>(null);

  const registerElements = (lf: LogicFlow) => {
    const elements: LogicFlow.RegisterConfig[] = [
      // edges
      animation,
      connection,
      // nodes
      combine,
      square,
      star,
      uml,
      user,
    ];

    elements.forEach((customElement) => {
      lf.register(customElement as LogicFlow.RegisterConfig);
    });
  };
  const registerEvents = (lf: LogicFlow) => {
    lf.on('history:change', () => {
      const data = lf.getGraphData();
      console.log('history:change', data);
    });
  };

  useEffect(() => {
    if (!lfRef.current) {
      const lf = new LogicFlow({
        ...config,
        container: containerRef.current as HTMLElement,
        // hideAnchors: true,
        height: 400,
        // adjustNodePosition: false,
        // isSilentMode: true,
        // overlapMode: 1,
        // hoverOutline: false,
        // nodeSelectedOutline: false,
        multipleSelectKey: 'shift',
        disabledTools: ['multipleSelect'],
        autoExpand: true,
        // metaKeyMultipleSelected: false,
        // adjustEdgeMiddle: true,
        // stopMoveGraph: true,
        adjustEdgeStartAndEnd: true,
        // adjustEdge: false,
        allowRotate: true,
        // allowResize: true,
        edgeTextEdit: true,
        keyboard: {
          enabled: true,
          // shortcuts: [
          //   {
          //     keys: ["backspace"],
          //     callback: () => {
          //       const r = window.confirm("确定要删除吗？");
          //       if (r) {
          //         const elements = lf.getSelectElements(true);
          //         lf.clearSelectElements();
          //         elements.edges.forEach((edge) => lf.deleteEdge(edge.id));
          //         elements.nodes.forEach((node) => lf.deleteNode(node.id));
          //         const graphData = lf.getGraphData()
          //         console.log(42, graphData, graphData.nodes.length)
          //       }
          //     }
          //   }
          // ]
        },
        partial: true,
        background: {
          color: '#FFFFFF',
        },
        grid: true,
        // grid: {
        //   size: 1,
        // },
        edgeTextDraggable: true,
        edgeType: 'bezier',
        // 全局自定义id
        // edgeGenerator: (sourceNode, targetNode, currentEdge) => {
        //   // 起始节点类型 rect 时使用 自定义的边 custom-edge
        //   if (sourceNode.type === 'rect') return 'bezier'
        //   if (currentEdge) return currentEdge.type
        //   return 'polyline'
        // },
        idGenerator(type) {
          return type + '_' + Math.random();
        },
      });

      lf.setTheme(customTheme);
      // 注册节点 or 边
      registerElements(lf);
      // 注册事件
      registerEvents(lf);

      lf.render(graphData);
      lfRef.current = lf;
      (window as any).lf = lf;
    }
  }, []);

  const setArrow = (arrowName: string) => {
    const lf = lfRef.current;
    if (lf) {
      const { edges } = lf.getSelectElements();
      edges.forEach(({ id, properties }) => {
        console.log(4444, properties);
        lf.setProperties(id, {
          arrowType: arrowName,
        });
      });
    }
  };

  const focusOn = () => {
    lfRef?.current?.focusOn({
      id: 'custom-node-1',
    });
  };

  const handleChangeNodeType = () => {
    const lf = lfRef.current;
    if (lf) {
      const { nodes } = lf.getSelectElements();
      nodes.forEach(({ id, type }) => {
        lf.setNodeType(id, type === 'rect' ? 'star' : 'rect');
      });
    }
  };

  const handleChangeEditConfig = () => {
    const isSilentMode = lfRef.current?.options.isSilentMode;
    lfRef?.current?.updateEditConfig({
      isSilentMode: !isSilentMode,
    });
  };

  const handleCancelEdit = () =>
    lfRef?.current?.graphModel.textEditElement?.setElementState(
      ElementState.DEFAULT,
    );

  const handleChangeId = () => {
    const lf = lfRef.current;
    if (lf) {
      const { edges } = lf.getSelectElements();
      edges.forEach(({ id }) => {
        lf.setEdgeId(id, 'newId');
      });
    }
  };

  const handleRefreshGraph = () => {
    const lf = lfRef.current;
    if (lf) {
      const data = lf.getGraphRawData();
      console.log('current graph data', data);
      const refreshData = LogicFlowUtil.refreshGraphId(data);
      console.log('after refresh graphId', data);
      lf.render(refreshData);
    }
  };

  const handleActiveElements = () => {
    const lf = lfRef.current;
    if (lf) {
      const { nodes, edges } = lf.getSelectElements();
      nodes.forEach(({ id }) => {
        lf.setProperties(id, {
          isHovered: true,
        });
      });
      edges.forEach(({ id }) => {
        lf.setProperties(id, {
          isHovered: true,
        });
      });
    }
  };

  const handleTurnAnimationOn = () => {
    if (lfRef.current) {
      const { edges } = lfRef.current.getGraphData() as GraphData;
      edges.forEach((edge) => {
        lfRef.current?.openEdgeAnimation(edge.id);
      });
    }
  };
  const handleTurnAnimationOff = () => {
    if (lfRef.current) {
      const { edges } = lfRef.current.getGraphData() as GraphData;
      edges.forEach((edge) => {
        lfRef.current?.closeEdgeAnimation(edge.id);
      });
    }
  };

  const handleDragItem = (node: OnDragNodeConfig) => {
    lfRef?.current?.dnd.startDrag(node);
  };

  return (
    <Card title="Graph">
      <Flex wrap="wrap" gap="small">
        <Button key="arrow1" type="primary" onClick={() => setArrow('half')}>
          箭头 1
        </Button>
        <Button key="arrow2" type="primary" onClick={() => setArrow('empty')}>
          箭头 2
        </Button>
        <Button key="focusOn" type="primary" onClick={focusOn}>
          定位到五角星
        </Button>
        <Button
          key="undo"
          type="primary"
          onClick={() => lfRef?.current?.undo()}
        >
          上一步
        </Button>
        <Button
          key="redo"
          type="primary"
          onClick={() => lfRef?.current?.redo()}
        >
          下一步
        </Button>
        <Button
          key="clearData"
          type="primary"
          onClick={() => lfRef?.current?.clearData()}
        >
          清空数据
        </Button>
        <Button key="changeType" type="primary" onClick={handleChangeNodeType}>
          切换节点为五角星
        </Button>
        <Button
          key="changeConfig"
          type="primary"
          onClick={handleChangeEditConfig}
        >
          修改配置
        </Button>
        <Button key="cancelEdit" type="primary" onClick={handleCancelEdit}>
          取消编辑
        </Button>
        <Button key="changeEdgeId" type="primary" onClick={handleChangeId}>
          修改边 ID
        </Button>
      </Flex>
      <Divider orientation="left" orientationMargin="5" plain></Divider>
      <Flex wrap="wrap" gap="small">
        <Button
          key="getData"
          type="primary"
          onClick={() => console.log(lfRef?.current?.getGraphData())}
        >
          获取数据
        </Button>
        <Button
          key="getRefreshData"
          type="primary"
          onClick={handleRefreshGraph}
        >
          属性流程图节点 ID
        </Button>
        <Button
          key="setProperties"
          type="primary"
          onClick={handleActiveElements}
        >
          设置属性
        </Button>
        <Button
          key="setZoom"
          type="primary"
          onClick={() => lfRef.current?.zoom(0.6, [400, 400])}
        >
          设置大小
        </Button>
        <Button
          key="selectElement"
          type="primary"
          onClick={() => lfRef.current?.selectElementById('custom-node-1')}
        >
          选中指定节点
        </Button>
        <Button key="triggerLine" type="primary">
          触发边
        </Button>
        <Button
          key="translateCenter"
          type="primary"
          onClick={() => lfRef.current?.translateCenter()}
        >
          居中
        </Button>
        <Button
          key="fitView"
          type="primary"
          onClick={() => lfRef.current?.fitView()}
        >
          适应屏幕
        </Button>
        <Button key="getNodeEdges" type="primary" onClick={() => {}}>
          获取节点所有的边
        </Button>
        <Button
          key="openEdgeAnimation"
          type="primary"
          onClick={handleTurnAnimationOn}
        >
          开启边动画
        </Button>
        <Button
          key="closeEdgeAnimation"
          type="primary"
          onClick={handleTurnAnimationOff}
        >
          关闭边动画
        </Button>
        <Button key="showCanvas" type="primary">
          显示流程图
        </Button>
        <Button
          key="deleteNode"
          type="primary"
          onClick={() => lfRef.current?.deleteNode('custom-node-1')}
        >
          删除节点
        </Button>
      </Flex>
      <Divider orientation="left" orientationMargin="5" plain>
        节点面板
      </Divider>
      <Flex wrap="wrap" gap="small" justify="center" align="center">
        <div
          className="dnd-item wrapper"
          onMouseDown={() =>
            handleDragItem({
              type: 'rect',
              text: 'rect',
            })
          }
        >
          rect
        </div>
        <div
          className="dnd-item wrapper"
          onMouseDown={() => {
            handleDragItem({
              type: 'circle',
              text: 'circle',
            });
          }}
        >
          circle
        </div>
        <div
          className="dnd-item wrapper"
          onMouseDown={() => {
            handleDragItem({
              type: 'diamond',
              text: 'diamond',
            });
          }}
        >
          diamond
        </div>
        <div
          className="dnd-item wrapper"
          onMouseDown={() => {
            handleDragItem({
              type: 'ellipse',
              text: 'ellipse',
              properties: {
                rx: 40,
                ry: 80,
              },
            });
          }}
        >
          ellipse
        </div>
        <div
          className="dnd-item wrapper"
          onMouseDown={() => {
            handleDragItem({
              type: 'html',
              text: 'html',
            });
          }}
        >
          html
        </div>
        <div
          className="dnd-item wrapper"
          onMouseDown={() => {
            handleDragItem({
              type: 'polygon',
              text: 'polygon',
              properties: {
                width: 110,
                height: 100,
                style: {
                  fill: '#ffd591',
                  stroke: '#ffa940',
                  strokeWidth: 2,
                  fillRule: 'evenodd',
                },
              },
            });
          }}
        >
          polygon
        </div>
        <div
          className="dnd-item text"
          onMouseDown={() => {
            handleDragItem({
              type: 'text',
              text: '文本',
            });
          }}
        >
          文本
        </div>
      </Flex>
      <Divider />
      <div ref={containerRef} id="graph"></div>
    </Card>
  );
};

root.render(<App></App>);

insertCss(`
#container {
  overflow: auto;
}

*:focus {
  outline: none;
}

.dnd-item {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  user-select: none;
}

.wrapper {
  width: 80px;
  height: 50px;
  background: #fff;
  border: 2px solid #000;
}

.uml-wrapper {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  background: rgb(255 242 204);
  border: 1px solid rgb(214 182 86);
  border-radius: 10px;
}

.uml-head {
  font-weight: bold;
  font-size: 16px;
  line-height: 30px;
  text-align: center;
}

.uml-body {
  padding: 5px 10px;
  font-size: 12px;
  border-top: 1px solid rgb(214 182 86);
  border-bottom: 1px solid rgb(214 182 86);
}

.uml-footer {
  padding: 5px 10px;
  font-size: 14px;
}

/* 输入框字体大小和设置的大小保持一致，自动换行输入和展示保持一致 */
.lf-text-input {
  font-size: 12px;
}

.buttons {
  position: absolute;
  z-index: 1;
}

.button-list {
  display: flex;
  align-items: center;
}
`);
