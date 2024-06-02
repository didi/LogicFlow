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
      color: '#F0F0F0',
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
          alert('分享');
        },
      },
    ],
    // nodeTextDraggable: true,
    edgeTextDraggable: true,
  });
  const lf1 = new LogicFlow({
    container: document.querySelector('#app1'),
    width: 700,
    height: 300,
    tool: {
      menu: true,
      control: true,
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
          alert('分享');
        },
      },
    ],
    // nodeTextDraggable: true,
    edgeTextDraggable: true,
  });
    // 方便调试
  window.lf = lf;
  window.lf1 = lf1;
  lf.setTheme({
    nodeText: {
      color: '#000000',
      overflowMode: 'autoWrap',
      lineHeight: 1.2,
      fontSize: 14,
    },
  });
  class UserModel extends RectNodeModel {
  }
  class UserNode extends RectNode {
  }
  class UmlModel extends HtmlNodeModel {
    setAttributes() {
      const width = 200;
      const height = 280;
      this.width = width;
      this.height = height;
      const { properties } = this;
      this.anchorsOffset = [
        [width / 2, 0],
        [0, height / 2],
        [-width / 2, 0],
        [0, -height / 2],
      ];
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
              <div class="uml-body" style="width: 100px;height: 100px;background: url(https://cdn.jsdelivr.net/gh/towersxu/cdn@master/material/funny/%E6%88%90%E7%86%9F.jpg);background-size: cover;">
              <div>+ ${properties.name}</div>
              <div>+ ${properties.body}</div>
              </div>
              <div class="uml-footer demo1">
              <div>+ setHead(Head $head)</div>
              <div>+ setBody(Body $body)</div>
              </div>
              <img src="https://cdn.jsdelivr.net/gh/towersxu/cdn@master/material/funny/%E6%88%90%E7%86%9F.jpg" style="width: 50px;height: 50px;" />
            </div>
          `;
      el.innerHTML = html;
      rootEl.innerHTML = '';
      rootEl.appendChild(el);
    }
  }

  class ImageModel extends RectNodeModel {
    initNodeData(data) {
      super.initNodeData(data);
      this.width = 80;
      this.height = 60;
    }
  }

  class ImageNode extends RectNode {
    getImageHref() {
      return 'https://cdn.jsdelivr.net/gh/towersxu/cdn@master/material/funny/%E6%88%90%E7%86%9F.jpg';
    }
    getShape() {
      const { x, y, width, height } = this.props.model;
      const href = this.getImageHref();
      const attrs = {
        x: x - (1 / 2) * width,
        y: y - (1 / 2) * height,
        width,
        height,
        href,
        // 根据宽高缩放
        preserveAspectRatio: 'none meet',
      };
      return h('g', {}, [h('image', { ...attrs })]);
    }
  }

  lf.register({
    type: 'uml',
    view: UmlNode,
    model: UmlModel,
  });
  lf.register({
    type: 'user',
    view: UserNode,
    model: UserModel,
  });
  lf.register({
    type: 'image',
    view: ImageNode,
    model: ImageModel,
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
          body: '哈哈哈哈',
        },
      },
      {
        type: 'image',
        x: 300,
        y: 100,
        id: 110,
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
      },
    ],
    edges: [
      {
        type: 'polyline',
        sourceNodeId: 10,
        targetNodeId: 11,
      },
    ],
  });
  lf.extension.snapshot.useGlobalRules = false;
  lf.extension.snapshot.customCssRules = `
      .lf-node-text-auto-wrap-content{
        line-height: 1.2;
        background: transparent;
        text-align: center;
        word-break: break-all;
        width: 100%;
      }
      .lf-canvas-overlay {
        background: red;
      }
    `;
  lf1.register({
    type: 'uml',
    view: UmlNode,
    model: UmlModel,
  });
  lf1.register({
    type: 'user',
    view: UserNode,
    model: UserModel,
  });
  lf1.render({
    nodes: [
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
      },
    ],
  });
  lf1.extension.snapshot.useGlobalRules = false;
  lf1.extension.snapshot.customCssRules = `
      .lf-node-text-auto-wrap-content{
        line-height: 1.2;
        background: transparent;
        text-align: center;
        word-break: break-all;
        width: 100%;
      }
      .lf-canvas-overlay {
        background: red;
      }
    `;
};
document.getElementById('download').addEventListener('click', () => {
  lf.getSnapshot();
});
document.getElementById('download1').addEventListener('click', () => {
  lf1.getSnapshot();
});
document.getElementById('preview').addEventListener('click', () => {
  lf.getSnapshotBlob('#FFFFFF').then(({ data, width, height }) => {
    document.getElementById('img').src = img.src = window.URL.createObjectURL(data);
    console.log(width, height);
  });
});
document.getElementById('base64').addEventListener('click', () => {
  lf.getSnapshotBase64().then(({ data, width, height }) => {
    document.getElementById('img').src = data;
    console.log(width, height);
  });
});

document.querySelector('#downloadXml').addEventListener('click', () => {
  const data = lf.getGraphData();
  console.log(lfJson2Xml(data));
  download('logicflow.xml', lfJson2Xml(data));
});

function download(filename, text) {
  const element = document.createElement('a');
  element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`);
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}
