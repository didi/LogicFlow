---
title: Snapshot Extension
order: 1
toc: content
---

## Introduction

The `snapshot` plugin is used to export canvas snapshots. This feature is frequently used in daily operations and is one of the core plugins in the LogicFlow plugin system. Although this plugin was implemented in version 1.0, the export capabilities were basic and had some export issues, leading to frequent feedback from the LogicFlow community. Therefore, we made significant upgrades in version 2.0, enhancing export capabilities and fixing issues with exporting online images on the canvas. This document will explore the implementation principles of the `snapshot` plugin and demonstrate how to present the canvas content as an image.

Before diving into the `snapshot` implementation principles, it is recommended that you have a basic understanding of `svg` and `canvas`. If you are not familiar with these concepts, it is advised to read related materials to better understand the content of this document.

Additionally, to better understand the implementation principles of `snapshot`, it would be helpful to first read the basic usage of the [snapshot](../../tutorial/extension/snapshot.zh.md) plugin and how to [customize plugins](../../tutorial/extension/custom.zh.md), which will provide a good foundation for understanding the `snapshot` implementation.

## 1. Registration and Usage

When the plugin initializes, it creates three methods: `getSnapshot`, `getSnapshotBlob`, and `getSnapshotBase64`, which are used to export canvas images, get `Blob` objects, and get `base64` objects, respectively.

These methods are implemented in the class and bound to the `lf` instance in the `constructor`, allowing them to be called via `lf.getSnapshot`, `lf.getSnapshotBlob`, and `lf.getSnapshotBase64`.

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
  getSnapshot(fileName?: string, toImageOptions?: ToImageOptions) => {}

  /**
   * Get Blob object
   * @param backgroundColor
   * @param fileType
   * @returns
   */
  getSnapshotBlob(backgroundColor?: string, fileType?: string) => {}

  /**
   * Get base64 object
   * @param backgroundColor
   * @param fileType
   * @returns
   */
  getSnapshotBase64(backgroundColor?: string, fileType?: string) => {}
}
```

## 2. Converting SVG to Canvas

The LogicFlow canvas is essentially an `svg` element where all elements reside. Our goal is to convert the `svg` into an image, `base64`, or `blob` object, and `canvas` is the best choice because it provides native `base64` and `blob` generation capabilities.

Thus, we implement the `getCanvasData` method to convert `svg` to `canvas`.

```ts
/**
 * Convert SVG to Canvas
 * @param svg - SVG element
 * @param toImageOptions - Image options
 * @returns Promise<canvas> - Returns canvas object
 */
getCanvasData(svg: Element, toImageOptions: ToImageOptions) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const { width, height } = svg.getBoundingClientRect()
  canvas.width = width
  canvas.height = height
  // Serialize SVG to string: essentially HTML code text
  const data = new XMLSerializer().serializeToString(svg)
  const img = new Image()
  // Convert SVG string to base64
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
2. Get the width and height of the `svg` element and set these dimensions for the `canvas` element.
3. Serialize the `svg` element to a `base64` string.
4. Create an `img` element, set its `src` to the `base64` string, and draw the `img` element onto the `canvas`.

#### Some Thoughts 🤔️

##### 1. Why serialize SVG to a base64 string and draw it on a canvas?

Because `canvas` does not support directly drawing `svg` elements, the `svg` needs to be serialized to a `base64` string, which is then used as the `src` of an `img` element, and finally drawn onto the `canvas`.

##### 2. Why generate base64 strings via canvas when the `svg` string is already base64 encoded?

The base64 encoded string only stores `svg` type image data, while `canvas` can generate base64 strings for various image types like `png` and `jpeg`. Thus, we need `canvas` to generate base64 strings of different image types.

## 3. Implementing `getSnapshotBase64`

By calling `getCanvasData`, we obtain a `canvas` and then use the `toDataURL` method on the `canvas` to generate the `base64` string.

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
        // Output base64 as well as image width and height
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

## 4. Implementing `getSnapshot`

Having generated the `base64`, we can directly use it to download the image.

```ts
/**
 * Export canvas image
 * @param fileName
 * @param toImageOptions
 */
getSnapshot(fileName?: string, toImageOptions?: ToImageOptions) {
  this.getCanvasData(svg).then(
    (canvas: HTMLCanvasElement) => {
      // Convert canvas element to base64 and use image/octet-stream to ensure compatibility across browsers
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

## 5. Implementing `getSnapshotBlob`

By calling `getCanvasData`, we obtain a `canvas` and then use the `toBlob` method on the `canvas` to generate the `blob` object.

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
            // Output blob as well as image width and height
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

## 6. In-Depth Exploration

### 1. Exporting the Area Range

The canvas has zooming and panning capabilities, meaning exporting the entire canvas is not practical. We need to export the smallest rectangle that encompasses all elements on the canvas, as shown below:

![area](https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/article/extension/snapshot/image-g.png)

The image above shows the smallest rectangle that needs to be exported. By adjusting the drawing area on the `canvas`, we can ensure that only the important parts of the canvas are exported.

How do we ensure that only this area is drawn on the `canvas`?

To ensure only this area is drawn on the `canvas`, we:

1. Copy the `svg` element to keep the original canvas unchanged.
2. Adjust the position of the copied `svg` element to move the smallest rectangle to the top-left corner since `canvas` starts drawing from the top-left corner by default.
3. Set the drawing width and height on the `canvas` to match the width and height of the area to ensure the exported content is

 consistent.

This section only provides the general idea as understanding the source code requires some knowledge of the LogicFlow canvas structure. Interested readers can explore the source code on their own 🤗.

### 2. Image Clarity on Export

The `canvas` renders graphics as a bitmap, where the image is composed of pixels, and the physical size of pixels in a `canvas` is fixed for the same width and height. On high-resolution displays, each point requires more physical pixels, which can make the `canvas` appear blurry. To address this, we need to adjust the pixel size of the `canvas` based on different resolution displays. By adjusting the width and height of the `canvas`, we can change the physical pixel size.

Using `window.devicePixelRatio`, we can obtain the screen device pixel ratio and automatically adjust the `canvas` export width and height to match the physical pixel size for different resolution displays, thereby improving image clarity.

```ts
const dpr = window.devicePixelRatio || 1;

// bboxWidth, bboxHeight export area width and height
canvas.width = bboxWidth * dpr; // Physical pixel width
canvas.height = bboxHeight * dpr; // Physical pixel height

// Adjust the drawing context scaling:
const context = canvas.getContext('2d');
context.scale(dpr, dpr);
```

- **Clarity Enhancement**: When increasing `dpr`, you are effectively boosting the physical resolution of the `canvas`, resulting in a clearer image as each point contains more physical pixel information.

- **Balancing Clarity and File Size**: A higher `dpr` results in larger image files, which can affect performance and load times. Typically, setting `dpr` to 2 or 3 strikes a good balance between improved clarity and reasonable file size.

### 3. Online Images Not Exporting Issue

**Phenomenon**: When `svg` elements contain online images, whether as `image` SVG tags or `img` tags within `foreignObject`, these images do not appear in the exported image.

**Reason**: When serializing `svg` to `base64`, the <a href="https://developer.mozilla.org/en-US/docs/Web/API/Window/btoa" target="_blank">btoa</a> method only encodes the raw `svg` string and does not include external resources. Thus, online images are lost during this process.

**Solution**: Convert online image URLs to local `base64` addresses to ensure that image resources are not lost. This involves using `fetch` to convert the online `url` to a `blob` object, then converting the `blob` to a `base64` address.

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
    return Promise.resolve(url); // Return original URL to continue processing in case of error
  });
```

### 4. Injecting CSS Styles

Styles Loss: For exporting `svg`, we serialize the `svg` and convert it to an image. As a result, external styles defined outside are not included and are therefore lost.

How to inject?

Embed all related `css` styles directly into the `svg` file to ensure that these styles are included during the serialization.

```ts
/**
 * Get script CSS styles
 * @returns
 */
private getClassRules(): string {
  let rules = ''
  if (this.useGlobalRules) {
    const { styleSheets } = document
    for (let i = 0; i < styleSheets.length; i++) {
      const sheet = styleSheets[i]
      // Filter out CSS scripts from different origins to avoid errors
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

// Inject CSS styles
const style = document.createElement('style')
style.innerHTML = this.getClassRules()
const foreignObject = document.createElement('foreignObject')
foreignObject.appendChild(style)
svg.appendChild(foreignObject)
```

## Conclusion

In summary, the `snapshot` plugin exports images by converting `svg` to `canvas` and using the `toDataURL` and `toBlob` methods of `canvas` to export the image. This document outlines the implementation plan and core code of the `snapshot` plugin. We will continue to enhance the `snapshot` functionality to meet more needs. Special thanks to external contributors (see <a href="https://github.com/didi/LogicFlow/pull/1678" target="_blank">PR</a>). If you have any ideas or suggestions, feel free to discuss them in the user group!

> Add WeChat ID to join the user group: logic-flow