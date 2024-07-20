---
nav: 指南
group:
  title: 插件功能
  order: 3
title: 导出 Snapshot
order: 12
toc: content
---

# 导出 Snapshot

## 导出图片

### 使用方式

**第一步**: 注册插件

```tsx | purex | pure
import LogicFlow from '@logicflow/core'
import { Snapshot } from '@logicflow/extension'

LogicFlow.use(Snapshot)
```

**第二步**:
通过第一步，将插件注册到`LogicFlow`上，使`LogicFlow`实例上多了一个实例方法 lf.getSnapshot

```tsx | purex | pure
const lf = new LogicFlow({
  container: document.querySelector("#graph"),
  width: 700,
  height: 600,
});

// 可以使用任意方式触发，然后将绘制的图形下载到本地磁盘上
document.getElementById("download").addEventListener("click", () => {
  lf.getSnapshot();
  // 或者 1.1.13版本
  // lf.extension.snapshot.getSnapshot()
});
```

值得一提的是：通过此插件截取下载的图片不会因为偏移、缩放受到影响。

## 导出 xml

1.0.7 新增

LogicFlow 默认生成的数据是 json 格式，可能会有一些流程引擎需要前端提供 xml
格式数据。`@logicflow/extension`提供了`lfJson2Xml`和`lfXml2Json`两个插件，用于将 json 和 xml 进行互相转换。

```tsx | purex | pure
import LogicFlow from "@logicflow/core";
import { lfJson2Xml, lfXml2Json } from "@logicflow/extension";

const lf = new LogicFlow({
  // ...
});
const data = lfJson2Xml(jsonData);
lf.render(data);
const xml = lfJson2Xml(lf.getGraphData());
```

### 自定义下载 css

为了保持流程图生成的图片与画布上效果一致，`snapshot`插件默认会将当前页面所有的 css 规则都加载克隆到
canvas 中, 但是可能会因为 CSS 文件跨域引起报错，参考
issue[575](https://github.com/didi/LogicFlow/issues/575)。可以修改`useGlobalRules`来禁止加载所有 css
规则，然后通过`customCssRules`来自定义下载流程图属性。

```tsx | pure
lf.extension.snapshot.useGlobalRules = false;
lf.extension.snapshot.customCssRules = `
    .lf-node-text-auto-wrap-content{
      line-height: 1.2;
      background: transparent;
      text-align: center;
      word-break: break-all;
      width: 100%;
    }
    .lf-canvas-overlay {
      background: red;
    }
  `;
```

### 示例

<a href="https://codesandbox.io/embed/logicflow-base21-o3vqi?fontsize=14&hidenavigation=1&theme=dark&view=preview" target="_blank"> 去 CodeSandbox 查看示例</a>
