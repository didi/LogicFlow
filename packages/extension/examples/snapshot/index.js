window.onload = function () {
  LogicFlow.use(Snapshot);
  const lf = new LogicFlow({
    container: document.querySelector('#app'),
    width: 700,
    height: 300,
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
    // nodeTextDraggable: true,
    edgeTextDraggable: true
  });
  // 方便调试
  window.lf = lf;
  lf.setTheme({
    nodeText: {
      color: '#000000',
      overflowMode: 'autoWrap',
      lineHeight: 1.2,
      fontSize: 14,
    },
  })
  class UserModel extends RectNodeModel {
  }
  class UserNode extends RectNode {
  }
  class UmlModel extends HtmlNodeModel {
    setAttributes() {
      const width = 200;
      const height = 130;
      this.width = width;
      this.height = height;
      const properties = this.properties;
      this.anchorsOffset = [
        [width / 2, 0],
        [0, height / 2],
        [-width / 2, 0],
        [0, -height/2],
      ]
    }
  }
  class UmlNode extends HtmlNode {
    setHtml(rootEl) {
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
      `
      el.innerHTML = html;
      rootEl.innerHTML = '';
      rootEl.appendChild(el);
    }
  }
  lf.register({
    type: 'uml',
    view: UmlNode,
    model: UmlModel,
  })
  lf.register({
    type: 'user',
    view: UserNode,
    model: UserModel,
  });
  lf.render({
    nodes: [
      {
        type: 'uml',
        x: 100,
        y: 100,
        id: 100,
        properties: {
          name: 'haod',
          body: '哈哈哈哈'
        }
      },
      {
        type: 'rect',
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
        type: 'rect',
        x: 500,
        y: 300,
        text: {
          value: '你好2',
          x: 500,
          y: 300,
        },
        id: 11,
      },
      {
        type: 'rect',
        x: 700,
        y: 300,
        text: {
          value: '你好3',
          x: 700,
          y: 300,
        },
        id: 12,
      }
    ],
    edges: [
      {
        type: 'polyline',
        sourceNodeId: 10,
        targetNodeId: 11
      }
    ],
  });
}
document.getElementById('download').addEventListener('click', () => {
  lf.getSnapshot()
})
document.getElementById('preview').addEventListener('click', () => {
  lf.getSnapshotBlob('#FFFFFF').then(({data, width, height})=> {
    document.getElementById('img').src = img.src = window.URL.createObjectURL(data);
    console.log(width, height)
  })
})
document.getElementById('base64').addEventListener('click', () => {
  lf.getSnapshotBase64().then(({data, width, height}) => {
    document.getElementById('img').src = data;
    console.log(width, height)
  })
})

document.querySelector("#downloadXml").addEventListener("click", () => {
  const data = lf.getGraphData();
  console.log(lfJson2Xml(data));
  download('logicflow.xml', lfJson2Xml(data));
})

function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}
