import LogicFlow from '@logicflow/core'
import { updateImageSource, copyCanvas } from './utils'

// 导出图片
export type ToImageOptions = {
  /**
   * 导出图片的格式，可选值为：`png`、`webp`、`jpeg`、`svg`，默认值为 `png`
   */
  fileType?: string
  /**
   * 导出图片的宽度，通常无需设置，设置后可能会拉伸图形
   */
  width?: number
  /**
   * 导出图片的高度，通常无需设置，设置后可能会拉伸图形
   */
  height?: number
  /**
   * 导出图片的背景色，默认为透明
   */
  backgroundColor?: string
  /**
   * 导出图片的质量。
   *
   * 在指定图片格式为 `jpeg` 或 `webp` 的情况下，可以从 0 到 1 的区间内选择图片的质量，如果超出取值范围，将会使用默认值 0.92。导出为其他格式的图片时，该参数会被忽略。
   */
  quality?: number
  /**
   * 导出图片的内边距，即元素内容所在区域边界与图片边界的距离，单位为像素，默认为 40
   */
  padding?: number
  /**
   * 导出图片时是否开启局部渲染
   * - `false`：将导出画布上所有的元素
   * - `true`：只导出画面区域内的可见元素
   */
  partial?: boolean
}

// Blob | base64
export type SnapshotResponse = {
  data: Blob | string
  width: number
  height: number
}

/**
 * 快照插件，生成视图
 */
export class Snapshot {
  static pluginName = 'snapshot'
  lf: LogicFlow
  offsetX?: number
  offsetY?: number
  fileName?: string // 默认是 logic-flow.当前时间戳
  customCssRules: string
  useGlobalRules: boolean

  constructor({ lf }) {
    this.lf = lf
    this.customCssRules = ''
    this.useGlobalRules = true

    // TODO: 设置fileType为gif但是下载下来的还是png
    // TODO: 完善静默模式不允许添加、操作元素能力
    /* 导出画布快照 */
    lf.getSnapshot = async (
      fileName?: string,
      toImageOptions?: ToImageOptions,
    ) => await this.getSnapshot(fileName, toImageOptions)

    /* 获取Blob对象 */
    lf.getSnapshotBlob = async (
      backgroundColor?: string, // 兼容老的使用方式
      fileType?: string,
      toImageOptions?: ToImageOptions,
    ) => await this.getSnapshotBlob(backgroundColor, fileType, toImageOptions)

    /* 获取Base64对象 */
    lf.getSnapshotBase64 = async (
      backgroundColor?: string, // 兼容老的使用方式
      fileType?: string,
      toImageOptions?: ToImageOptions,
    ) => await this.getSnapshotBase64(backgroundColor, fileType, toImageOptions)
  }

  /**
   * 获取svgRoot对象dom: 画布元素（不包含grid背景）
   * @param lf
   * @returns
   */
  private getSvgRootElement(lf: LogicFlow) {
    const svgRootElement = lf.container.querySelector('.lf-canvas-overlay')!
    return svgRootElement
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

  /**
   * 删除锚点
   * @param element
   */
  private removeAnchor(element: ChildNode) {
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

  /**
   * 删除旋转按钮
   * @param element
   */
  private removeRotateControl(element: ChildNode) {
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

  /**
   * 将图片转换为base64格式
   * @param url - 图片URL
   * @returns Promise<string> - base64字符串
   */
  private async convertImageToBase64(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous' // 处理跨域问题
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0)
        const base64 = canvas.toDataURL('image/png')
        resolve(base64)
      }
      img.onerror = () => {
        reject(new Error(`Failed to load image: ${url}`))
      }
      img.src = url
    })
  }

  /**
   * 检查URL是否为相对路径
   * @param url - 要检查的URL
   * @returns boolean - 是否为相对路径
   */
  private isRelativePath(url: string): boolean {
    return (
      !url.startsWith('data:') &&
      !url.startsWith('http://') &&
      !url.startsWith('https://') &&
      !url.startsWith('//')
    )
  }

  /**
   * 处理SVG中的图片元素
   * @param element - SVG元素
   */
  private async processImages(element: Element): Promise<void> {
    // 处理image元素
    const images = element.getElementsByTagName('image')
    for (let i = 0; i < images.length; i++) {
      const image = images[i]
      const href =
        image.getAttributeNS('http://www.w3.org/1999/xlink', 'href') ||
        image.getAttribute('href')
      if (href && this.isRelativePath(href)) {
        try {
          const base64 = await this.convertImageToBase64(href)
          image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', base64)
          image.setAttribute('href', base64)
        } catch (error) {
          console.warn(`Failed to convert image to base64: ${href}`, error)
        }
      }
    }

    // 处理foreignObject中的img元素
    const foreignObjects = element.getElementsByTagName('foreignObject')
    for (let i = 0; i < foreignObjects.length; i++) {
      const foreignObject = foreignObjects[i]
      const images = foreignObject.getElementsByTagName('img')
      for (let j = 0; j < images.length; j++) {
        const image = images[j]
        const src = image.getAttribute('src')
        if (src && this.isRelativePath(src)) {
          try {
            const base64 = await this.convertImageToBase64(src)
            image.setAttribute('src', base64)
          } catch (error) {
            console.warn(`Failed to convert image to base64: ${src}`, error)
          }
        }
      }
    }
  }

  /**
   * 克隆并处理画布节点
   * @param svg
   * @returns
   */
  private async cloneSvg(
    svg: Element,
    addStyle: boolean = true,
  ): Promise<Node> {
    const copy = svg.cloneNode(true) as Element
    const graph = copy.lastChild as Element
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
              this.removeAnchor(element.firstChild!)
              this.removeRotateControl(element.firstChild!)
            })
        }
      }
    }

    // 处理图片路径
    await this.processImages(copy)

    // 设置css样式
    if (addStyle) {
      const style = document.createElement('style')
      style.innerHTML = this.getClassRules()
      const foreignObject = document.createElement('foreignObject')
      foreignObject.appendChild(style)
      copy.appendChild(foreignObject)
    }
    return copy
  }

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

  /**
   * 将 svg 转化为 canvas
   * @param svg - svg 元素
   * @param toImageOptions - 图像选项
   * @returns Promise<canvas> - 返回 canvas 对象
   */
  private async getCanvasData(
    svg: Element,
    toImageOptions: ToImageOptions,
  ): Promise<HTMLCanvasElement> {
    const { width, height, backgroundColor, padding = 40 } = toImageOptions
    const copy = await this.cloneSvg(svg, false)

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
    /*
    为了计算真实宽高需要取图的真实dom
    真实dom存在缩放影响其宽高数值
    在得到真实宽高后除以缩放比例即可得到正常宽高
    */

    const base = this.lf.graphModel.rootEl.querySelector('.lf-base')
    const bbox = (base as Element).getBoundingClientRect()
    const layoutCanvas = this.lf.container.querySelector('.lf-canvas-overlay')!
    const layout = layoutCanvas.getBoundingClientRect()
    const offsetX = bbox.x - layout.x
    const offsetY = bbox.y - layout.y
    const { graphModel } = this.lf
    const { transformModel } = graphModel
    const { SCALE_X, SCALE_Y, TRANSLATE_X, TRANSLATE_Y } = transformModel

    // 计算实际宽高，考虑缩放因素
    // 在宽画布情况下，getBoundingClientRect可能无法获取到所有元素的边界
    // 因此我们添加一个安全系数来确保能够容纳所有元素
    const safetyFactor = 1.1 // 安全系数，增加20%的空间
    const actualWidth = (bbox.width / SCALE_X) * safetyFactor
    const actualHeight = (bbox.height / SCALE_Y) * safetyFactor

    // 将导出区域移动到左上角，canvas 绘制的时候是从左上角开始绘制的
    // 在transform矩阵中加入padding值，确保左侧元素不会被截断
    ;(copy.lastChild as SVGElement).style.transform = `matrix(1, 0, 0, 1, ${
      (-offsetX + TRANSLATE_X) * (1 / SCALE_X) + padding / dpr
    }, ${(-offsetY + TRANSLATE_Y) * (1 / SCALE_Y) + padding / dpr})`

    // 包含所有元素的最小宽高，确保足够大以容纳所有元素
    const bboxWidth = Math.ceil(actualWidth)
    const bboxHeight = Math.ceil(actualHeight)
    const canvas = document.createElement('canvas')
    canvas.style.width = `${bboxWidth}px`
    canvas.style.height = `${bboxHeight}px`

    // 宽高值 默认加padding 40，保证图形不会紧贴着下载图片
    // 为宽画布添加额外的安全边距，确保不会裁剪
    const safetyMargin = 40 // 额外的安全边距
    canvas.width = bboxWidth * dpr + padding * 2 + safetyMargin
    canvas.height = bboxHeight * dpr + padding * 2 + safetyMargin
    const ctx = canvas.getContext('2d')
    if (ctx) {
      // 清空canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.scale(dpr, dpr)
      // 如果有背景色，设置流程图导出的背景色
      if (backgroundColor) {
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }

    const img = new Image()

    // 注入 css 样式
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
              resizeWidth:
                width && height
                  ? copyCanvas(canvas, width, height).width
                  : canvas.width,
              resizeHeight:
                width && height
                  ? copyCanvas(canvas, width, height).height
                  : canvas.height,
            }).then((imageBitmap) => {
              // 由于在transform矩阵中已经考虑了padding，这里不再需要额外的padding偏移
              ctx?.drawImage(imageBitmap, 0, 0)
              resolve(
                width && height ? copyCanvas(canvas, width, height) : canvas,
              )
            })
          } else {
            // 由于在transform矩阵中已经考虑了padding，这里不再需要额外的padding偏移
            ctx?.drawImage(img, 0, 0)
            resolve(
              width && height ? copyCanvas(canvas, width, height) : canvas,
            )
          }
        } catch (e) {
          // 由于在transform矩阵中已经考虑了padding，这里不再需要额外的padding偏移
          ctx?.drawImage(img, 0, 0)
          resolve(width && height ? copyCanvas(canvas, width, height) : canvas)
        }
      }

      /*
      因为svg中存在dom存放在foreignObject元素中
      svg dom => Base64编码字符串 挂载到img上
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

  /**
   * 封装导出前的通用处理逻辑：局部渲染模式处理、静默模式处理
   * @param callback 实际执行的导出操作回调函数
   * @param toImageOptions 导出图片选项
   * @returns 返回回调函数的执行结果
   */
  private async withExportPreparation<T>(
    callback: () => Promise<T>,
    toImageOptions?: ToImageOptions,
  ): Promise<T> {
    // 获取当前局部渲染状态
    const curPartial = this.lf.graphModel.getPartial()
    const { partial = curPartial } = toImageOptions ?? {}
    // 获取流程图配置
    const editConfig = this.lf.getEditConfig()

    // 开启静默模式：如果元素多的话 避免用户交互 感知卡顿
    this.lf.updateEditConfig({
      isSilentMode: true,
      stopScrollGraph: true,
      stopMoveGraph: true,
    })

    let result: T

    try {
      // 如果画布的渲染模式与导出渲染模式不一致，则切换渲染模式
      if (curPartial !== partial) {
        this.lf.graphModel.setPartial(partial)
        // 等待画布更新完成
        result = await new Promise<T>((resolve) => {
          this.lf.graphModel.eventCenter.once('graph:updated', async () => {
            const callbackResult = await callback()
            // 恢复原来渲染模式
            this.lf.graphModel.setPartial(curPartial)
            resolve(callbackResult)
          })
        })
      } else {
        // 直接执行回调
        result = await callback()
      }
    } finally {
      // 恢复原来配置
      this.lf.updateEditConfig(editConfig)
    }

    return result
  }

  /**
   * 导出画布：导出前的处理画布工作，局部渲染模式处理、静默模式处理
   * @param fileName
   * @param toImageOptions
   */
  async getSnapshot(fileName?: string, toImageOptions?: ToImageOptions) {
    await this.withExportPreparation(
      () => this.snapshot(fileName, toImageOptions),
      toImageOptions,
    )
  }

  /**
   * 下载图片
   * @param fileName
   * @param toImageOptions
   */
  private async snapshot(fileName?: string, toImageOptions?: ToImageOptions) {
    const { fileType = 'png', quality } = toImageOptions ?? {}
    this.fileName = `${fileName ?? `logic-flow.${Date.now()}`}.${fileType}`
    const svg = this.getSvgRootElement(this.lf)
    await updateImageSource(svg as SVGElement)
    if (fileType === 'svg') {
      const copy = await this.cloneSvg(svg)
      const svgString = new XMLSerializer().serializeToString(copy)
      const blob = new Blob([svgString], {
        type: 'image/svg+xml;charset=utf-8',
      })
      const url = URL.createObjectURL(blob)
      this.triggerDownload(url)
    } else {
      this.getCanvasData(svg, toImageOptions ?? {}).then(
        (canvas: HTMLCanvasElement) => {
          // canvas元素 => base64 url   image/octet-stream: 确保所有浏览器都能正常下载
          const imgUrl = canvas
            .toDataURL(`image/${fileType}`, quality)
            .replace(`image/${fileType}`, 'image/octet-stream')
          this.triggerDownload(imgUrl)
        },
      )
    }
  }

  /**
   * 获取Blob对象
   * @param fileType
   * @param toImageOptions
   * @returns
   */
  async getSnapshotBlob(
    backgroundColor?: string,
    fileType?: string,
    toImageOptions?: ToImageOptions,
  ): Promise<SnapshotResponse> {
    return await this.withExportPreparation(
      () => this.snapshotBlob(toImageOptions, fileType, backgroundColor),
      toImageOptions,
    )
  }

  // 内部方法处理blob转换
  private async snapshotBlob(
    toImageOptions?: ToImageOptions,
    baseFileType?: string,
    backgroundColor?: string,
  ): Promise<SnapshotResponse> {
    const { fileType = baseFileType } = toImageOptions ?? {}
    const svg = this.getSvgRootElement(this.lf)
    await updateImageSource(svg as SVGElement)
    return new Promise((resolve) => {
      this.getCanvasData(svg, {
        backgroundColor,
        ...(toImageOptions ?? {}),
      }).then((canvas: HTMLCanvasElement) => {
        canvas.toBlob(
          (blob) => {
            // 输出图片数据以及图片宽高
            resolve({
              data: blob!,
              width: canvas.width,
              height: canvas.height,
            })
          },
          `image/${fileType ?? 'png'}`,
        )
      })
    })
  }

  /**
   * 获取base64对象
   * @param backgroundColor
   * @param fileType
   * @param toImageOptions
   * @returns
   */
  async getSnapshotBase64(
    backgroundColor?: string,
    fileType?: string,
    toImageOptions?: ToImageOptions,
  ): Promise<SnapshotResponse> {
    console.log(
      'getSnapshotBase64---------------',
      backgroundColor,
      fileType,
      toImageOptions,
    )
    return await this.withExportPreparation(
      () => this._getSnapshotBase64(backgroundColor, fileType, toImageOptions),
      toImageOptions,
    )
  }

  // 内部方法处理实际的base64转换
  private async _getSnapshotBase64(
    backgroundColor?: string,
    baseFileType?: string,
    toImageOptions?: ToImageOptions,
  ): Promise<SnapshotResponse> {
    const { fileType = baseFileType } = toImageOptions ?? {}
    const svg = this.getSvgRootElement(this.lf)
    await updateImageSource(svg as SVGElement)
    return new Promise((resolve) => {
      this.getCanvasData(svg, {
        backgroundColor,
        ...(toImageOptions ?? {}),
      }).then((canvas: HTMLCanvasElement) => {
        const base64 = canvas.toDataURL(`image/${fileType ?? 'png'}`)
        resolve({
          data: base64,
          width: canvas.width,
          height: canvas.height,
        })
      })
    })
  }
}

export default Snapshot
