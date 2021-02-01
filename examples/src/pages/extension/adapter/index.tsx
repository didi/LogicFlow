import React, { useEffect } from 'react';
import LogicFlow from '@logicflow/core';
import { BpmnAdapter, Control, DndPanel } from '@logicflow/extension';
import ExampleHeader from '../../../components/example-header';
import { Button } from 'antd';
import { ExportOutlined } from '@ant-design/icons';

const dndItem = [
  {
    type: 'rect',
    text: '矩形',
  },
  {
    type: 'circle',
    text: '圆形'
  }
]

let lf: LogicFlow;

export default function AdapterExample() {
  useEffect(() => {
    // 注册插件
    LogicFlow.use(BpmnAdapter);
    LogicFlow.use(Control);
    LogicFlow.use(DndPanel);

    lf = new LogicFlow({
      container: document.querySelector('#graph') as HTMLElement,
      stopScrollGraph: true,
      stopZoomGraph: true,
    });
    lf.setShapeList(dndItem);
    lf.render();
  }, []);

  function download(filename: string, text: string) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  function exportAdapterData() {
    const adapterData = lf.getGraphData();
    download('logic-flow.json', JSON.stringify(adapterData));
  }

  return (
    <>
      <ExampleHeader>
        导出 bpmnAdapter 转换后的数据格式：
        <Button
          shape="round"
          icon={<ExportOutlined />}
          onClick={exportAdapterData}
        />
      </ExampleHeader>
      <div id="graph" className="viewport"></div>
    </>
  );
}
