import React, { useEffect, useState } from 'react';
import LogicFlow from '@logicflow/core';
import ExampleHeader from '../../../components/example-header';
import { createListener, ListenerType } from './listener';

const config = {
  stopScrollGraph: true,
  stopZoomGraph: true,
  textEdit: false,
  tool: {
    control: false,
  }
};

const data = {
  nodes: [
    {
      id: 10,
      type: 'rect',
      x: 150,
      y: 80,
      text: '矩形'
    },
    {
      id: 20,
      type: 'circle',
      x: 400,
      y: 80,
      text: '圆形'
    }
  ],
  edges: [
    {
      type: 'line',
      sourceNodeId: 10,
      targetNodeId: 20,
      text: '连线',
      endPoint: {
        id: '150-60',
        x: 350,
        y: 80
      }
    }
  ]
};

let lf: LogicFlow;

export default function EventExample() {
  const [event, setEvent] = useState<string>('');
  const [element, setElement] = useState<string>('');

  useEffect(() => {
    lf = new LogicFlow({
      ...config,
      container: document.querySelector('#graph') as HTMLElement
    });
    // 为 lf 创建部分监听器
    createListener(lf, ({ data, e }: ListenerType) => {
      setEvent(e.type);
      setElement(data.type);
    });
    lf.render(data);
  }, []);

  return (
    <>
      <ExampleHeader>
        拖拽或点击元素查看触发事件：{event ? `${event}-${element}` : ''}
      </ExampleHeader>
      <div id="graph" className="viewport" />
    </>
  )
}
