const MiniMap = {
  __lf: null,
  __container: null,
  install() {},
  render(lf, container) {
    console.log(lf);
    MiniMap.__lf = lf;
    MiniMap.__container = container;
  },
  __createMiniMap(left, top) {
    const miniMapWrap = document.createElement('div');
    miniMapWrap.className = 'lf-mini-map';
    miniMapWrap.style.left = `${left}px`;
    miniMapWrap.style.top = `${top}px`;
    MiniMap.__container.appendChild(miniMapWrap);
  },
  show(left, top) {
    this.__createMiniMap(left, top);
    console.log(2);
  }
};

export default MiniMap;

export {
  MiniMap,
};
