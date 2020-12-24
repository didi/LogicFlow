# 拖拽 Dnd

> 在流程图编辑场景中比起通过代码配置注册节点以外，我们可能更需要通过图形用户界面来操作创建流程图，这时候就可以通过拖拽的方式来实现。

拖拽需要结合图形面板来实现，步骤：创建面板 → 拖拽初始化 → 监听drop事件创建节点

示例如下：

```js
// 顶层App组件，渲染画布，对图形面板绑定拖拽事件
export default class App extends Component<IProps, IState> {
  lf: LogicFlow;
  componentDidMount() {
    this.lf = new LogicFlow({
      container: document.querySelector('#graph'),
      width: 700,
      height: 600,
      tool: {
        menu: true,
        control: false,
      },
    });
    this.lf.render();
  }
  mouseDownHandle = config => {
    this.lf.dnd.startDrag(config);
  };
  render() {
    return (
      <div className="designer">
        <Panel mouseDownHandle={this.mouseDownHandle} />
        <div
          className="viewport"
          id="graph"
        />
      </div>
    );
  }
}
// Panel组件
export default class Panel extends Component<IProps, IState> {
  constructor() {
    super();
    this.state = {
      shapeList: [
        {
          type: 'rect',
          text: '矩形',
        },
        {
          type: 'circle',
          text: '圆形',
        },
      ],
    };
  }
  mouseDown({ type, text }) {
    const { mouseDownHandle } = this.props;
    mouseDownHandle({
      type,
      text,
    });
  }
  render() {
    const { shapeList } = this.state;
    return (
      <div>
        {shapeList.map(shape => {
          const { type, text } = shape;
          return (
            <div className="panel-item">
              <div
                draggable={true}
                className={`panel-${type}`}
                onMouseDown={() => { this.mouseDown(shape); }}
              />
              <span>{text}</span>
            </div>
          );
        })}
      </div>
    );
  }
}

```

<example :height="350" ></example>

通过上面的代码可以看出，将图形面板中的图形`div`设置属性`draggable = true`，当拖拽图形时，会触发`lf.dnd.startDrag`函数，表示开始拖拽，并传入选中图形的配置，`startDrag`入参格式：

```js
startDrag(nodeConfig: NodeConfig):void

type NodeConfig = {
  id?: string;
  type: string;
  x: number;
  y: number;
  text?: TextConfig;
  properties?: Record<string, unknown>;
};
```

拖拽结束鼠标松开时，将当前鼠标的位置转换为画布上的坐标，并以此为节点的中心点坐标`x`、`y`，合并拖拽节点传入的`nodeConfig`，监听到drop事件后会调用`lf.addNode`方法创建节点。
