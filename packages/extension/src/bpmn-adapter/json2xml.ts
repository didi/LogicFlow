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

function getAttributes(obj: any) {
  let tmp = obj
  try {
    if (typeof tmp !== 'string') {
      tmp = JSON.parse(obj)
    }
  } catch (error) {
    tmp = JSON.stringify(handleAttributes(obj)).replace(/"/g, "'")
  }
  return tmp
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
    return tn + frontSpace + obj
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
      str += tn + frontSpace + `<${name}>${obj.toString()}</${name}>`
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

export { lfJson2Xml, handleAttributes }
