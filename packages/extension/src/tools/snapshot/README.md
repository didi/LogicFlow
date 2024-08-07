# 导出 Snapshot

我们经常需要将画布内容通过图片的形式导出来，我们提供了一个独立的插件包 `Snapshot` 来使用这个功能。

## 使用

### 1. 注册

两种注册方式，全局注册和局部注册，区别是全局注册每一个`lf`实例都可以使用。

```tsx | pure
import LogicFlow from "@logicflow/core";
import { Snapshot } from "@logicflow/extension";

// 全局注册
LogicFlow.use(Snapshot);

// 局部注册
const lf = new LogicFlow({
  ...config,
  plugins: [Snapshot]
});

```

### 2. 使用

注册后，`lf`实例身上将被挂载`getSnapshot()`方法，通过`lf.getSnapshot()`方法调用。

```tsx | pure

// 可以使用任意方式触发，然后将绘制的图形下载到本地磁盘上
document.getElementById("button").addEventListener("click", () => {
  lf.getSnapshot();

  // 或者 1.1.13版本
  // lf.extension.snapshot.getSnapshot()
});

```

值得一提的是：通过此插件截取下载的图片不会因为偏移、缩放受到影响。

## 自定义设置 css

当自定义元素在导出图片时需要额外添加 css 样式时，可以用如下方式实现：

为了保持流程图生成的图片与画布上效果一致，`snapshot`插件默认会将当前页面所有的 `css` 规则都加载到导出图片中,
但是可能会因为 css 文件跨域引起报错，参考 issue575。可以修改useGlobalRules来禁止加载所有 css
规则，然后通过`customCssRules`属性来自定义增加css样式。

```tsx

// 默认开启css样式
lf.extension.snapshot.useGlobalRules = true
// 不会覆盖css样式，会叠加，customCssRules优先级高
lf.extension.snapshot.customCssRules = `
    .uml-wrapper {
      line-height: 1.2;
      text-align: center;
      color: blue;
    }
  `

```

## API

### lf.getSnapshot(...)

导出图片。

```ts

const getSnapshot = (fileName?: string, toImageOptions?: ToImageOptions): Promise<void> => {}

```

`fileName` 为文件名称，不填为默认为`logic-flow.当前时间戳`，`ToImageOptions` 描述如下：

| 属性名             | 类型      | 默认值 | 必填 | 描述                                                                                     |
|-----------------|---------|-----|----|----------------------------------------------------------------------------------------|
| fileType        | string  | png |    | 图片类型: 默认不填是png 还可以设置有webp、gif、jpeg、svg                                                 |
| width           | number  | -   |    | 自定义导出图片的宽度，不设置即可，设置可能会拉伸图形                                                             |
| height          | number  | -   |    | 自定义导出图片的宽度，不设置即可，设置可能会拉伸图形                                                             |
| backgroundColor | string  | -   |    | 图片背景，不设置背景默认透明                                                                         |
| quality         | number  | -   |    | 图片质量，在指定图片格式为 jpeg 或 webp 的情况下，可以从 0 到 1 的区间内选择图片的质量。如果超出取值范围，将会使用默认值 0.92。其他不合法参数会被忽略 |
| padding         | number  | 40  |    | 图片内边距: 元素内容所在区之外空白空间，不设置默认有40的内边距                                                      |
| partial         | boolean | -   |    | 导出时是否开启局部渲染，false：将导出画布上所有的元素，true：只导出画面区域内的可见元素，不设置默认为lf实例身上partial值                  |

注意：

- `svg`目前暂不支持`width`，`height`， `backgroundColor`， `padding` 属性。
- 自定义宽高后，可能会拉伸图形，这时候`padding`也会被拉伸导致不准确。

### lf.getSnapshotBlob(...)

`snapshot`
除了支持图片类型导出，还支持下载<a href="https://developer.mozilla.org/zh-CN/docs/Web/API/Blob" target="_blank">
Blob文件对象 </a>
和 <a href="https://developer.mozilla.org/zh-CN/docs/Glossary/Base64" target="_blank">
Base64文本编码 </a>

获取`Blob`对象。

```ts

const getSnapshotBlob = async (
  backgroundColor?: string,
  fileType?: string
): Promise<SnapshotResponse> => {}

// example
const { data: blob } = await lf.getSnapshotBlob()
console.log(blob)

```

`backgroundColor`: 背景，不填默认为透明。

`fileType`: 文件类型，不填默认为png。

`SnapshotResponse`: 返回对象。

```tsx | pure

export type SnapshotResponse = {
  data: Blob | string // Blob对象 或 Base64文本编码文本
  width: number // 图片宽度
  height: number // 图片高度
}

```

### lf.getSnapshotBase64(...)

获取`Base64文本编码`文本。

```ts

async getSnapshotBase64(backgroundColor?: string, fileType?: string) : Promise<SnapshotResponse>

// example
const { data : base64 } = await lf.getSnapshotBlob()
console.log(base64)
