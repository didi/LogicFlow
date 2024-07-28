---
title: Snapshot 实现原理
order: 1
toc: content
---

## 1. 前言

`snapshot` 插件用于导出画布快照，这一功能在日常中使用非常频繁，它也是LogicFlow插件体系中的核心插件之一，虽然该插件在 `1.0` 版本中早已实现，但由于其导出能力较为基础且存在一定的导出缺陷，LogicFlow社区也经常收到关于该插件的问题反馈。为此，我们在 `2.0` 版本中对其进行了显著升级，增强了导出能力并修复了画布中在线图片无法导出缺陷，本文将深入探讨 `snapshot` 插件的实现原理，带您了解它是如何将画布内容以图片形式呈现出来的。

在深入探讨 `snapshot` 实现原理之前，建议您先对 `svg` 和 `canvas` 有一定的了解。如果您对这些概念还不熟悉，建议先阅读相关资料，以便更好地理解本文内容。

此外，为了更好地理解 `snapshot` 的实现原理，希望您能先通过阅读了解 [snapshot](../../tutorial/extension/snapshot.zh.md) 插件的基本使用和如何[自定义插件](../../tutorial/extension/custom.zh.md)，这将为您深入理解 `snapshot` 的实现提供良好的基础。

## 2. 注册使用

插件初始化的时候，分别创建 `getSnapshot`,`getSnapshotBlob`, `getSnapshotBase64` 三个方法，分别用于导出画布图片、获取 `Blob` 对象和获取 `base64` 对象。

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

## 3. 将 svg 转化为 canvas

LogicFlow画布本质是一个 `svg` 元素，所有的元素都在这个 `svg` 元素里，我们目标是将 `svg` 转化为图片、`base64` 或 `blob` 对象，`canvas` 是最佳选择，因为 `canvas` 提供了原生生成 `base64`和 `blob` 的能力`api`。

因此，我们实现 `getCanvasData` 方法：用于将 `svg` 转化为 `canvas`。

```ts

/**
 * 将 svg 转化为中间产物 canvas 对象，再转换为用户需要的其它格式
 * @param svg
 * @param toImageOptions
 * @returns
 */
getCanvasData(svg: Element, toImageOptions: ToImageOptions) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const { width, height } = svg.getBoundingClientRect()
  canvas.width = width
  canvas.height = height
  // svg 序列化为 base64
  const data = new XMLSerializer().serializeToString(svg)
  const img = new Image()
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

因为 这个 `base64` 仅仅存储着 `svg` 类型图像数据，而 `canvas` 可以生成各种类型图像数据的 `base64`，比如 `png`、`jpeg` 等，所以我们需要通过 `canvas` 来生成 `base64` 字符串。

## 4. 实现 getSnapshotBase64

通过调用 `getCanvasData` 方法得到 `canvas`，然后调用 `canvas` 上 `toDataURL` 的方法生成 `base64字符串` 。

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

## 5. 实现 getSnapshot
 
已经生成 `base64`, 我们可以直接通过 `base64` 来实现下载图片。

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

## 6. 实现 getSnapshotBlob

通过调用 `getCanvasData` 方法得到 `canvas`，然后调用 `canvas` 上 `toBlob` 的方法生成 `blob` 对象 。


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

## 最后

以上介绍了 snapshot 插件的实现方案。我们会持续提升 snapshot 的功能，以满足更多需求。同时，特别感谢外部开源者的贡献（<a href="https://github.com/didi/LogicFlow/pull/1678" target="_blank">PR</a>）。如果你有任何好的想法或建议，欢迎在用户群中交流讨论～

> 添加微信号进用户群：logic-flow