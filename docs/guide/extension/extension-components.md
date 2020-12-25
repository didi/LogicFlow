# 组件

Logic Flow 提供一些开箱即用的组件，快速支持产品中常见的功能，如拖拽面板、右键菜单等。

## 使用指南
```ts
 const lf = new LogicFlow({
    container: document.querySelector('#graph'),
    tool: {
      menu: true, // 右键菜单
      control: false, // 控制面板
    },
    graphMenuConfig: [
      {
        text: '分享',
        className: 'lf-menu-item',
        callback(graphModel) {
          alert('分享')
        },
      }
    ],
  });
````

tool 属性支持两个工具，分别为 menu、control，具体使用方式参见 LogicFlow API 中 [constructor 配置项的 tool 属性](/api/logicFlowApi.html#constructor)。

## 控制面板

Logic Flow 内部会检测 tool 的配置，默认展示工具。

默认情况下，创建`LogicFlow`实例会在画布右上方创建一个控制面板，如下所示

<example href="/examples/#/extension/tools/control" :height="190" ></example>

控制面板提供了常见的能力，放大缩小或者自适应画布的能力，同时也内置了 redo 和 undo 的功能，当然如果你不喜欢这样的 UI，也可以基于`LogicFlow`提供的能力自行定义。

## 菜单
默认情况下，右键节点或边会触发 menu 菜单的展示，Logic Flow内置了节点的菜单行为删除、复制和编辑文本。

<example href="/examples/#/extension/tools/menu" :height="300" ></example> 

## 添加自定义菜单功能

通过属性 ```nodeMenuConfig、edgeMenuConfig、 graphMenuConfig ``` 可以自定义不同类型的菜单，格式参考前文示例代码中的 text ，className 和 callback 三个属性。如果只想要 node 的 menu 而不需要 edge 和 graph 的 menu，可以为 edge 和 graph 传一个空数组。
 
<example href="/examples/#/extension/tools/custom-menu" :height="300" ></example> 
