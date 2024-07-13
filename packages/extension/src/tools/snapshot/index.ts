import LogicFlow from '@logicflow/core'
import { updateImageSource, copyCanvas } from './utils'

/**
 * 快照插件，生成视图
 */

// 导出图片
export type ToImageOptions = {
  fileType?: string // 图片类型 默认是png 还有webp、gif、jpeg、svg
  width?: number // 自定义导出图片的宽度，不设置即可，设置可能会拉伸图形
  height?: number // 自定义导出图片的宽度，不设置即可，设置可能会拉伸图形
  backgroundColor?: string // 图片背景，不设置背景默认透明
  quality?: number // 图片质量，在指定图片格式为 image/jpeg 或 image/webp 的情况下，可以从 0 到 1 的区间内选择图片的质量。如果超出取值范围，将会使用默认值 0.92。其他参数会被忽略。
  padding?: number // 图片内边距: 元素内容所在区之外空白空间，不设置默认有40的内边距
  partialElement?: boolean // 开启局部渲染后，默认不会导出不在画布区域的元素，开启后，将会导出
}

// Blob | base64
export type SnapshotResponse = {
  data: Blob | string
  width: number
  height: number
}

export class Snapshot {
  static pluginName = 'snapshot'
  lf: any
  offsetX?: number
  offsetY?: number
  fileName?: string // 默认是 logic-flow.当前时间戳
  customCssRules: string
  useGlobalRules: boolean

  constructor({ lf }) {
    this.lf = lf
    this.customCssRules = ''
    this.useGlobalRules = true

    /* 下载快照 */
    lf.getSnapshot = async (
      fileName?: string,
      toImageOptions?: ToImageOptions,
    ) => {
      await this.getSnapshot(fileName, toImageOptions)
    }

    /* 获取Blob对象，用户图片上传 */
    lf.getSnapshotBlob = async (backgroundColor?: string, fileType?: string) =>
      await this.getSnapshotBlob(backgroundColor, fileType)

    /* 获取Base64对象，用户图片上传 */
    lf.getSnapshotBase64 = async (
      backgroundColor?: string,
      fileType?: string,
    ) => await this.getSnapshotBase64(backgroundColor, fileType)
  }

  /**
   * 获取svgRoot对象dom: 画布元素（不包含grid背景）
   * @param lf LogicFlow
   * @returns
   */
  getSvgRootElement(lf: LogicFlow) {
    const svgRootElement = lf.container.querySelector('.lf-canvas-overlay')!
    return svgRootElement
  }

  /**
   * 通过 imgURI 下载图片
   * @param imgURI
   */
  triggerDownload(imgURI?: string) {
    const evt = new MouseEvent('click', {
      view: document.defaultView,
      bubbles: false,
      cancelable: true,
    })
    const a = document.createElement('a')
    a.setAttribute('download', this.fileName!)
    a.setAttribute('href', imgURI!)
    a.setAttribute('target', '_blank')
    a.dispatchEvent(evt)
  }

  /**
   * 删除锚点
   * @param element ChildNode
   */
  private removeAnchor(element) {
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
  private removeRotateControl(element) {
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
   * 下载图片
   * @param fileName string
   * @param toImageOptions
   */
  private async getSnapshot(
    fileName?: string,
    toImageOptions?: ToImageOptions,
  ) {
    const { fileType = 'png', quality } = toImageOptions ?? {}
    this.fileName = `${fileName ?? `logic-flow.${Date.now()}`}.${fileType}`
    const svg = this.getSvgRootElement(this.lf)
    await updateImageSource(svg as SVGElement)
    if (fileType === 'svg') {
      const copy = await this.cloneSvg(svg, toImageOptions!)
      const svgString = new XMLSerializer().serializeToString(copy)
      const blob = new Blob([svgString], {
        type: 'image/svg+xml;charset=utf-8',
      })
      const url = URL.createObjectURL(blob)
      this.triggerDownload(url)
    } else {
      this.getCanvasData(svg, toImageOptions ?? {}).then(
        (canvas: HTMLCanvasElement) => {
          // canvas元素 => url   image/octet-stream: 确保所有浏览器都能正常下载
          const imgURI = canvas
            .toDataURL(`image/${fileType}`, quality)
            .replace(`image/${fileType}`, 'image/octet-stream')
          this.triggerDownload(imgURI)
        },
      )
    }
  }

  /**
   * 获取base64对象
   * @param backgroundColor string | undefined
   * @param fileType string | undefined
   * @returns Promise<SnapshotResponse>
   */
  private async getSnapshotBase64(
    backgroundColor?: string,
    fileType?: string,
  ): Promise<SnapshotResponse> {
    const svg = this.getSvgRootElement(this.lf)
    await updateImageSource(svg as SVGElement)
    return new Promise((resolve) => {
      this.getCanvasData(svg, { backgroundColor }).then(
        (canvas: HTMLCanvasElement) => {
          const base64 = canvas.toDataURL(`image/${fileType ?? 'png'}`)
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

  /**
   * 获取Blob对象
   * @param backgroundColor string | undefined
   * @param fileType string | undefined
   * @returns
   */
  private async getSnapshotBlob(
    backgroundColor?: string,
    fileType?: string,
  ): Promise<SnapshotResponse> {
    const svg = this.getSvgRootElement(this.lf)
    await updateImageSource(svg as SVGElement)
    return new Promise((resolve) => {
      this.getCanvasData(svg, { backgroundColor }).then(
        (canvas: HTMLCanvasElement) => {
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
        },
      )
    })
  }

  /**
   * 获取脚本css样式
   * @returns rules string
   */
  private getClassRules(): string {
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

  /**
   * 获取图片生成中中间产物canvas对象，用户转换为其他需要的格式
   * @param svg Element
   * @param toImageOptions ToImageOptions
   * @returns Promise<HTMLCanvasElement>
   */
  private async getCanvasData(
    svg: Element,
    toImageOptions: ToImageOptions,
  ): Promise<HTMLCanvasElement> {
    const {
      width,
      height,
      backgroundColor,
      padding = 40,
      partialElement,
    } = toImageOptions
    // const copy = await this.cloneSvg(svg, toImageOptions)
    // TODO: question1:为什么用上面封装的cloneSvg代替下面的方式不行
    const partial = this.lf.graphModel.partial
    // 如何开启局部渲染，并要导出全部元素，需要临时关闭局部渲染
    partial && partialElement && (await this.lf.graphModel.setPartial(false))
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
    ;(copy.lastChild as SVGElement).style.transform = `matrix(1, 0, 0, 1, ${
      (-offsetX + TRANSLATE_X) * (1 / SCALE_X)
    }, ${(-offsetY + TRANSLATE_Y) * (1 / SCALE_Y)})`
    // 包含所有元素的最小宽高
    const bboxWidth = Math.ceil(bbox.width / SCALE_X)
    const bboxHeight = Math.ceil(bbox.height / SCALE_Y)
    const canvas = document.createElement('canvas')
    canvas.style.width = `${bboxWidth}px`
    canvas.style.height = `${bboxHeight}px`
    // 宽高值 默认加padding 40，保证图形不会紧贴着下载图片
    canvas.width = bboxWidth * dpr + padding * 2
    canvas.height = bboxHeight * dpr + padding * 2
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
    // TODO: question1: 初步排查是css这块上移后不生效，但不知道为什么
    // 设置css样式
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
              resizeWidth:
                width && height
                  ? copyCanvas(canvas, width, height).width
                  : canvas.width,
              resizeHeight:
                width && height
                  ? copyCanvas(canvas, width, height).height
                  : canvas.height,
            }).then((imageBitmap) => {
              ctx?.drawImage(imageBitmap, padding / dpr, padding / dpr)
              resolve(
                width && height ? copyCanvas(canvas, width, height) : canvas,
              )
            })
          } else {
            ctx?.drawImage(img, padding / dpr, padding / dpr)
            resolve(
              width && height ? copyCanvas(canvas, width, height) : canvas,
            )
          }
          // 如果局部渲染本来是开启的，继续开启
          partial && this.lf.graphModel.setPartial(true)
        } catch (e) {
          ctx?.drawImage(img, padding / dpr, padding / dpr)
          resolve(width && height ? copyCanvas(canvas, width, height) : canvas)
        }
      }

      /*
      因为svg中存在dom存放在foreignObject元素中
      svg dom => Base64编码字符串 挂载到img上
      TODO: 会导致一些清晰度问题这个需要再解决
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
   * 克隆并处理画布节点
   * @param svg Element
   * @param toImageOptions ToImageOptions
   * @returns
   */
  private async cloneSvg(
    svg: Element,
    toImageOptions: ToImageOptions,
  ): Promise<Node> {
    const { partialElement } = toImageOptions
    const partial = this.lf.graphModel.partial
    // 如何开启局部渲染，并要导出全部元素，需要临时关闭局部渲染
    partial && partialElement && (await this.lf.graphModel.setPartial(false))
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
    // 设置css样式
    const style = document.createElement('style')
    style.innerHTML = this.getClassRules()
    const foreignObject = document.createElement('foreignObject')
    foreignObject.appendChild(style)
    copy.appendChild(foreignObject)
    return copy
  }
}

export default Snapshot
