window.onload = function () {
  const lf = new LogicFlow({
    container: document.querySelector('#app'),
    edgeTextDraggable: true,
    nodeTextDraggable: true,
    metaKeyMultipleSelected: true,
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
  const pathes = window.sessionStorage.getItem('lf-pathes');
  if (pathes) {
    lf.setRawPathes(JSON.parse(pathes));
  }
  document.querySelector('#selection-node-pattern').addEventListener('mousedown', () => {
    lf.updateEditConfig({
      stopMoveGraph: true,
      extraConf: {
        openSelectionMode: true,
      }
    });
  });

  lf.on('selection:selected', () => {
    lf.updateEditConfig({
      stopMoveGraph: false,
      extraConf: {
        openSelectionMode: false,
      }
    });
  });

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
  document.querySelector('#upload').addEventListener('change', function (ev) {
    const file = ev.target.files[0];
    const reader = new FileReader()
    reader.onload = (event) => {
      const xml = event.target.result;
      
      renderXml(xml);
    }
    reader.onerror = error => reject(error)
    reader.readAsText(file) // you could also read images and other binaries
  });

  document.querySelector('#js_get_path').addEventListener('click', () => {
    lf.setStartNodeType('bpmn:startEvent');
    const pathes = lf.getPathes();
    console.log(pathes);
    console.log(JSON.parse(window.sessionStorage.getItem('lf-pathes')));
    window.sessionStorage.setItem('lf-pathes', JSON.stringify(pathes));
  });
  document.querySelector('#js_show_path').addEventListener('click', () => {
    console.log(lf.getRawPathes());
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
