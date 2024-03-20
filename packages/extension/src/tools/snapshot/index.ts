/* eslint-disable operator-linebreak */
/* eslint-disable implicit-arrow-linebreak */
/**
 * 快照插件，生成视图
 */

class Snapshot {
  static pluginName = 'snapshot';
  lf: any;
  offsetX: number;
  offsetY: number;
  fileName: string;
  customCssRules: string;
  useGlobalRules: boolean;
  constructor({ lf }) {
    this.lf = lf;
    this.customCssRules = '';
    this.useGlobalRules = true;
    /* 下载快照 */
    lf.getSnapshot = (fileName: string, backgroundColor: string) => {
      this.getSnapshot(fileName, backgroundColor);
    };
    /* 获取Blob对象，用户图片上传 */
    lf.getSnapshotBlob = (backgroundColor: string) =>
      this.getSnapshotBlob(backgroundColor);
    /* 获取Base64对象，用户图片上传 */
    lf.getSnapshotBase64 = (backgroundColor: string) =>
      this.getSnapshotBase64(backgroundColor);
  }
  /* 获取svgRoot对象 */
  getSvgRootElement(lf) {
    const svgRootElement = lf.container.querySelector('.lf-canvas-overlay');
    return svgRootElement;
  }
  triggerDownload(imgURI: string) {
    const evt = new MouseEvent('click', {
      view: document.defaultView,
      bubbles: false,
      cancelable: true,
    });
    const a = document.createElement('a');
    a.setAttribute('download', this.fileName);
    a.setAttribute('href', imgURI);
    a.setAttribute('target', '_blank');
    a.dispatchEvent(evt);
  }
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
  }
  removeRotateControl(element) {
    const { childNodes } = element;
    let childLength = element.childNodes && element.childNodes.length;
    for (let i = 0; i < childLength; i++) {
      const child = childNodes[i] as SVGGraphicsElement;
      const classList = (child.classList && Array.from(child.classList)) || [];
      if (classList.indexOf('lf-rotate-control') > -1) {
        element.removeChild(element.childNodes[i]);
        childLength--;
        i--;
      }
    }
  }
  /* 下载图片 */
  getSnapshot(fileName: string, backgroundColor: string) {
    this.fileName = fileName || `logic-flow.${Date.now()}.png`;
    const svg = this.getSvgRootElement(this.lf);
    this.getCanvasData(svg, backgroundColor).then(
      (canvas: HTMLCanvasElement) => {
        const imgURI = canvas
          .toDataURL('image/png')
          .replace('image/png', 'image/octet-stream');
        this.triggerDownload(imgURI);
      },
    );
  }
  /* 获取base64对象 */
  getSnapshotBase64(backgroundColor: string) {
    const svg = this.getSvgRootElement(this.lf);
    return new Promise((resolve) => {
      this.getCanvasData(svg, backgroundColor).then(
        (canvas: HTMLCanvasElement) => {
          const base64 = canvas.toDataURL('image/png');
          // 输出图片数据以及图片宽高
          resolve({ data: base64, width: canvas.width, height: canvas.height });
        },
      );
    });
  }
  /* 获取Blob对象 */
  getSnapshotBlob(backgroundColor: string) {
    const svg = this.getSvgRootElement(this.lf);
    return new Promise((resolve) => {
      this.getCanvasData(svg, backgroundColor).then(
        (canvas: HTMLCanvasElement) => {
          canvas.toBlob((blob) => {
            // 输出图片数据以及图片宽高
            resolve({ data: blob, width: canvas.width, height: canvas.height });
          }, 'image/png');
        },
      );
    });
  }
  getClassRules() {
    let rules = '';
    if (this.useGlobalRules) {
      const { styleSheets } = document;
      for (let i = 0; i < styleSheets.length; i++) {
        const sheet = styleSheets[i];
        for (let j = 0; j < sheet.cssRules.length; j++) {
          rules += sheet.cssRules[j].cssText;
        }
      }
    }
    if (this.customCssRules) {
      rules += this.customCssRules;
    }
    return rules;
  }
  // 获取图片生成中中间产物canvas对象，用户转换为其他需要的格式
  getCanvasData(svg: SVGGraphicsElement, backgroundColor: string) {
    const copy = svg.cloneNode(true);
    const graph = copy.lastChild;
    let childLength = graph.childNodes && graph.childNodes.length;
    if (childLength) {
      for (let i = 0; i < childLength; i++) {
        const lfLayer = graph.childNodes[i] as SVGGraphicsElement;
        // 只保留包含节点和边的基础图层进行下载，其他图层删除
        const layerClassList =
          lfLayer.classList && Array.from(lfLayer.classList);
        if (layerClassList && layerClassList.indexOf('lf-base') < 0) {
          graph.removeChild(graph.childNodes[i]);
          childLength--;
          i--;
        } else {
          // 删除锚点
          const lfBase = graph.childNodes[i];
          lfBase &&
            lfBase.childNodes.forEach((item) => {
              const element = item as SVGGraphicsElement;
              this.removeAnchor(element.firstChild);
              this.removeRotateControl(element.firstChild);
            });
        }
      }
    }
    let dpr = window.devicePixelRatio || 1;
    if (dpr < 1) {
      // https://github.com/didi/LogicFlow/issues/1222
      // canvas.width = bboxWidth * dpr配合ctx.scale(dpr, dpr)是为了解决绘制模糊
      // 比如dpr=2，先让canvas.width放大到等同于屏幕的物理像素宽高，然后自适应缩放适配canvas.style.width
      // 由于所有元素都缩放了一半，因此需要ctx.scale(dpr, dpr)放大2倍整体绘制的内容
      // 当用户缩放浏览器时，window.devicePixelRatio会随着变小
      // 当window.devicePixelRatio变小到一定程度，会导致canvas.width<canvas.style.width
      // 由于导出图片的svg的大小是canvas.style.width+canvas.style.height
      // 因此会导致导出的svg图片无法完整绘制到canvas（因为canvas.width小于svg的宽）
      // 从而导致canvas导出图片是缺失的svg
      // 而dpr>=1就能保证canvas.width>=canvas.style.width
      // 当dpr小于1的时候，我们强制转化为1，并不会产生绘制模糊等问题
      dpr = 1;
    }
    const canvas = document.createElement('canvas');
    /*
    为了计算真实宽高需要取图的真实dom
    真实dom存在缩放影响其宽高数值
    在得到真实宽高后除以缩放比例即可得到正常宽高
    */
    const base = this.lf.graphModel.rootEl.querySelector('.lf-base');
    const bbox = (base as Element).getBoundingClientRect();
    const layout = this.lf.container.querySelector('.lf-canvas-overlay')
      .getBoundingClientRect();
    const offsetX = bbox.x - layout.x;
    const offsetY = bbox.y - layout.y;
    const { graphModel } = this.lf;
    const { transformModel } = graphModel;
    const { SCALE_X, SCALE_Y, TRANSLATE_X, TRANSLATE_Y } = transformModel;
    // offset值加10，保证图形不会紧贴着下载图片的左边和上边
    (copy.lastChild as SVGGElement).style.transform = `matrix(1, 0, 0, 1, ${
      (-offsetX + TRANSLATE_X) * (1 / SCALE_X) + 10
    }, ${(-offsetY + TRANSLATE_Y) * (1 / SCALE_Y) + 10})`;
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
        const isFirefox = navigator.userAgent.indexOf('Firefox') > -1;
        try {
          if (isFirefox) {
            createImageBitmap(img, {
              resizeWidth: canvas.width,
              resizeHeight: canvas.height,
            }).then((imageBitmap) => {
              // 在回调函数中使用 drawImage() 方法绘制图像
              ctx.drawImage(imageBitmap, 0, 0);
              resolve(canvas);
            });
          } else {
            ctx.drawImage(img, 0, 0);
            resolve(canvas);
          }
        } catch (e) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas);
        }
      };
      /*
      因为svg中存在dom存放在foreignObject元素中
      SVG图形转成img对象
      todo: 会导致一些清晰度问题这个需要再解决
      fixme: XMLSerializer的中的css background url不会下载图片
      */
      const svg2Img = `data:image/svg+xml;charset=utf-8,${new XMLSerializer().serializeToString(
        copy,
      )}`;
      const imgSrc = svg2Img
        .replace(/\n/g, '')
        .replace(/\t/g, '')
        .replace(/#/g, '%23');
      img.src = imgSrc;
    });
  }
}

export default Snapshot;

export { Snapshot };
