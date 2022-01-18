# 简介

> LogicFlow 最初的目标就是支持一个扩展性强的流程绘制工具，用来满足各种业务需求。为了让LogicFlow的拓展性足够强，LogicFlow将所有的非核心功能都使用插件的方式开发，然后将这些插件放到`@logicflow/extension`包中。

### 安装全局插件

npm方式
```js
import { BpmnElement } from '@logicflow/extension';
LogicFlow.use(BpmnElement);
```

cdn方式

```html
<!--LogicFlow core包css-->
<link ref="stylesheet" href="https://cdn.jsdelivr.net/npm/@logicflow/core/dist/style/index.css" />
<!--LogicFlow extension包css-->
<link ref="stylesheet" href="https://cdn.jsdelivr.net/npm/@logicflow/extension/lib/style/index.css" />
<!--LogicFlow core包js-->
<script src="https://cdn.jsdelivr.net/npm/@logicflow/core/dist/logic-flow.js"></script>
<!--LogicFlow的插件支持单个引入，这里以菜单插件为例-->
<script src="https://cdn.jsdelivr.net/npm/@logicflow/extension/lib/Menu.js"></script>
<script>
  LogicFlow.use(Menu);
</script>
```

### 安装插件到实例上

`v1.0.7` 新增

当一个单页面应用存在多个使用LogicFlow的页面时，不同的页面使用的插件可能不一样。LogicFlow初始化的时候，将插件作为参数传入到构造函数中，此时插件会覆盖全局的插件。

```js
import LogicFlow from "@logicflow/core";
import { DndPanel, SelectionSelect } from "@logicflow/extension";
import "@logicflow/core/dist/style/index.css";
import "@logicflow/extension/lib/style/index.css";

const lf = new LogicFlow({
  container: document.querySelector("#app"),
  grid: true,
  plugins: [DndPanel, SelectionSelect]
});
```

