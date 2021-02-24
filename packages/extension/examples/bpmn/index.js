window.onload = function () {
  const lf = new LogicFlow({
    container: document.querySelector('#app'),
    // fixme: grid成为了必传的了
    edgeTextDraggable: true,
    metaKeyMultipleSelected: true,
    // stopScrollGraph: true,
    // stopMoveGraph: true,
    // stopZoomGraph: true,
    grid: {
      type: 'dot',
      size: 20,
    },
    keyboard: {
      enabled: true,
    },
    snapline: true,
  });

  let lfData = window.sessionStorage.getItem('lf-data');
  if (lfData) {
    renderXml(lfData);
  } else {
    lfData = window.sessionStorage.getItem('lf-json-data');
    if (!lfData) {
      lfData = {};
    } else {
      lfData = JSON.parse(lfData);
    }
    lf.render(lfData);
  }

  document.querySelector('#start-node-pattern').addEventListener('mousedown', () => {
    lf.dnd.startDrag({
      type: 'bpmn:startEvent',
      text: '开始'
    });
  });

  document.querySelector('#end-node-pattern').addEventListener('mousedown', () => {
    lf.dnd.startDrag({
      type: 'bpmn:endEvent',
      text: '结束'
    });
  });

  document.querySelector('#condition-node-pattern').addEventListener('mousedown', () => {
    lf.dnd.startDrag({
      type: 'bpmn:exclusiveGateway',
    });
  });

  document.querySelector('#user-node-pattern').addEventListener('mousedown', () => {
    lf.dnd.startDrag({
      type: 'bpmn:userTask',
    });
  });
  document.querySelector('#system-node-pattern').addEventListener('mousedown', () => {
    lf.dnd.startDrag({
      type: 'bpmn:serviceTask',
    });
  });
  document.querySelector('#download').addEventListener('click', () => {
    const data = lf.getGraphData();
    const xml = json2xml(data, '\n');
    this.download('logic-flow.xml', xml);
    window.sessionStorage.setItem('lf-data', xml);
  });
  document.querySelector('#download-img').addEventListener('click', () => {
    lf.getSnapshot('logic-flow.png');
  });
  this.document.querySelector('#upload').addEventListener('change', function (ev) {
    const file = ev.target.files[0];
    const reader = new FileReader()
    reader.onload = (event) => {
      const xml = event.target.result;
      
      renderXml(xml);
    }
    reader.onerror = error => reject(error)
    reader.readAsText(file) // you could also read images and other binaries
  });

  function renderXml(xml) {
    const json = new XML.ObjTree().parseXML(xml);
    lf.render(json);
  }
}

function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}
