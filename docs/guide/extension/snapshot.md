# 导出

## 导出图片

### 使用方式

**第一步**: 注册插件

```ts
import LogicFlow from '@logicflow/core';
import { Snapshot } from '@logicflow/extension';

LogicFlow.use(Snapshot);
```

**第二步**:
通过第一步，将插件注册到`LogicFlow`上，使`LogicFlow`实例上多了一个实例方法 lf.getSnapshot

```ts
const lf = new LogicFlow({
  container: document.querySelector('#graph'),
  width: 700,
  height: 600,
});
// 可以使用任意方式触发，然后将绘制的图形下载到本地磁盘上
document.getElementById('download').addEventListener('click', () => {
  lf.getSnapshot()
})
```

值得一提的是：通过此插件截取下载的图片不会因为偏移、缩放受到影响。

### 示例

<example :height="250" ></example>

## 导出xml

1.0.7 新增

LogicFlow默认生成的数据是json格式，可能会有一些流程引擎需要前端提供xml格式数据。`@logicflow/extension`提供了`lfJson2Xml`和`lfXml2Json`两个插件，用于将json和xml进行互相转换。

