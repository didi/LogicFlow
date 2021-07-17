import 'playground-elements';

fetch('examples/config.json').then((res) => {
  return res.json();
})
.then((res) => {
  setExampleList(res.examples);
});

function setExampleList(examples) {
  const listWrapper = document.querySelector('#js-playground-list');
  const ul = document.createElement('ul');
  examples.forEach(element => {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = '#' + element.key;
    link.innerText = element.name;
    li.appendChild(link);
    ul.appendChild(li);
  });
  listWrapper.appendChild(ul);
  loadDefault(examples);
}

function loadDefault(examples) {
  if (window.location.hash) {
    loadPlayground(window.location.hash.slice(1));
  } else {
    window.locaiton.hash = examples[0].key;
  }
}

window.addEventListener('hashchange', () => {
  const hash = location.hash;
  loadPlayground(hash.slice(1));
});

const ide = document.querySelector('#js-ide');

function loadPlayground(key) {
  ide.setAttribute('project-src', `examples/${key}.playground.json`)
}


