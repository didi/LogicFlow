import React, { Component } from "react";
import './index.css'

type ShapeType = {
  type: string;
  text: string;
};

type IProps = {
  mouseDownHandle: ({
    type,
    text,
  }: ShapeType) => void;
};

type IState = {
  shapeList: ShapeType[];
};

export default class Panel extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
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

  mouseDown({ type, text }: ShapeType) {
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
            <div className="panel-item" key={type}>
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