const Control = {
  install() { },
  render(lf, domContainer) {
    domContainer.appendChild(this.getControlTool(lf));
  },
  getControlTool(lf) {
    const controlItems = [
      {
        iconClass: 'lf-control-zoomOut',
        title: '缩小流程图',
        text: '缩小',
        onClick: () => { lf.zoom(false); },
      },
      {
        iconClass: 'lf-control-zoomIn',
        title: '放大流程图',
        text: '放大',
        onClick: () => { lf.zoom(true); },
      },
      {
        iconClass: 'lf-control-fit',
        title: '恢复流程原有尺寸',
        text: '适应',
        onClick: () => { lf.resetZoom(); },
      },
      {
        iconClass: 'lf-control-undo',
        title: '回到上一步',
        text: '上一步',
        onClick: () => { lf.undo(); },
      },
      {
        iconClass: 'lf-control-redo',
        title: '移到下一步',
        text: '下一步',
        onClick: () => { lf.redo(); },
      },
    ];
    const NORMAL = 'lf-control-item';
    const DISABLED = 'lf-control-item disabled';
    const controlTool = document.createElement('div');
    const controlElements = [];
    controlTool.className = 'lf-control';
    controlItems.forEach((item) => {
      const itemContainer = document.createElement('div');
      const icon = document.createElement('i');
      const text = document.createElement('span');
      itemContainer.className = DISABLED;
      itemContainer.onclick = item.onClick;
      icon.className = item.iconClass;
      text.className = 'lf-control-text';
      text.title = item.title;
      text.innerText = item.text;
      itemContainer.append(icon, text);
      switch (item.text) {
        case '上一步':
          lf.on('history:change', ({ data: { undoAble } }) => {
            itemContainer.className = undoAble ? NORMAL : DISABLED;
          });
          break;
        case '下一步':
          lf.on('history:change', ({ data: { redoAble } }) => {
            itemContainer.className = redoAble ? NORMAL : DISABLED;
          });
          break;
        default:
          itemContainer.className = NORMAL;
          break;
      }
      controlElements.push(itemContainer);
    });
    controlTool.append(...controlElements);
    return controlTool;
  },
};

export default Control;

export {
  Control,
};
