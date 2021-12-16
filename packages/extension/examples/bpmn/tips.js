const nodeWidth = 100;
const nodeHeight = 80;

class Tips {
  static pluginName = 'tips';
  constructor ({ lf }) {
    this.lf = lf;
    const tipsWrap = document.createElement('div');
    tipsWrap.className = 'custom-tips';
    this.tipsWrap = tipsWrap;
  }
  render(lf, container) {
    this.container = container;
    this.container.appendChild(this.tipsWrap);
    this.lf.on('node:mouseenter', ({ data }) => {
      const model = this.lf.graphModel.getNodeModelById(data.id);
      // 没有model可以认为是fakernode, 也就是正在外部拖入的节点。
      if (!model) return;
      this.showTip(data);
    });
    this.lf.on('node:mouseleave', ({ data }) => {
      const model = this.lf.graphModel.getNodeModelById(data.id);
      // 没有model可以认为是fakernode, 也就是正在外部拖入的节点。
      if (!model) return;
      this.isCurrentLeaveId = data.id;
      setTimeout(() => {
        if (this.isCurrentLeaveId === data.id) {
          this.hideTips();
        }
      }, 200);
    });
    this.lf.on('node:dragstart', () => {
      this.isDragging = true;
      this.hideTips();
    });
    this.lf.on('node:drop', ({ data}) => {
      this.isDragging = false;
      this.showTip(data);
    });
    this.tipsWrap.addEventListener('click', () => {
      this.currentData && lf.graphModel.deleteNode(this.currentData.id);
      this.hideTips();
    });
    this.tipsWrap.addEventListener('mouseenter', () => {
      this.isCurrentLeaveId = false;
    });
    this.tipsWrap.addEventListener('mouseleave', () => {
      this.hideTips();
    });
  }
  showTip(data) {
    if (this.isDragging) return;
    this.currentData = data;
    const [x, y] = this.lf.graphModel.transformMatrix.CanvasPointToHtmlPoint([data.x + nodeWidth / 2 + 4, data.y - nodeHeight / 2]);
    this.tipsWrap.style.display = 'block';
    this.tipsWrap.style.top = `${y}px`;
    this.tipsWrap.style.left = `${x}px`;
  }
  hideTips() {
    this.tipsWrap.style.display = 'none';
  }
}

LogicFlow.use(Tips);
