---
title: Snapshot Extension
order: 1
toc: content
---

## Introduction

The `snapshot` plugin is used to export canvas snapshots, a feature frequently used in daily operations and one of the core plugins in the LogicFlow system. Although this plugin was introduced in version `1.0`, its basic export capabilities and certain defects led to frequent feedback from the LogicFlow community. Consequently, in version `2.0`, we have significantly upgraded the plugin, enhancing its export capabilities and fixing the issue of exporting online images. This article will delve into the implementation details of the `snapshot` plugin, explaining how it presents canvas content as images.

Before diving into the implementation details of `snapshot`, it is advisable to have a basic understanding of `svg` and `canvas`. If you are not familiar with these concepts, it is recommended to review related materials to better grasp the content of this article.

Additionally, to better understand the implementation principles of `snapshot`, please review the basic usage of the [snapshot](../../tutorial/extension/snapshot.en.md) plugin and how to [customize plugins](../../tutorial/extension/custom.en.md). This will provide a solid foundation for comprehending the implementation of `snapshot`.

## 2. Registration and Usage

During plugin initialization, three methods are created: `getSnapshot`, `getSnapshotBlob`, and `getSnapshotBase64`. These methods are designed for exporting canvas images, retrieving `Blob` objects, and obtaining `base64` representations respectively.

We directly implement these three methods within the class to allow calling them via `lf.extension.snapshot.getSnapshot`. In the constructor, each method is bound to the `lf` instance, enabling invocation using `lf.getSnapshot`.

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
   * Export canvas image
   * @param fileName
   * @param toImageOptions
   */
  getSnapshot(fileName?: string, toImageOptions?: ToImageOptions) {}

  /**
   * Get Blob object
   * @param backgroundColor
   * @param fileType
   * @returns
   */
  getSnapshotBlob(backgroundColor?: string, fileType?: string) {}


  /**
   * Get base64 object
   * @param backgroundColor
   * @param fileType
   * @returns
   */
  getSnapshotBase64(backgroundColor?: string, fileType?: string) {}

}
```

## 3. Convert SVG to Canvas

The LogicFlow canvas is essentially an `svg` element where all elements reside. Our goal is to convert this `svg` into an image, `base64` data, or a `blob` object. `canvas` is the optimal choice because it provides native APIs to generate `base64` and `blob` data.

Therefore, we implement the `getCanvasData` method to achieve the conversion from `svg` to `canvas`.

```ts

/**
 * Convert SVG into an intermediate canvas object, then transform it into other desired formats
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
  // Serialize svg to base64
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

1. Create a `canvas` element.
2. Retrieve the width and height of the `svg` element and set them as the dimensions of the `canvas` element.
3. Serialize the `svg` element into a `base64` string.
4. Create an `img` element and load the `base64` string into it.
5. Draw the `img` element onto the `canvas` and return the `canvas` element.

#### Some considerations 🤔️

##### 1. Why serialize the svg into a base64 string and draw it onto the canvas using an img element?

Because `canvas` does not support direct drawing of `svg` elements, it's necessary to first serialize the `svg` element into a `base64` string, load it into an `img` element, and then draw this `img` element onto the `canvas`.

##### 2. Why generate a base64 string using canvas when svg is already serialized into base64?

The base64 string generated from `canvas` can store various types of image data (`png`, `jpeg`, etc.), whereas the initial base64 string only contains `svg` type image data. Therefore, `canvas` is used to generate the appropriate `base64` string format.

## 4. Implementing getSnapshotBase64

By calling the `getCanvasData` method to obtain the `canvas`, we then use the `canvas`'s `toDataURL` method to generate a `base64` string.

```ts
/**
 * Get base64 object
 * @param backgroundColor
 * @param fileType
 * @returns
 */
getSnapshotBase64(backgroundColor?: string, fileType?: string) {
  return new Promise((resolve) => {
    this.getCanvasData(svg).then(
      (canvas: HTMLCanvasElement) => {
        const base64 = canvas.toDataURL(`image/${fileType ?? 'png'}`)
        // Output base64 and image dimensions
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

## 5. Implementing getSnapshot

Once the `base64` is generated, we can directly use it to download the image.

```ts
/**
 * Export canvas image
 * @param fileName
 * @param toImageOptions
 */
getSnapshot(fileName?: string, toImageOptions?: ToImageOptions) {
  this.getCanvasData(svg).then(
    (canvas: HTMLCanvasElement) => {
      // Convert canvas element to base64, using image/octet-stream ensures all browsers can download correctly
      const imgUrl = canvas
        .toDataURL(`image/${fileType}`, quality)
        .replace(`image/${fileType}`, 'image/octet-stream')
      this.triggerDownload(imgUrl)
    },
  )
}

/**
 * Download image via imgUrl
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

## 6. Implementing getSnapshotBlob

By calling the `getCanvasData` method to obtain the `canvas`, we then use the `canvas`'s `toBlob` method to generate a `blob` object.

```ts
/**
 * Get Blob object
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
            // Output blob and image dimensions
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

## Conclusion

The above describes the implementation approach for the snapshot plugin. We will continue to enhance the snapshot functionality to meet more requirements. Special thanks to external open-source contributors (<a href="https://github.com/didi/LogicFlow/pull/1678" target="_blank">PR</a>). If you have any ideas or suggestions, please feel free to discuss them in the user group.

> Add WeChat ID to join the user group: logic-flow