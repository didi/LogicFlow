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

## 导出xml

1.0.7 新增

LogicFlow默认生成的数据是json格式，可能会有一些流程引擎需要前端提供xml格式数据。`@logicflow/extension`提供了`lfJson2Xml`和`lfXml2Json`两个插件，用于将json和xml进行互相转换。

```ts
import LogicFlow from '@logicflow/core';
import { lfJson2Xml, lfXml2Json} from '@logicflow/extension';

const lf = new LogicFlow({
  // ...
})
const data = lfJson2Xml(jsonData)
lf.render(data);
const xml = lfJson2Xml(lf.getGraphData())
```

### 示例

<iframe src="https://codesandbox.io/embed/logicflow-base21-o3vqi?fontsize=14&hidenavigation=1&theme=dark&view=preview"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="logicflow-base21"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>