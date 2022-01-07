# 简介

> LogicFlow 最初的目标就是支持一个扩展性强的流程绘制工具，用来满足各种业务需求。为了让LogicFlow的拓展性足够强，LogicFlow将所有的非核心功能都使用插件的方式开发，然后将这些插件放到`@logicflow/extension`包中。

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

