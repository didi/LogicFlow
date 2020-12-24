import { Component, h } from 'preact';

type IProps = {
  mouseDownHandle: ({
    type,
    text,
  }) => void,
};

type ShapeType = {
  type: string;
  text: string;
};

type IState = {
  shapeList: ShapeType[]
};

export default class Panel extends Component<IProps, IState> {
  constructor() {
    super();
    this.state = {
      shapeList: [
        {
          type: 'circle',
          text: '圆形',
        },
        {
          type: 'rect',
          text: '矩形',
        },
        {
          type: 'polygon',
          text: '菱形',
        },
        {
          type: 'star',
          text: '五角星',
        },
        // {
        //   type: 'ellipse',
        //   text: '椭圆',
        // },
        {
          type: 'triangle',
          text: '三角形',
        },
        {
          type: 'hexagon',
          text: '六边形',
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
      <div className="panel">
        {shapeList.map(shape => {
          const { type, text } = shape;
          return (
            <div className="panel-item">
              <div
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
