function type(obj) {
  return Object.prototype.toString.call(obj)
}

function addSpace(depth) {
  return '  '.repeat(depth)
}

function handleAttributes(o: any) {
  let t = o
  if (type(o) === '[object Object]') {
    t = {}
    Object.keys(o).forEach((k) => {
      let tk = k
      if (k.charAt(0) === '-') {
        tk = k.substring(1)
      }
      t[tk] = handleAttributes(o[k])
    })
  } else if (Array.isArray(o)) {
    t = []
    o.forEach((item, index) => {
      t[index] = handleAttributes(item)
    })
  }
  return t
}

/**
 * 将普通文本中的一些特殊字符进行转移，保障文本安全地嵌入 XML：
 * - 空值(`null/undefined`)返回空字符串，避免输出非法字面量；
 * - 按顺序转义 XML 保留字符：`&`, `<`, `>`, `"`, `'`；
 *   注意优先转义 `&`，避免后续生成的实体被再次转义。
 * @param text 原始文本
 * @returns 已完成 XML 转义的字符串
 */
function escapeXml(text: string) {
  // 空值直接返回空字符串，防止在 XML 中出现 "null"/"undefined"
  if (text == null) return ''
  return (
    text
      .toString()
      // & 必须先转义，避免影响后续 < > " ' 的实体
      .replace(/&/g, '&amp;')
      // 小于号与大于号，用于标签边界
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // 双引号与单引号，用于属性值的包裹
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  )
}

function getAttributes(obj: any) {
  let tmp = obj
  try {
    if (typeof tmp !== 'string') {
      tmp = JSON.parse(obj)
    }
  } catch (error) {
    tmp = JSON.stringify(handleAttributes(obj)).replace(/"/g, "'")
  }
  // 确保属性值中的特殊字符被正确转义
  return escapeXml(String(tmp))
}

const tn = '\t\n'

// @see issue https://github.com/didi/LogicFlow/issues/718, refactoring of function toXml
function toXml(obj: string | any[] | Object, name: string, depth: number) {
  const frontSpace = addSpace(depth)

  // 假值除 0、false 外 -> 直接返回空元素 <prop />
  if (obj !== 0 && obj !== false && !obj) {
    return tn + frontSpace + `<${name} />`
  }

  let str = ''
  if (name === '#text') {
    return tn + frontSpace + escapeXml(String(obj))
  } else if (name === '#cdata-section') {
    return tn + frontSpace + '<![CDATA[' + obj + ']]>'
  } else if (name === '#comment') {
    return tn + frontSpace + '<!--' + obj + '-->'
  }
  if (`${name}`.charAt(0) === '-') {
    return ' ' + name.substring(1) + '="' + getAttributes(obj) + '"'
  } else {
    if (Array.isArray(obj)) {
      obj.forEach((item) => {
        str += toXml(item, name, depth + 1)
      })
    } else if (type(obj) === '[object Object]') {
      const keys = Object.keys(obj)
      let attributes = ''
      let children = ''
      str += (depth === 0 ? '' : tn + frontSpace) + '<' + name
      keys.forEach((k) => {
        k.charAt(0) === '-'
          ? (attributes += toXml(obj[k], k, depth + 1))
          : (children += toXml(obj[k], k, depth + 1))
      })
      str +=
        attributes +
        (children !== '' ? `>${children}${tn + frontSpace}</${name}>` : ' />')
    } else {
      str += tn + frontSpace + `<${name}>${escapeXml(String(obj))}</${name}>`
    }
  }

  return str
}

/**
 * json 转 xml
 * @param o object
 * @returns
 */
function lfJson2Xml(o: Object) {
  let xmlStr = ''
  for (var m in o) {
    xmlStr += toXml(o[m], m, 0)
  }
  return xmlStr
}

export { lfJson2Xml, handleAttributes, escapeXml }
