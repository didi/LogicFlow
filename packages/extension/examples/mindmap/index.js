

window.onload = function () {
  const lf = new LogicFlow({
    container: document.querySelector('#app'),
    keyboard: {
      enabled: true,
      shortcuts: [
        {
          keys: ['backspace'],
          callback: () => {
            const { nodes } = lf.getSelectElements(true);
            if (nodes.length > 0) {
              lf.clearSelectElements();
              nodes.forEach((node) => {
                lf.removeTreeNode(node.id)
              })
            }
          }
        }
      ]
    }
  });
  lf.setPatternItems([
    {
      label: '中心主题',
      // type: 'mark:root',
      icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAAH6ji2bAAAABGdBTUEAALGPC/xhBQAAAOVJREFUOBGtVMENwzAIjKP++2026ETdpv10iy7WFbqFyyW6GBywLCv5gI+Dw2Bluj1znuSjhb99Gkn6QILDY2imo60p8nsnc9bEo3+QJ+AKHfMdZHnl78wyTnyHZD53Zzx73MRSgYvnqgCUHj6gwdck7Zsp1VOrz0Uz8NbKunzAW+Gu4fYW28bUYutYlzSa7B84Fh7d1kjLwhcSdYAYrdkMQVpsBr5XgDGuXwQfQr0y9zwLda+DUYXLaGKdd2ZTtvbolaO87pdo24hP7ov16N0zArH1ur3iwJpXxm+v7oAJNR4JEP8DoAuSFEkYH7cAAAAASUVORK5CYII=',
      // callback: () => {
      //   lf.addNode()
      // }
    }
  ])
  lf.render([
    {
      id: 'root1',
      type: 'mark:root',
      name: '根节点1',
      children: [
        {
          id: '222',
          type: 'mark:entity'
        },
        {
          id: '223',
          type: 'mark:entity'
        },
        {
          id: '224',
          type: 'mark:entity',
          // properties: {}
        },
        {
          id: '226',
          type: 'mark:entity',
          // properties: {}
        }
      ]
    },
    {
      id: 'root2',
      type: 'mark:root',
      name: '根节点2'
    }
  ])
  document.querySelector('#js_get_data').addEventListener('click', () => {
    const data = lf.getGraphData()
    console.log(data)
  })
  lf.on('node:add', (data) => {
    console.log(data)
  })
  lf.on('node:delete', (data) => {
    console.log(data)
  })
}

