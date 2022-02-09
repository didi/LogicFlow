/**
 * 快照插件，生成视图
 */

const Snapshot = {
  pluginName: 'snapshot',
  install(lf) {
    this.lf = lf;
    /* 下载快照 */
    lf.getSnapshot = (fileName: string, backgroundColor: string) => {
      this.offsetX = Number.MAX_SAFE_INTEGER;
      this.offsetY = Number.MAX_SAFE_INTEGER;
      this.fileName = fileName || `logic-flow.${Date.now()}.png`;
      const svgRootElement = this.getSvgRootElement(lf);
      this.downloadSvg(svgRootElement, this.fileName, backgroundColor);
    };
    /* 获取Blob对象，用户图片上传 */
    lf.getSnapshotBlob = (backgroundColor: string) => {
      this.offsetX = Number.MAX_SAFE_INTEGER;
      this.offsetY = Number.MAX_SAFE_INTEGER;
      const svgRootElement = this.getSvgRootElement(lf);
      return this.getBlob(svgRootElement, backgroundColor);
    };
    /* 获取Base64对象，用户图片上传 */
    lf.getSnapshotBase64 = (backgroundColor: string) => {
      this.offsetX = Number.MAX_SAFE_INTEGER;
      this.offsetY = Number.MAX_SAFE_INTEGER;
      const svgRootElement = this.getSvgRootElement(lf);
      return this.getBase64(svgRootElement, backgroundColor);
    };
  },
  /* 获取svgRoot对象 */
  getSvgRootElement(lf) {
    lf.graphModel.nodes.forEach(item => {
      const {
        x, width, y, height,
      } = item;
      const offsetX = x - width / 2;
      const offsetY = y - height / 2;
      if (offsetX < this.offsetX) {
        this.offsetX = offsetX - 5;
      }
      if (offsetY < this.offsetY) {
        this.offsetY = offsetY - 5;
      }
    });
    lf.graphModel.edges.forEach(edge => {
      if (edge.pointsList) {
        edge.pointsList.forEach(point => {
          const { x, y } = point;
          if (x < this.offsetX) {
            this.offsetX = x - 5;
          }
          if (y < this.offsetY) {
            this.offsetY = y - 5;
          }
        });
      }
    });
    const svgRootElement = lf.container.querySelector('.lf-canvas-overlay');
    return svgRootElement;
  },
  triggerDownload(imgURI: string) {
    const evt = new MouseEvent('click', {
      view: window,
      bubbles: false,
      cancelable: true,
    });
    const a = document.createElement('a');
    a.setAttribute('download', this.fileName);
    a.setAttribute('href', imgURI);
    a.setAttribute('target', '_blank');
    a.dispatchEvent(evt);
  },
  removeAnchor(element) {
    const { childNodes } = element;
    let childLength = element.childNodes && element.childNodes.length;
    for (let i = 0; i < childLength; i++) {
      const child = childNodes[i] as SVGGraphicsElement;
      const classList = (child.classList && Array.from(child.classList)) || [];
      if (classList.indexOf('lf-anchor') > -1) {
        element.removeChild(element.childNodes[i]);
        childLength--;
        i--;
      }
    }
  },
  /* 下载图片 */
  downloadSvg(svg: SVGGraphicsElement, fileName: string, backgroundColor: string) {
    this.getCanvasData(svg, backgroundColor).then(canvas => {
      const imgURI = canvas
        .toDataURL('image/png')
        .replace('image/png', 'image/octet-stream');
      this.triggerDownload(imgURI, fileName);
    });
  },
  /* 获取base64对象 */
  getBase64(svg: SVGGraphicsElement, backgroundColor: string) {
    return new Promise((resolve) => {
      this.getCanvasData(svg, backgroundColor).then(canvas => {
        const base64 = canvas.toDataURL('image/png');
        // 输出图片数据以及图片宽高
        resolve({ data: base64, width: canvas.width, height: canvas.height });
      });
    });
  },
  /* 获取Blob对象 */
  getBlob(svg: SVGGraphicsElement, backgroundColor: string) {
    return new Promise((resolve) => {
      this.getCanvasData(svg, backgroundColor).then(canvas => {
        canvas.toBlob(blob => {
          // 输出图片数据以及图片宽高
          resolve({ data: blob, width: canvas.width, height: canvas.height });
        }, 'image/png');
      });
    });
  },
  getClassRules() {
    let rules = '';
    const { styleSheets } = document;
    for (let i = 0; i < styleSheets.length; i++) {
      const sheet = styleSheets[i];
      for (let j = 0; j < sheet.cssRules.length; j++) {
        rules += sheet.cssRules[j].cssText;
      }
    }
    return rules;
  },
  // 获取图片生成中中间产物canvas对象，用户转换为其他需要的格式
  getCanvasData(svg: SVGGraphicsElement, backgroundColor: string) {
    const copy = svg.cloneNode(true);
    const graph = copy.lastChild;
    let childLength = graph.childNodes && graph.childNodes.length;
    if (childLength) {
      for (let i = 0; i < childLength; i++) {
        const lfLayer = graph.childNodes[i] as SVGGraphicsElement;
        // 只保留包含节点和边的基础图层进行下载，其他图层删除
        const layerClassList = lfLayer.classList && Array.from(lfLayer.classList);
        if (layerClassList && layerClassList.indexOf('lf-base') < 0) {
          graph.removeChild(graph.childNodes[i]);
          childLength--;
          i--;
        } else {
          // 删除锚点
          const lfBase = graph.childNodes[i];
          lfBase && lfBase.childNodes.forEach((item) => {
            const element = item as SVGGraphicsElement;
            this.removeAnchor(element.firstChild);
          });
        }
      }
    }
    // offset值加10，保证图形不会紧贴着下载图片的左边和上边
    (copy.lastChild as SVGGElement).style.transform = `matrix(1, 0, 0, 1, ${-this.offsetX + 10}, ${-this.offsetY + 10})`;
    const dpr = window.devicePixelRatio || 1;
    const canvas = document.createElement('canvas');
    /*
    为了计算真实宽高需要取图的真实dom
    真实dom存在缩放影响其宽高数值
    在得到真实宽高后除以缩放比例即可得到正常宽高
    */
    const base = document.getElementsByClassName('lf-base')[0];
    const bbox = (base as Element).getBoundingClientRect();
    const { graphModel } = this.lf;
    const { transformModel } = graphModel;
    const { SCALE_X, SCALE_Y } = transformModel;
    const bboxWidth = Math.ceil(bbox.width / SCALE_X);
    const bboxHeight = Math.ceil(bbox.height / SCALE_Y);
    // width,height 值加40，保证图形不会紧贴着下载图片的右边和下边
    canvas.style.width = `${bboxWidth}px`;
    canvas.style.height = `${bboxHeight}px`;
    canvas.width = bboxWidth * dpr + 80;
    canvas.height = bboxHeight * dpr + 80;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);
    // 如果有背景色，设置流程图导出的背景色
    if (backgroundColor) {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, bboxWidth * dpr + 80, bboxHeight * dpr + 80);
    } else {
      ctx.clearRect(0, 0, bboxWidth, bboxHeight);
    }
    const img = new Image();
    const style = document.createElement('style');
    style.innerHTML = this.getClassRules();
    const foreignObject = document.createElement('foreignObject');
    foreignObject.appendChild(style);
    copy.appendChild(foreignObject);
    return new Promise((resolve) => {
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        resolve(canvas);
      };
      /*
      因为svg中存在dom存放在foreignObject元素中
      SVG图形转成img对象
      todo: 会导致一些清晰度问题这个需要再解决
      */
      const svg2Img = `data:image/svg+xml;charset=utf-8,${new XMLSerializer().serializeToString(copy)}`;
      const imgSrc = svg2Img.replace(/\n/g, '').replace(/\t/g, '').replace(/#/g, '%23');
      img.src = imgSrc;
    });
  },
};

export default Snapshot;

export {
  Snapshot,
};
