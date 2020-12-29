import React from 'react';
import LogicFlow from '@logicflow/core/types/LogicFlow';

const downloadImg = require('./img/download.png').default;
const photo = require('./img/img.png').default;
const uploadImg = require('./img/upload.png').default;

type IProps = {
  lf: LogicFlow
}

function download(filename: string, text: string) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

type FileEventTarget = EventTarget & { files: FileList };

export default function BpmnIo(props: IProps) {
  const { lf } = props;
  function downloadXml() {
    const data = lf.getGraphData() as string;
    // console.log(xml);
    console.log(data);
    download('logic-flow.xml', data);
  }
  function uploadXml(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = (ev.target as FileEventTarget).files[0];
    const reader = new FileReader()
    reader.onload = (event: ProgressEvent<FileReader>) => {
      if (event.target) {
        const xml = event.target.result as string;
        lf.render(xml);
      }
    }
    reader.readAsText(file); // you could also read images and other binaries
  }
  return (
    <div className="graph-io">
      <span
        title="下载 XML"
        onMouseDown={() => downloadXml()}
      >
        <img src={downloadImg} alt="下载XML" />
      </span>
      <span
        id="download-img"
        title="下载图片"
      >
        <img src={photo} alt="下载图片" />
      </span>
      <span
        id="upload-xml"
        title="上传 XML"
      >
        <input type="file" className="upload" onChange={(ev) => uploadXml(ev)} />
        <img src={uploadImg} alt="上传 XML" />
      </span>
    </div>
  );
}