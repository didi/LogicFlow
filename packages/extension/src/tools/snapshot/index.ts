/**
 * 快照插件，生成视图
 */

function getOuterHTML(el: Element): string {
  if (el.outerHTML) {
    return el.outerHTML;
  }
  const container = document.createElement('div');
  container.appendChild(el.cloneNode(true));
  return container.innerHTML;
}

const Snapshot = {
  name: 'snapshot',
  install(lf) {
    this.offsetX = Number.MAX_SAFE_INTEGER;
    this.offsetY = Number.MAX_SAFE_INTEGER;
    lf.getSnapshot = (fileName: string) => {
      this.fileName = fileName || `logic-flow.${Date.now()}.png`;
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
      const svgRootElement = lf.container.querySelector('svg');
      this.downloadSvg(svgRootElement, this.fileName);
    };
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
  downloadSvg(svg: SVGGraphicsElement) {
    const copy = svg.cloneNode(true);
    const dpr = window.devicePixelRatio || 1;
    const graph = copy.lastChild;
    let childLength = graph.childNodes && graph.childNodes.length;
    if (childLength) {
      for (let i = 0; i < childLength; i++) {
        const lfLayer = graph.childNodes[i] as SVGGraphicsElement;
        // 只保留包含节点和连线的基础图层进行下载，其他图层删除
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
    const canvas = document.createElement('canvas');
    const base = document.getElementsByClassName('lf-base')[0];
    const bbox = (base as Element).getBoundingClientRect();
    // width,height 值加40，保证图形不会紧贴着下载图片的右边和下边
    canvas.style.width = `${bbox.width}px`;
    canvas.style.height = `${bbox.height}px`;
    canvas.width = bbox.width * dpr + 80;
    canvas.height = bbox.height * dpr + 80;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, bbox.width, bbox.height);
    const data = getOuterHTML(copy as Element);
    const img = new Image();
    const svgBlob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
    const url = window.URL.createObjectURL(svgBlob);
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      window.URL.revokeObjectURL(url);
      const imgURI = canvas
        .toDataURL('image/png')
        .replace('image/png', 'image/octet-stream');
      this.triggerDownload(imgURI, this.fileName);
    };
    img.src = url;
  },
};

export default Snapshot;

export {
  Snapshot,
};
