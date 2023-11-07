import NotAllowConnectRect from './NotAllowConnectRect.mjs';

window.onload = function () {
  const lf = new LogicFlow({
    container: document.querySelector('#app'),
    grid: {
      type: 'dot',
      size: 20,
    },
  });
  lf.register(NotAllowConnectRect);
  lf.on('connection:not-allowed', ({ data, msg }) => {
    console.error('connection:not-allowed的原因是', msg);
  });
  lf.render();
  // 初始化拖入功能
  document.querySelector('#rect').addEventListener('mousedown', () => {
    lf.dnd.startDrag({
      type: 'not-allow-connect',
    });
  });
  document.querySelector('#circle').addEventListener('mousedown', () => {
    lf.dnd.startDrag({
      type: 'circle',
    });
  });
};
