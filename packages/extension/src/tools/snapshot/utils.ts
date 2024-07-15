/**
 * 图片缓存, 已请求过的图片直接从缓存中获取
 */
const imageCache: Record<string, string> = {}

/**
 * 当获取图片失败时会返回失败信息，是 text/plain 类型的数据
 * @param str - 图片内容
 * @returns
 */
export function isTextPlainBase64(str: string) {
  return str.startsWith('data:text/plain')
}

/**
 * 将网络图片转为 base64
 * @param url - 图片地址
 * @returns
 */
export async function convertImageToBase64(url: string): Promise<string> {
  if (imageCache[url]) {
    return imageCache[url]
  }
  return new Promise((resolve, reject) => {
    try {
      fetch(url)
        .then((response) => response.blob())
        .then((blob) => {
          const reader = new FileReader()
          reader.onloadend = () => {
            resolve((imageCache[url] = reader.result as string))
          }
          reader.onerror = reject
          reader.readAsDataURL(blob)
        })
        .catch(() => {
          resolve((imageCache[url] = url))
        })
    } catch (error) {
      // 如果转换失败，后续大概率仍然会失败，因此直接缓存
      return (imageCache[url] = url)
    }
  })
}

/**
 * 使用 base64 的图片替换 img 标签的 src 或 image 标签的 href
 * @param node - html 节点或 svg 节点
 */
export async function updateImageSrcOrHrefWithBase64Image(
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
export async function updateBackgroundImageWithBase64Image(
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
export async function updateImageSource(node: HTMLElement | SVGElement) {
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

/**
 * 重新复制canvas 用于在不裁剪原canvas的基础上通过拉伸方式达到自定义宽高目的
 * @param originCanvas HTMLCanvasElement
 * @param targetWidth number
 * @param targetHeight number
 */
export function copyCanvas(
  originCanvas: HTMLCanvasElement,
  targetWidth: number,
  targetHeight: number,
): HTMLCanvasElement {
  const newCanvas = document.createElement('canvas')
  newCanvas.width = targetWidth
  newCanvas.height = targetHeight
  const newCtx = newCanvas.getContext('2d')
  if (newCtx) {
    // 注意: 自定义宽高时，可能会拉伸图形，这时候padding也会被拉伸导致不准确
    newCtx.drawImage(
      originCanvas,
      0,
      0,
      originCanvas.width,
      originCanvas.height,
      0,
      0,
      targetWidth,
      targetHeight,
    )
  }
  return newCanvas
}
