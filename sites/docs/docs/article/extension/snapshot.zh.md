---
title: Snapshot 实现原理
order: 1
toc: content
---

## 前言

`snapshot` 插件用于导出画布快照，这一功能在日常中使用非常频繁，也是 LogicFlow 插件体系中的核心插件之一。尽管该插件在 1.0 版本中已实现，但因导出能力较为基础且存在一些导出缺陷，LogicFlow 社区频繁收到相关反馈。为此，我们在 2.0 版本中对其进行了显著升级，增强了导出能力并修复了画布中在线图片无法导出的问题。本文将深入探讨 `snapshot` 插件的实现原理，并展示如何将画布内容以图片形式呈现出来。

在深入探讨 `snapshot` 实现原理之前，建议您先对 `svg` 和 `canvas` 有一定的了解。如果您对这些概念还不熟悉，建议先阅读相关资料，以便更好地理解本文内容。

此外，为了更好地理解 `snapshot` 的实现原理，希望您能先通过阅读了解 [snapshot](../../tutorial/extension/snapshot.zh.md) 插件的基本使用和如何[自定义插件](../../tutorial/extension/custom.zh.md)，这将为您深入理解 `snapshot` 的实现提供良好的基础。

## 1. 注册使用

插件初始化的时候，分别创建 `getSnapshot` , `getSnapshotBlob` , `getSnapshotBase64` 三个方法，分别用于导出画布图片、获取 `Blob` 对象和获取 `base64` 对象。

我们直接在类中创建的三个方法实现了通过 `lf.extension.snapshot.getSnapshot` 这种方式调用，在 `constructor` 中分别将三个方法绑定到 `lf` 实例上，这样我们也可以通过 `lf.getSnapshot` 这种方式调用。

```ts

class Snapshot {
  static pluginName = 'snapshot'
  lf: LogicFlow

  constructor({ lf }) {
    this.lf = lf

    lf.getSnapshot = (fileName?: string, toImageOptions?: ToImageOptions) => { 
      this.getSnapshot(fileName, toImageOptions)
    }

    lf.getSnapshotBlob = (fileName?: string, toImageOptions?: ToImageOptions) => {
      this.getSnapshotBlob(fileName, toImageOptions)
    }

    lf.getSnapshotBase64 = (fileName?: string, toImageOptions?: ToImageOptions) => {
      this.getSnapshotBase64(fileName, toImageOptions)
    }
  }

  /**
   * 导出画布图片
   * @param fileName
   * @param toImageOptions
   */
  getSnapshot(fileName?: string, toImageOptions?: ToImageOptions) => {}

  /**
   * 获取Blob对象
   * @param backgroundColor
   * @param fileType
   * @returns
   */
  getSnapshotBlob(backgroundColor?: string, fileType?: string) => {}

  /**
   * 获取base64对象
   * @param backgroundColor
   * @param fileType
   * @returns
   */
  getSnapshotBase64(backgroundColor?: string, fileType?: string) => {}

}

```

## 2. 将 svg 转化为 canvas

LogicFlow画布本质是一个 `svg` 元素，所有的元素都在这个 `svg` 元素里，我们目标是将 `svg` 转化为图片、 `base64` 或 `blob` 对象， `canvas` 是最佳选择，因为 `canvas` 提供了原生生成 `base64` 和 `blob` 的能力 `api` 方法。

因此，我们实现 `getCanvasData` 方法：用于将 `svg` 转化为 `canvas` 。

```ts

/**
 * 将 svg 转化为 canvas
 * @param svg - svg 元素
 * @param toImageOptions - 图像选项
 * @returns Promise<canvas> - 返回 canvas 对象
 */
getCanvasData(svg: Element, toImageOptions: ToImageOptions) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const { width, height } = svg.getBoundingClientRect()
  canvas.width = width
  canvas.height = height
  // svg 序列化为string：其实就是html代码文本 
  const data = new XMLSerializer().serializeToString(svg)
  const img = new Image()
  // svg string 转化为 base64
  img.src = `data:image/svg+xml;base64,${btoa(data)}`
  return new Promise((resolve) => {
    img.onload = () => {
      ctx.drawImage(img, 0, 0)
      resolve(canvas)
    }
  })
}

```

1. 先创建 `canvas` 元素。
2. 获取 `svg` 元素宽高，将其设置为 `canvas` 元素宽高。
3. 将 `svg` 元素序列化为 `base64` 字符串。
4. 创建 `img` 元素，将 `base64` 字符串挂载到 `img` 上。
4. 将 `img` 元素绘制到 `canvas` 中，并返回 `canvas` 元素。

#### 一些思考🤔️

##### 1. 为什么要将 svg 序列化为 base64 字符串，通过 img 绘制到 canvas 中呢？

因为 `canvas` 不支持直接绘制 `svg` 元素，所以需要先将 `svg` 元素序列化为 `base64` 字符串，挂载到 `img` 元素上，再把 `img` 绘制到 `canvas` 中。

##### 2. 已经将 svg 元素序列化为 base64 字符串，为什么还需要通过 canvas 生成 base64 字符串？

因为 这个 `base64` 仅仅存储着 `svg` 类型图像数据，而 `canvas` 可以生成各种类型图像数据的 `base64` ，比如 `png` 、 `jpeg` 等，所以我们需要通过 `canvas` 来生成多种图像类型的 `base64` 字符串。

## 3. 实现 getSnapshotBase64

通过调用 `getCanvasData` 方法得到 `canvas` ，然后调用 `canvas` 上 `toDataURL` 的方法生成 `base64字符串` 。

```ts
/**
 * 获取base64对象
 * @param backgroundColor
 * @param fileType
 * @returns
 */
getSnapshotBase64(backgroundColor?: string, fileType?: string) {
  return new Promise((resolve) => {
    this.getCanvasData(svg).then(
      (canvas: HTMLCanvasElement) => {
        const base64 = canvas.toDataURL(`image/${fileType ?? 'png'}`)
        // 输出 base64 以及图片宽高
        resolve({
          data: base64,
          width: canvas.width,
          height: canvas.height,
        })
      },
    )
  })
}

```

## 4. 实现 getSnapshot

 
已经生成 `base64` , 我们可以直接通过 `base64` 来实现下载图片。

```ts

/**
 * 导出画布图片
 * @param fileName
 * @param toImageOptions
 */
getSnapshot(fileName?: string, toImageOptions?: ToImageOptions) {
  this.getCanvasData(svg).then(
    (canvas: HTMLCanvasElement) => {
      // canvas元素 => base64   image/octet-stream: 确保所有浏览器都能正常下载
      const imgUrl = canvas
        .toDataURL(`image/${fileType}`, quality)
        .replace(`image/${fileType}`, 'image/octet-stream')
      this.triggerDownload(imgUrl)
    },
  )
}

/**
 * 通过 imgUrl 下载图片
 * @param imgUrl
 */
private triggerDownload(imgUrl: string) {
  const evt = new MouseEvent('click', {
    view: document.defaultView,
    bubbles: false,
    cancelable: true,
  })
  const a = document.createElement('a')
  a.setAttribute('download', this.fileName!)
  a.setAttribute('href', imgUrl)
  a.setAttribute('target', '_blank')
  a.dispatchEvent(evt)
}

```

## 5. 实现 getSnapshotBlob

通过调用 `getCanvasData` 方法得到 `canvas` ，然后调用 `canvas` 上 `toBlob` 的方法生成 `blob` 对象 。

```ts

/**
 * 获取Blob对象
 * @param backgroundColor
 * @param fileType
 * @returns
 */
getSnapshotBlob(backgroundColor?: string, fileType?: string){
  return new Promise((resolve) => {
    this.getCanvasData(svg).then(
      (canvas: HTMLCanvasElement) => {
        canvas.toBlob(
          (blob) => {
            // 输出 blob 以及图片宽高
            resolve({
              data: blob!,
              width: canvas.width,
              height: canvas.height,
            })
          },
          `image/${fileType ?? 'png'}`,
        )
      },
    )
  })
}

```

## 6. 深入探究

### 1. 导出区域范围

画布具有放大缩小、平移能力，意味着导出整张画布是不现实的，我们只需要导出画布上元素集中在的一个最小矩形区域，如下图：

![area](https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/article/extension/snapshot/image-g.png)

上图展示了需要导出的最小矩形区域。通过调整 `canvas` 的绘制区域，我们可以确保只导出画布上重要的部分。

那怎么实现只在 `canvas` 上绘制该区域的？

为了确保只在 `canvas` 上绘制该区域，我们会：

1. 复制 `svg` 元素：保持原始 `svg` 画布不变。
2. 调整区域位置：将复制后的 `svg` 元素中最小矩形区域平移到左上角，因为 `canvas` 默认从左上角开始绘制。
3. 设置绘制宽高：在 `canvas` 上设置绘制的宽高等于该区域的宽高，确保导出内容一致。

这里只提及思路，因为理解源码需要对 LogicFlow 画布层次结构有一定认知，感兴趣的小伙伴可以自行阅读源码🤗。

### 2. 导出图片清晰度

`canvas` 绘制的图形是位图，位图图像由像素构成，同一宽高的 `canvas` 物理像素大小是固定的。在高分辨率显示屏上，每个点需要更多物理像素，因而 `canvas` 会显得模糊，所以我们需要根据不同分辨率显示器来调整 `canvas` 像素大小，调整 `canvas` 宽高就可以调整物理像素大小。

通过 `window.devicePixelRatio` 获取屏幕设备像素比，根据设备像素比自动调整 `canvas` 的导出宽高以调整物理像素大小来适配不同分辨率显示屏的图片清晰度。

```ts

const dpr = window.devicePixelRatio || 1;

// bboxWidth、bboxHeight 导出区域宽高
canvas.width = bboxWidth * dpr; // 物理像素宽度
canvas.height = bboxHeight * dpr; // 物理像素高度

// 调整绘图上下文的缩放：
const context = canvas.getContext('2d');
context.scale(dpr, dpr);

```

- **清晰度提升**: 当 `dpr` 增大时，你实际上是在提升 `canvas` 的物理分辨率，这样绘制的 `canvas` 的图像会更加清晰，因为每个点包含更多的物理像素信息。

- **平衡清晰度和文件大小**: 较大的 `dpr` 会导致生成的图片文件更大，这可能会影响性能和加载时间。通常，设置 `dpr` 为 2 或 3 可以获得较好的清晰度和合理的文件大小平衡。

### 3. 在线图片无法导出问题

**现象**： `svg` 元素中含有在线图片，不论是 `image` 原生 `svg` 图像标签，还是 `foreignObject` 中的 `img` 图像标签，导出图片后这些在线图片都会消失。

**原因**：在我们将 `svg` 序列化为 `base64` 时，<a href="https://developer.mozilla.org/zh-CN/docs/Web/API/Window/btoa" target="_blank">btoa</a> 方法只将原始的 `svg` 字符串进行编码，不会将外部资源嵌入到 `base64` 数据中。换句话说，外部图像不会被自动下载并嵌入到这个 `base64` 编码的 `svg` 数据中，在线图片也就是在这个时候丢失的。

**解决**：将在线图片 `url` 转化为本地 `base64` 地址，这样图片资源就不丢失了。这里借助 `fetch` 将在线 `url` 转化为 `blob` 对象，再将 `blob` 对象转化为 `base64` 地址。

```ts

fetch(url)
  .then(response => {
    return response.blob();
  })
  .then(blob => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    })
  })
  .catch(error => {
    return Promise.resolve(url); // 返回原始 URL 以防出错时继续处理
  });

```

### 4. 注入 css 样式

样式丢失：对于导出 `svg`，是直接将 `svg` 序列化，然后转成图片来处理的。这样一来，定义在外部的样式序列化时无法携带，自然也就丢失了。

那么如何注入？

将所有相关的 `css` 样式直接内嵌到 `svg` 文件中。这样可以确保在序列化 `svg` 时，这些样式也会被包含进去.

```ts

/**
 * 获取脚本 css 样式
 * @returns
 */
private getClassRules(): string {
  let rules = ''
  if (this.useGlobalRules) {
    const { styleSheets } = document
    for (let i = 0; i < styleSheets.length; i++) {
      const sheet = styleSheets[i]
      // 这里是为了过滤掉不同源 css 脚本，防止报错终止导出
      try {
        for (let j = 0; j < sheet.cssRules.length; j++) {
          rules += sheet.cssRules[j].cssText
        }
      } catch (error) {
        console.log(
          'CSS scripts from different sources have been filtered out',
        )
      }
    }
  }
  if (this.customCssRules) {
    rules += this.customCssRules
  }
  return rules
}

// 注入 css 样式
const style = document.createElement('style')
style.innerHTML = this.getClassRules()
const foreignObject = document.createElement('foreignObject')
foreignObject.appendChild(style)
svg.appendChild(foreignObject)

```

## 最后

总结一下，`snapshot` 插件通过将 `svg` 转化为 `canvas`，并使用 `canvas` 的 `toDataURL` 和 `toBlob` 方法来导出图像，以上就是 `snapshot` 插件的实现方案和核心源码。我们会持续提升 `snapshot` 的功能，以满足更多需求。同时，特别感谢外部开源者的贡献（<a href="https://github.com/didi/LogicFlow/pull/1678" target="_blank">PR</a>）。如果你有任何好的想法或建议，欢迎在用户群中交流讨论～

> 添加微信号进用户群：logic-flow
