## Graph
## 整体设计

### 职责
通过初始化Graph对象来创建画布，调用graph的方法来对节点、关系进行增删改查，graph上的nodeList、connectionList分别存储所有的node、connection对象，通过这两个list可以方便根据各种条件查询node、connection，生成图的数据graphData，graphData可以作为配置进行图的重绘。在graph也提供了插件来增强编辑功能，例如：拖拽添加节点、节点菜单、双击编辑文案等。


*** 示例 ***

```js
  const graph = new Graph({ container: 'app',width: 1000, height: 800 });
  const node1 = graph.addNode('rect', {
      attrs: {
      x: 100,
      y: 20,
      text: '节点1',
    }
  });
  const node2 = graph.addNode('rect', {
      attrs: {
      x: 300,
      y: 20,
      text: '节点2',
    }
  });
  graph.connect({source:node1, target:node2, text: '1-> 2'});
````

### 事件

**监听的事件**
- 图形事件，g/svg中canvas的事件
- Logic Flow 内部事件，eventCenter事件

**对外暴露的事件**
- 图形事件，g/svg中canvas的事件
- Logic Flow 内部事件，对外暴露eventCenter中内部自定义事件，例如:`node:click`，对外暴露的并非全集，而是确实外部必需的事件。
对外暴露的事件维护在eveentBehavior中。

### 与其他模块的关系

**与`node`的关系**

`graph`通过addNode方法添加预定义/自定义节点，`node`提供了addTo方法，将`graph`作为参数传递到`node`中，这样在`node`中可以访问到`graph`对象。node创建后添加到nideList中，方便对node访问和数据处理。

**与`connection`的关系**

`graph`通过connect方法创建两个节点间的关系，`connection`创建后添加到connectionList中，方便对connection访问和数据处理。目前没有对节点之间的重复的关系做限制，两个节点之间可能存在多个关系，`graph`通过disConnect方法解除两个节点间所有的关系，通过removeConnect方法解除两个节点间指定的关系。

**与`plugin`的关系**

创建`graph`对象时会去加载插件，目前是全量加载。后续会实现按需加载。

**与`主题`的关系**

创建`graph`对象后，样式会存在默认配置，可以调用graph的`initTheme`方法全局覆盖默认配置。