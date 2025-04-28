---
nav: 指南
group:
  title: 插件功能
  order: 3
title: 导出图片 (Snapshot)
order: 6
toc: content
tag: 优化
---

我们常常有需要将画布内容以图片的形式导出来的情况，因此LogicFlow提供了一个独立的插件包 `Snapshot` 以支持用户将画布导出为图片。
## 用法

### 注册插件

与其他LogicFlow插件一样，Snapshot支持全局注册和局部注册两种方式：

```tsx | pure
import LogicFlow from "@logicflow/core";
import { Snapshot } from "@logicflow/extension";

// 全局注册：所有LogicFlow实例都能使用
LogicFlow.use(Snapshot);

// 局部注册：仅当前实例可用
const lf = new LogicFlow({
  ...config,
  plugins: [Snapshot]
});
```

### 基本用法

注册插件后，您可以直接通过LogicFlow实例调用导出方法：

```tsx | pure
// 导出为PNG图片并下载
lf.getSnapshot('流程图');
```

## 功能特性

在2.0版本中，我们对导出功能进行了全面升级：

- **多格式支持**：PNG、JPEG、SVG等多种格式
- **自定义背景和边距**：根据需求调整图片效果
- **局部渲染**：可选择只导出可见区域，提高效率
- **自定义样式**：支持添加CSS样式，确保导出图片风格一致

### 配置选项

导出方法支持`toImageOptions`参数，提供以下配置项：

| 属性名          | 类型    | 默认值 | 描述                                      |
| --------------- | ------- | ------ | ----------------------------------------- |
| fileType        | string  | png    | 导出格式：`png`、`webp`、`jpeg`、`svg`    |
| width           | number  | -      | 图片宽度（可能导致图形拉伸）              |
| height          | number  | -      | 图片高度（可能导致图形拉伸）              |
| backgroundColor | string  | -      | 背景色，默认透明                          |
| quality         | number  | 0.92   | 图片质量，仅对`jpeg`和`webp`有效，取值0-1 |
| padding         | number  | 40     | 内边距，单位像素                          |
| partial         | boolean | false  | 是否只导出可见区域                        |

:::warning{title=注意事项}
- 导出SVG格式的图片时不支持`width`、`height`、`backgroundColor`、`padding`属性
- 自定义宽高可能导致图形拉伸，同时影响内边距
- 导出时会自动处理宽画布情况，添加安全系数和额外边距
- 导出过程中会自动开启静默模式，禁用画布交互
- 自动将SVG中的相对路径图片转换为Base64编码<Badge type="warning">2.0.14新增</Badge> 
:::

### 自定义CSS样式

为保持导出图片与画布效果一致，插件默认加载页面所有CSS规则。如遇跨域问题，可以：

```tsx | pure
// 禁用全局CSS规则
lf.extension.snapshot.useGlobalRules = false;
// 添加自定义样式（优先级高）
lf.extension.snapshot.customCssRules = `
  .uml-wrapper {
    line-height: 1.2;
    text-align: center;
    color: blue;
  }
`
```

## API参考

### getSnapshot
导出图片并下载
```tsx | pure
lf.getSnapshot(name: string, toImageOptions?: ToImageOptions)
```

### getSnapshotBlob
获取Blob对象
```tsx | pure
lf.getSnapshotBlob(backgroundColor?: string, fileType?: string): Promise<{ data: Blob; width: number; height: number }>
// 2.0.14版本后支持的写法👇🏻
lf.getSnapshotBlob(
  backgroundColor?: string, // 兼容老写法，传入后会作为toImageOptions.backgroundColor的兜底配置
  fileType?: string, // 兼容老写法，传入后会作为toImageOptions.fileType的兜底配置
  toImageOptions?: ToImageOptions // 新增参数
)
```

### getSnapshotBase64
获取Base64字符串
```tsx | pure
lf.getSnapshotBase64(backgroundColor?: string, fileType?: string): Promise<{ data: string; width: number; height: number }>
// 2.0.14版本后支持的写法👇🏻
lf.getSnapshotBase64(
  backgroundColor?: string, // 兼容老写法，传入后会作为toImageOptions.backgroundColor的兜底配置
  fileType?: string, // 兼容老写法，传入后会作为toImageOptions.fileType的兜底配置
  toImageOptions?: ToImageOptions // 新增参数
)
```

## 使用示例

### 功能演示

<code id="react-portal" src="@/src/tutorial/extension/snapshot"></code>

### 代码示例

**基本用法：导出为PNG图片并下载**
```tsx | pure
lf.getSnapshot('流程图');
```

**高级用法：指定格式、背景色和其他选项**
```tsx | pure
lf.getSnapshot('流程图', {
  fileType: 'png',        // 可选：'png'、'webp'、'jpeg'、'svg'
  backgroundColor: '#f5f5f5',
  padding: 30,           // 内边距，单位为像素
  partial: false,        // false: 导出所有元素，true: 只导出可见区域
  quality: 0.92          // 对jpeg和webp格式有效，取值范围0-1
})
```

**导出为SVG格式**
```tsx | pure
lf.getSnapshot('流程图', {
  fileType:'svg'
  // 注意：svg格式暂不支持width、height、backgroundColor、padding属性
});
```

**获取Blob对象用于进一步处理**
```tsx | pure
const { data: blob, width, height } = await lf.getSnapshotBlob({
  fileType: 'jpeg',
  backgroundColor: '#ffffff',
  quality: 0.8
})
// 使用Blob对象创建临时URL（例如预览）
const blobUrl = URL.createObjectURL(blob);
try {
  // 使用blobUrl，例如设置为图片源
  document.getElementById('preview').src = blobUrl;
} finally {
  // 使用完毕后释放URL
  URL.revokeObjectURL(blobUrl);
}
```

**获取Base64字符串用于进一步处理**
```tsx | pure
const { data: base64 } = await lf.getSnapshotBase64({
  fileType: 'png',
  partial: true // 只导出可见区域
});
// 将Base64直接用于img标签
document.getElementById('preview').src = base64;
```

**自定义CSS样式**
```tsx | pure
lf.extension.snapshot.useGlobalRules = false; // 禁用全局CSS规则，避免跨域问题
lf.extension.snapshot.customCssRules = `
  .node-container { border: 2px solid blue; }
  .edge-text { font-weight: bold; }
  .lf-node-text { font-size: 14px; font-weight: bold; }
`;
```
**在组件组件中使用**
```tsx | pure
const downloadSnapshot = async () => {
  // 导出为图片并下载
  await lf.getSnapshot('流程图', {
    fileType: 'png',
    backgroundColor: '#ffffff',
    padding: 40
  });
};
```

**在按钮点击事件中使用**
```tsx | pure
// 在按钮点击事件中使用
document.getElementById('download-btn').addEventListener('click', async () => {
  // 显示加载状态
  showLoading();
  try {
    // 导出图片（会自动应用静默模式和其他优化）
    await lf.getSnapshot('流程图');
  } finally {
    // 隐藏加载状态
    hideLoading();
  }
});
```

**导出并上传到服务器**

```tsx | pure
// 导出为Blob并上传到服务器
async function exportAndUpload() {
  const { data: blob } = await lf.getSnapshotBlob({
    fileType: 'png',
    backgroundColor: '#ffffff'
  });
  
  const formData = new FormData();
  formData.append('file', blob, 'flowchart.png');
  
  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    const result = await response.json();
    console.log('上传成功:', result);
  } catch (error) {
    console.error('上传失败:', error);
  }
}
```

## 其他导出类型

### xml <Badge>1.0.7 新增</Badge>

LogicFlow 默认生成的数据是 json 格式，可能会有一些流程引擎需要前端提供 xml 格式数据。`@logicflow/extension`提供了`lfJson2Xml`和`lfXml2Json`两个插件，用于将 json 和 xml 进行互相转换。

```jsx | pure
import LogicFlow from "@logicflow/core";
import { lfJson2Xml, lfXml2Json } from "@logicflow/extension";

const data = {
  // ...
};

const lf = new LogicFlow({
  // ...
});

lf.render(data);

// json -> xml
const xml = lfJson2Xml(lf.getGraphData());

// xml -> json
const jsonData = lfXml2Json(xml)

```
