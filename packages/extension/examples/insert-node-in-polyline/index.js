window.onload = function () {
  const lf = new LogicFlow({
    container: document.querySelector('#app'),
    // fixme: grid成为了必传的了
    grid: {
      type: 'dot',
      size: 20,
    },
  });
  lf.render();
  // 初始化拖入功能
  document.querySelector('#rect').addEventListener('mousedown', () => {
    lf.dnd.startDrag({
      type: 'rect',
    });
  });
  document.querySelector('#circle').addEventListener('mousedown', () => {
    lf.dnd.startDrag({
      type: 'circle',
    });
  });
};
