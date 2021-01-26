import React, { ReactElement } from 'react';
import LogicFlow from '@logicflow/core';

type DndItem = {
  type: string;
  text: string;
}

const dndItem: DndItem[] = [
  {
    type: 'circle',
    text: '圆形',
  },
  {
    type: 'rect',
    text: '矩形',
  },
];

type IProps = {
  lf: LogicFlow;
}

export default function DndTool(props: IProps): ReactElement {
  function mouseDown(shape: DndItem) {
    const { lf } = props;
    lf.dnd.startDrag(shape);
  }
  return (
    <div className="panel">
      {dndItem.map(shape => {
        const { type, text } = shape;
        return (
          <div className="panel-item">
            <div
              className={`panel-${type}`}
              onMouseDown={() => { mouseDown(shape); }}
            />
            <span>{text}</span>
          </div>
        );
      })}
    </div>
  );
}
