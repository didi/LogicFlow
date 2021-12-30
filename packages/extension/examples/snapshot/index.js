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
        <style>
          .uml-wrapper {
            background: #68FCE2;
            width: 100%;
            height: 100%;
            border-radius: 10px;
            border: 2px solid #838382;
            box-sizing: border-box;
          }
          .uml-head {
            text-align: center;
            line-height: 30px;
            font-size: 16px;
            font-weight: bold;
          }
          .uml-body {
            border-top: 1px solid #838382;
            border-bottom: 1px solid #838382;
            padding: 5px 10px;
            font-size: 12px;
          }
          .uml-footer {
            padding: 5px 10px;
            font-size: 14px;
          }
        </style>
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
        id: 10,
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