/**
 * 快照插件，生成视图
 */
export class Snapshot {
  static pluginName = 'snapshot'
  lf: any
  offsetX?: number
  offsetY?: number
  fileName: string = 'snapshot.png'
  customCssRules: string
  useGlobalRules: boolean

  constructor({ lf }) {
    this.lf = lf
    this.customCssRules = ''
    this.useGlobalRules = true
    /* 下载快照 */
    lf.getSnapshot = (fileName: string, backgroundColor: string) => {
      this.getSnapshot(fileName, backgroundColor)
    }
    /* 获取Blob对象，用户图片上传 */
    lf.getSnapshotBlob = (backgroundColor: string) =>
      this.getSnapshotBlob(backgroundColor)
    /* 获取Base64对象，用户图片上传 */
    lf.getSnapshotBase64 = (backgroundColor: string) =>
      this.getSnapshotBase64(backgroundColor)
  }

  /* 获取svgRoot对象 */
  getSvgRootElement(lf) {
    const svgRootElement = lf.container.querySelector('.lf-canvas-overlay')
    return svgRootElement
  }

  triggerDownload(imgURI: string) {
    const evt = new MouseEvent('click', {
      view: document.defaultView,
      bubbles: false,
      cancelable: true,
    })
    const a = document.createElement('a')
    a.setAttribute('download', this.fileName)
    a.setAttribute('href', imgURI)
    a.setAttribute('target', '_blank')
    a.dispatchEvent(evt)
  }

  removeAnchor(element) {
    const { childNodes } = element
    let childLength = element.childNodes && element.childNodes.length
    for (let i = 0; i < childLength; i++) {
      const child = childNodes[i] as SVGGraphicsElement
      const classList = (child.classList && Array.from(child.classList)) || []
      if (classList.indexOf('lf-anchor') > -1) {
        element.removeChild(element.childNodes[i])
        childLength--
        i--
      }
    }
  }

  removeRotateControl(element) {
    const { childNodes } = element
    let childLength = element.childNodes && element.childNodes.length
    for (let i = 0; i < childLength; i++) {
      const child = childNodes[i] as SVGGraphicsElement
      const classList = (child.classList && Array.from(child.classList)) || []
      if (classList.indexOf('lf-rotate-control') > -1) {
        element.removeChild(element.childNodes[i])
        childLength--
        i--
      }
    }
  }

  /* 下载图片 */
  async getSnapshot(fileName: string, backgroundColor: string) {
    this.fileName = fileName || `logic-flow.${Date.now()}.png`
    const svg = this.getSvgRootElement(this.lf)
    await updateImageSource(svg)
    this.getCanvasData(svg, backgroundColor).then(
      (canvas: HTMLCanvasElement) => {
        const imgURI = canvas
          .toDataURL('image/png')
          .replace('image/png', 'image/octet-stream')
        this.triggerDownload(imgURI)
      },
    )
  }

  /* 获取base64对象 */
  async getSnapshotBase64(backgroundColor: string) {
    const svg = this.getSvgRootElement(this.lf)
    await updateImageSource(svg)
    return new Promise((resolve) => {
      this.getCanvasData(svg, backgroundColor).then(
        (canvas: HTMLCanvasElement) => {
          const base64 = canvas.toDataURL('image/png')
          // 输出图片数据以及图片宽高
          resolve({
            data: base64,
            width: canvas.width,
            height: canvas.height,
          })
        },
      )
    })
  }

  /* 获取Blob对象 */
  async getSnapshotBlob(backgroundColor: string) {
    const svg = this.getSvgRootElement(this.lf)
    await updateImageSource(svg)
    return new Promise((resolve) => {
      this.getCanvasData(svg, backgroundColor).then(
        (canvas: HTMLCanvasElement) => {
          canvas.toBlob((blob) => {
            // 输出图片数据以及图片宽高
            resolve({
              data: blob,
              width: canvas.width,
              height: canvas.height,
            })
          }, 'image/png')
        },
      )
    })
  }

  getClassRules() {
    let rules = ''
    if (this.useGlobalRules) {
      const { styleSheets } = document
      for (let i = 0; i < styleSheets.length; i++) {
        const sheet = styleSheets[i]
        for (let j = 0; j < sheet.cssRules.length; j++) {
          rules += sheet.cssRules[j].cssText
        }
      }
    }
    if (this.customCssRules) {
      rules += this.customCssRules
    }
    return rules
  }

  // 获取图片生成中中间产物canvas对象，用户转换为其他需要的格式
  getCanvasData(
    svg: SVGGraphicsElement,
    backgroundColor: string,
  ): Promise<any> {
    // TODO: 确认返回 Promise 的类型
    const copy = svg.cloneNode(true)
    const graph = copy.lastChild
    let childLength = graph?.childNodes?.length
    if (childLength) {
      for (let i = 0; i < childLength; i++) {
        const lfLayer = graph?.childNodes[i] as SVGGraphicsElement
        // 只保留包含节点和边的基础图层进行下载，其他图层删除
        const layerClassList =
          lfLayer.classList && Array.from(lfLayer.classList)
        if (layerClassList && layerClassList.indexOf('lf-base') < 0) {
          graph?.removeChild(graph.childNodes[i])
          childLength--
          i--
        } else {
          // 删除锚点
          const lfBase = graph?.childNodes[i]
          lfBase &&
            lfBase.childNodes.forEach((item) => {
              const element = item as SVGGraphicsElement
              this.removeAnchor(element.firstChild)
              this.removeRotateControl(element.firstChild)
            })
        }
      }
    }
    let dpr = window.devicePixelRatio || 1
    if (dpr < 1) {
      // https://github.com/didi/LogicFlow/issues/1222
      // canvas.width = bboxWidth * dpr配合ctx.scale(dpr, dpr)是为了解决绘制模糊
      // 比如dpr=2，先让canvas.width放大到等同于屏幕的物理像素宽高，然后自适应缩放适配canvas.style.width
      // 由于所有元素都缩放了一半，因此需要ctx.scale(dpr, dpr)放大2倍整体绘制的内容
      // 当用户缩放浏览器时，window.devicePixelRatio会随着变小
      // 当window.devicePixelRatio变小到一定程度，会导致canvas.width<canvas.style.width
      // 由于导出图片的svg的大小是canvas.style.width+canvas.style.height
      // 因此会导致导出的svg图片无法完整绘制到canvas（因为canvas.width小于svg的宽）
      // 从而导致canvas导出图片是缺失的svg
      // 而dpr>=1就能保证canvas.width>=canvas.style.width
      // 当dpr小于1的时候，我们强制转化为1，并不会产生绘制模糊等问题
      dpr = 1
    }
    const canvas = document.createElement('canvas')
    /*
    为了计算真实宽高需要取图的真实dom
    真实dom存在缩放影响其宽高数值
    在得到真实宽高后除以缩放比例即可得到正常宽高
    */
    const base = this.lf.graphModel.rootEl.querySelector('.lf-base')
    const bbox = (base as Element).getBoundingClientRect()
    const layout = this.lf.container
      .querySelector('.lf-canvas-overlay')
      .getBoundingClientRect()
    const offsetX = bbox.x - layout.x
    const offsetY = bbox.y - layout.y
    const { graphModel } = this.lf
    const { transformModel } = graphModel
    const { SCALE_X, SCALE_Y, TRANSLATE_X, TRANSLATE_Y } = transformModel
    // offset值加10，保证图形不会紧贴着下载图片的左边和上边
    ;(copy.lastChild as SVGGElement).style.transform = `matrix(1, 0, 0, 1, ${
      (-offsetX + TRANSLATE_X) * (1 / SCALE_X) + 10
    }, ${(-offsetY + TRANSLATE_Y) * (1 / SCALE_Y) + 10})`
    const bboxWidth = Math.ceil(bbox.width / SCALE_X)
    const bboxHeight = Math.ceil(bbox.height / SCALE_Y)
    // width,height 值加40，保证图形不会紧贴着下载图片的右边和下边
    canvas.style.width = `${bboxWidth}px`
    canvas.style.height = `${bboxHeight}px`
    canvas.width = bboxWidth * dpr + 80
    canvas.height = bboxHeight * dpr + 80
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.scale(dpr, dpr)
      // 如果有背景色，设置流程图导出的背景色
      if (backgroundColor) {
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, bboxWidth * dpr + 80, bboxHeight * dpr + 80)
      } else {
        ctx.clearRect(0, 0, bboxWidth, bboxHeight)
      }
    }
    const img = new Image()
    const style = document.createElement('style')
    style.innerHTML = this.getClassRules()
    const foreignObject = document.createElement('foreignObject')
    foreignObject.appendChild(style)
    copy.appendChild(foreignObject)
    return new Promise((resolve) => {
      img.onload = () => {
        const isFirefox = navigator.userAgent.indexOf('Firefox') > -1
        try {
          if (isFirefox) {
            createImageBitmap(img, {
              resizeWidth: canvas.width,
              resizeHeight: canvas.height,
            }).then((imageBitmap) => {
              // 在回调函数中使用 drawImage() 方法绘制图像
              ctx?.drawImage(imageBitmap, 0, 0)
              resolve(canvas)
            })
          } else {
            ctx?.drawImage(img, 0, 0)
            resolve(canvas)
          }
        } catch (e) {
          ctx?.drawImage(img, 0, 0)
          resolve(canvas)
        }
      }
      /*
      因为svg中存在dom存放在foreignObject元素中
      SVG图形转成img对象
      todo: 会导致一些清晰度问题这个需要再解决
      fixme: XMLSerializer的中的css background url不会下载图片
      */
      const svg2Img = `data:image/svg+xml;charset=utf-8,${new XMLSerializer().serializeToString(
        copy,
      )}`
      const imgSrc = svg2Img
        .replace(/\n/g, '')
        .replace(/\t/g, '')
        .replace(/#/g, '%23')
      img.src = imgSrc
    })
  }
}

export default Snapshot

/**
 * 图片缓存, 已请求过的图片直接从缓存中获取
 */
const imageCache: Record<string, string> = {}

/**
 * 当获取图片失败时会返回失败信息，是 text/plain 类型的数据
 * @param str - 图片内容
 * @returns
 */
function isTextPlainBase64(str: string) {
  return str.startsWith('data:text/plain')
}

/**
 * 将网络图片转为 base64
 * @param url - 图片地址
 * @returns
 */
async function convertImageToBase64(url: string): Promise<string> {
  if (imageCache[url]) {
    return imageCache[url]
  }
  try {
    return fetch(url)
      .then((response) => response.blob())
      .then(
        (blob) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => {
              resolve((imageCache[url] = reader.result as string))
            }
            reader.onerror = reject
            reader.readAsDataURL(blob)
          }),
      )
  } catch (error) {
    // 如果转换失败，后续大概率仍然会失败，因此直接缓存
    return (imageCache[url] = url)
  }
}

/**
 * 使用 base64 的图片替换 img 标签的 src 或 image 标签的 href
 * @param node - html 节点或 svg 节点
 */
async function updateImageSrcOrHrefWithBase64Image(
  node: HTMLImageElement | SVGImageElement,
  attrName: 'src' | 'href',
) {
  try {
    const url = node.getAttribute(attrName) || ''
    // 已经是 base64 图片，不需要处理
    if (url.startsWith('data:')) {
      return
    }
    const base64Image = await convertImageToBase64(url)
    if (isTextPlainBase64(base64Image)) {
      return
    }
    node.setAttribute(attrName, base64Image)
  } catch (error) {
    console.error(error)
  }
}

/**
 * 使用 base64 的图片替换背景图片
 * @param node - html 节点
 * @param styleAttr - 样式属性名称
 */
async function updateBackgroundImageWithBase64Image(
  node: HTMLElement,
  url: string,
) {
  try {
    // 已经是 base64 图片，不需要处理
    if (url.startsWith('data:')) {
      return
    }
    const base64Image = await convertImageToBase64(url)
    if (isTextPlainBase64(base64Image)) {
      return
    }
    node.style.backgroundImage = `url(${base64Image})`
  } catch (error) {
    console.error(error)
  }
}

/**
 * 更新图片数据
 * @param node - 节点
 */
async function updateImageSource(node: HTMLElement | SVGElement) {
  const nodes = [node]
  let nodePtr
  const promises: any[] = []
  while (nodes.length) {
    nodePtr = nodes.shift()
    if (nodePtr.children.length) {
      nodes.push(...nodePtr.children)
    }
    if (nodePtr instanceof HTMLElement) {
      // 如果有 style 的 background, backgroundImage 属性中有 url(xxx), 尝试替换为 base64 图片
      const { background, backgroundImage } = nodePtr.style
      const backgroundUrlMatch = background.match(/url\(["']?(.*?)["']?\)/)
      if (backgroundUrlMatch && backgroundUrlMatch[1]) {
        const imageUrl = backgroundUrlMatch[1]
        promises.push(updateBackgroundImageWithBase64Image(nodePtr, imageUrl))
      }
      const backgroundImageUrlMatch = backgroundImage.match(
        /url\(["']?(.*?)["']?\)/,
      )
      if (backgroundImageUrlMatch && backgroundImageUrlMatch[1]) {
        const imageUrl = backgroundImageUrlMatch[1]
        promises.push(updateBackgroundImageWithBase64Image(nodePtr, imageUrl))
      }
    }
    // 如果有 img 和 image 标签，尝试将 src 和 href 替换为 base64 图片
    if (nodePtr instanceof HTMLImageElement) {
      promises.push(updateImageSrcOrHrefWithBase64Image(nodePtr, 'src'))
    } else if (nodePtr instanceof SVGImageElement) {
      promises.push(updateImageSrcOrHrefWithBase64Image(nodePtr, 'href'))
    }
  }
  await Promise.all(promises)
}
