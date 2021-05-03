window.addEventListener('DOMContentLoaded', () => {
  const lf = new LogicFlow({
    container: document.querySelector('#app'),
    edgeTextDraggable: true,
    nodeTextDraggable: true,
    metaKeyMultipleSelected: true,
    grid: true,
  });
  lf.render({});
  document.querySelector('#js_get_path').addEventListener('click', () => {
    console.log(33)
  });
})
