import React, { useEffect, useRef, useState } from 'react';
import {
  Button,
  Col,
  Divider,
  Flex,
  Row,
  Space,
  Select,
  Input,
  InputNumber,
  Switch,
} from 'antd';

const { Snapshot, DndPanel } = Extension;

class ImageModel extends RectNodeModel {
  initNodeData(data: any) {
    super.initNodeData(data);
    this.width = 80;
    this.height = 60;
  }
}

class ImageNode extends RectNode {
  getImageHref() {
    return 'https://dpubstatic.udache.com/static/dpubimg/0oqFX1nvbD/cloud.png';
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

const imageNode = {
  type: 'image',
  view: ImageNode,
  model: ImageModel,
};

type CustomProperties = {
  // 形状属性
  width?: number;
  height?: number;
  radius?: number;

  // 样式属性
  style?: LogicFlow.CommonTheme;
  textStyle?: LogicFlow.TextNodeTheme;
};

class CustomHtmlNode extends HtmlNode {
  setHtml(rootEl: HTMLElement) {
    const { properties } = this.props.model;

    const el = document.createElement('div');
    el.className = 'uml-wrapper';
    el.innerHTML = `
      <div>
        <div class="uml-head">Head</div>
        <div class="uml-body">
          <div><button class="uml-btn" onclick="setData()">+</button> ${properties.name}</div>
          <div>${properties.body}</div>
        </div>
        <div class="uml-footer">
          <div>setHead(Head $head)</div>
          <div>setBody(Body $body)</div>
        </div>
      </div>
    `;
    rootEl.innerHTML = '';
    rootEl.appendChild(el);

    // @ts-ignore
    window.setData = () => {
      const { graphModel, model } = this.props;
      graphModel.eventCenter.emit('custom:button-click', model);
    };
  }
}

class CustomHtmlNodeModel extends HtmlNodeModel {
  setAttributes() {
    console.log('this.properties', this.properties);
    const { width, height, radius } = this.properties as CustomProperties;
    this.width = width || 300;
    this.height = height || 150;
    this.text.editable = false;
    if (radius) {
      this.radius = radius;
    }
  }
}

const customHtml = {
  type: 'customHtml',
  view: CustomHtmlNode,
  model: CustomHtmlNodeModel,
};

const data = {
  nodes: [
    {
      type: 'customHtml',
      x: 0,
      y: 50,
      id: 'uml_1',
      properties: {
        name: 'hello',
        body: '哈哈哈哈',
      },
    },
    {
      id: 'rect_1',
      type: 'rect',
      x: 300,
      y: 0,
      text: '你好1',
    },
    {
      id: 'rect_2',
      type: 'rect',
      x: 500,
      y: 0,
      text: '你好2',
    },
    {
      id: '3',
      type: 'image',
      x: 300,
      y: 100,
      text: '云',
    },
    {
      id: '5',
      type: 'image',
      x: 500,
      y: 100,
      text: '菱形',
    },
  ],
  edges: [
    {
      id: 'polyline_1',
      type: 'polyline',
      sourceNodeId: 'rect_1',
      targetNodeId: 'rect_2',
    },
    {
      id: 'e_3',
      type: 'polyline',
      sourceNodeId: '3',
      targetNodeId: '5',
    },
  ],
};

const circleSvgUrl =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAAH6ji2bAAAABGdBTUEAALGPC/xhBQAAAnBJREFUOBGdVL1rU1EcPfdGBddmaZLiEhdx1MHZQXApraCzQ7GKLgoRBxMfcRELuihWKcXFRcEWF8HBf0DdDCKYRZpnl7p0svLe9Zzbd29eQhTbC8nv+9zf130AT63jvooOGS8Vf9Nt5zxba7sXQwODfkWpkbjTQfCGUd9gIp3uuPP8bZ946g56dYQvnBg+b1HB8VIQmMFrazKcKSvFW2dQTxJnJdQ77urmXWOMBCmXM2Rke4S7UAW+/8ywwFoewmBps2tu7mbTdp8VMOkIRAkKfrVawalJTtIliclFbaOBqa0M2xImHeVIfd/nKAfVq/LGnPss5Kh00VEdSzfwnBXPUpmykNss4lUI9C1ga+8PNrBD5YeqRY2Zz8PhjooIbfJXjowvQJBqkmEkVnktWhwu2SM7SMx7Cj0N9IC0oQXRo8xwAGzQms+xrB/nNSUWVveI48ayrFGyC2+E2C+aWrZHXvOuz+CiV6iycWe1Rd1Q6+QUG07nb5SbPrL4426d+9E1axKjY3AoRrlEeSQo2Eu0T6BWAAr6COhTcWjRaYfKG5csnvytvUr/WY4rrPMB53Uo7jZRjXaG6/CFfNMaXEu75nG47X+oepU7PKJvvzGDY1YLSKHJrK7vFUwXKkaxwhCW3u+sDFMVrIju54RYYbFKpALZAo7sB6wcKyyrd+aBMryMT2gPyD6GsQoRFkGHr14TthZni9ck0z+Pnmee460mHXbRAypKNy3nuMdrWgVKj8YVV8E7PSzp1BZ9SJnJAsXdryw/h5ctboUVi4AFiCd+lQaYMw5z3LGTBKjLQOeUF35k89f58Vv/tGh+l+PE/wG0rgfIUbZK5AAAAABJRU5ErkJggg==';

const rectSvgUrl =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAATCAYAAAEFVwZaAAAABGdBTUEAALGPC/xhBQAAAqlJREFUOBF9VM9rE0EUfrMJNUKLihGbpLGtaCOIR8VjQMGDePCgCCIiCNqzCAp2MyYUCXhUtF5E0D+g1t48qAd7CCLqQUQKEWkStcEfVGlLdp/fm3aW2QQdyLzf33zz5m2IsAZ9XhDpyaaIZkTS4ASzK41TFao88GuJ3hsr2pAbipHxuSYyKRugagICGANkfFnNh3HeE2N0b3nN2cgnpcictw5veJIzxmDamSlxxQZicq/mflxhbaH8BLRbuRwNtZp0JAhoplVRUdzmCe/vO27wFuuA3S5qXruGdboy5/PRGFsbFGKo/haRtQHIrM83bVeTrOgNhZReWaYGnE4aUQgTJNvijJFF4jQ8BxJE5xfKatZWmZcTQ+BVgh7s8SgPlCkcec4mGTmieTP4xd7PcpIEg1TX6gdeLW8rTVMVLVvb7ctXoH0Cydl2QOPJBG21STE5OsnbweVYzAnD3A7PVILuY0yiiyDwSm2g441r6rMSgp6iK42yqroI2QoXeJVeA+YeZSa47gZdXaZWQKTrG93rukk/l2Al6Kzh5AZEl7dDQy+JjgFahQjRopSxPbrbvK7GRe9ePWBo1wcU7sYrFZtavXALwGw/7Dnc50urrHJuTPSoO2IMV3gUQGNg87IbSOIY9BpiT9HV7FCZ94nPXb3MSnwHn/FFFE1vG6DTby+r31KAkUktB3Qf6ikUPWxW1BkXSPQeMHHiW0+HAd2GelJsZz1OJegCxqzl+CLVHa/IibuHeJ1HAKzhuDR+ymNaRFM+4jU6UWKXorRmbyqkq/D76FffevwdCp+jN3UAN/C9JRVTDuOxC/oh+EdMnqIOrlYteKSfadVRGLJFJPSB/ti/6K8f0CNymg/iH2gO/f0DwE0yjAFO6l8JaR5j0VPwPwfaYHqOqrCI319WzwhwzNW/aQAAAABJRU5ErkJggg==';

const config: Partial<LogicFlow.Options> = {
  style: {
    rect: {
      rx: 5,
      ry: 5,
      strokeWidth: 2,
    },
    circle: {
      fill: '#f5f5f5',
      stroke: '#666',
    },
    ellipse: {
      fill: '#dae8fc',
      stroke: '#6c8ebf',
    },
    polygon: {
      fill: '#d5e8d4',
      stroke: '#82b366',
    },
    diamond: {
      fill: '#ffe6cc',
      stroke: '#d79b00',
    },
    text: {
      color: '#b85450',
      fontSize: 12,
    },
  },
  grid: {
    size: 20,
  },
  partial: true,
};

const container = document.querySelector('#container');
const root = createRoot(container);

/**
 * 框选插件 Snapshot 示例
 */
const SnapshotExample: React.FC = () => {
  const lfRef = useRef<LogicFlow>();
  const containerRef = useRef<HTMLDivElement>(null);

  const [fileName, setFileName] = useState<string>(); // 文件名
  const [fileType, setFileType] = useState<string>('png'); // 下载的图片类型
  const [width, setWidth] = useState<number>(); // 宽度
  const [height, setHeight] = useState<number>(); // 高度
  const [backgroundColor, setBackgroundColor] = useState<string>('white'); // 背景颜色
  const [padding, setPadding] = useState<number>(); //padding
  const [quality, setQuality] = useState<number>(); // 图片质量
  const [partial, setPartial] = useState<boolean>(true); // 导出局部渲染

  const [blobData, setBlobData] = useState('');
  const [base64Data, setBase64Data] = useState('');

  useEffect(() => {
    if (!lfRef.current) {
      const lf = new LogicFlow({
        ...config,
        container: containerRef.current!,
        plugins: [Snapshot, DndPanel],
      });

      lf.register(customHtml);
      lf.register(imageNode);

      lf.setPatternItems([
        {
          type: 'circle',
          text: 'circle',
          label: 'circle',
          icon: circleSvgUrl,
        },
        {
          type: 'rect',
          label: 'rect',
          text: 'circle',
          icon: rectSvgUrl,
        },
      ]);

      lf.on('custom:button-click', (model: any) => {
        lf.setProperties(model.id, {
          body: 'LogicFlow',
        });
      });

      // 默认开启css样式
      lf.extension.snapshot.useGlobalRules = true;
      // 不会覆盖css样式，会叠加，customCssRules优先级高
      lf.extension.snapshot.customCssRules = `
          .uml-wrapper {
            line-height: 1.2;
            text-align: center;
            color: blue;
          }
        `;

      lf.render(data);
      lf.translateCenter();

      lfRef.current = lf;
    }
  }, []);

  // 下载
  const downLoad = async () => {
    const params: ToImageOptions = {
      fileType,
      backgroundColor,
      partial,
      width,
      height,
      padding,
      quality,
    };
    console.log(params, 'params');
    await lfRef.current?.getSnapshot(fileName, params);
  };

  // 预览 blob
  const previewBlob = () => {
    if (lfRef.current) {
      setBase64Data('');
      lfRef.current
        .getSnapshotBlob(backgroundColor, fileType)
        .then(
          ({
            data,
            width,
            height,
          }: {
            data: Blob;
            width: number;
            height: number;
          }) => {
            setBlobData(window.URL.createObjectURL(data));
            console.log('width, height ', width, height);
          },
        );
    }
  };

  // 预览 base64
  const previewBase64 = () => {
    if (lfRef.current) {
      setBlobData('');
      lfRef.current
        .getSnapshotBase64(backgroundColor)
        .then(
          ({
            data,
            width,
            height,
          }: {
            data: string;
            width: number;
            height: number;
          }) => {
            setBase64Data(data);
            console.log('width, height ', width, height);
          },
        );
    }
  };

  const handleInputChange = (
    value: number | null | undefined,
    prop: string,
  ) => {
    if (value === null || value === undefined) {
      switch (
        prop // 处理 null 或 undefined 的情况
      ) {
        case 'width':
          setWidth(undefined);
          break;
        case 'height':
          setHeight(undefined);
          break;
        case 'padding':
          setPadding(undefined);
          break;
        case 'quality':
          setQuality(undefined);
          break;
      }
    } else {
      switch (
        prop // 设置有效的数字值
      ) {
        case 'width':
          setWidth(value);
          break;
        case 'height':
          setHeight(value);
          break;
        case 'padding':
          setPadding(value);
          break;
        case 'quality':
          setQuality(value);
          break;
      }
    }
  };

  return (
    <>
      <Space>
        <Input
          addonBefore="文件名："
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
        />
        <span>文件类型：</span>
        <Select
          defaultValue={fileType}
          style={{ width: 120 }}
          onChange={(value) => setFileType(value)}
          options={[
            { value: 'png', label: 'png' },
            { value: 'jpeg', label: 'jpeg' },
            { value: 'webp', label: 'webp' },
            { value: 'gif', label: 'gif' },
            { value: 'svg', label: 'svg' },
          ]}
        />
        <InputNumber
          addonBefore="宽度："
          value={width}
          onChange={(value) => handleInputChange(value, 'width')}
        />
        <InputNumber
          addonBefore="高度："
          value={height}
          onChange={(value) => handleInputChange(value, 'height')}
        />
      </Space>
      <p></p>
      <Space>
        <Input
          addonBefore="背景颜色"
          value={backgroundColor}
          onChange={(e) => setBackgroundColor(e.target.value)}
        />
        <InputNumber
          addonBefore="padding："
          value={padding}
          onChange={(value) => handleInputChange(value, 'padding')}
        />
        <InputNumber
          addonBefore="图片质量："
          value={quality}
          onChange={(value) => handleInputChange(value, 'quality')}
        />
        <span>导出局部渲染：</span>
        <Switch defaultChecked onChange={(partial) => setPartial(partial)} />
      </Space>
      <Divider />
      <Space>
        <Button onClick={downLoad}>下载快照</Button>
        <Button onClick={previewBlob}>预览(blob)</Button>
        <Button onClick={previewBase64}>预览(base64)</Button>
      </Space>
      <Divider />
      <Flex align="center" justify="center">
        <div ref={containerRef} id="graph"></div>
      </Flex>
      <Row>
        <Col span={12}>
          {blobData && (
            <>
              <h2>blobData</h2>
              <img key="blob" src={blobData} />
            </>
          )}
          {base64Data && (
            <>
              <h2>base64Data</h2>
              <img key="base64" src={base64Data} />
            </>
          )}
        </Col>
      </Row>
    </>
  );
};

root.render(<SnapshotExample></SnapshotExample>);

insertCss(`
#graph {
  width: 800px;
  height: 500px;
}

.uml-wrapper {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  background: #efdbff;
  border: 2px solid #9254de;
  border-radius: 10px;
}

.uml-head {
  font-weight: bold;
  font-size: 16px;
  line-height: 30px;
  text-align: center;
}

.uml-body {
  padding: 5px 10px;
  font-size: 12px;
  border-top: 1px solid #9254de;
  border-bottom: 1px solid #9254de;
}

.uml-footer {
  padding: 5px 10px;
  font-size: 14px;
}

.lf-dnd-shape {
  width: 20px !important;
  height: 20px !important;
}
`);
