function type(obj: any) {
  return Object.prototype.toString.call(obj);
}

function addSpace(depth: number) {
  return '  '.repeat(depth);
}

const tn = '\t\n';

// @see issue https://github.com/didi/LogicFlow/issues/718, refactoring of function toXml
function toXml(obj: string | any[] | Object, name: string, depth: number) {
  const frontSpace = addSpace(depth);
  if (name === '#text') {
    return tn + frontSpace + obj;
  } else if (name === '#cdata-section') {
    return tn + frontSpace + '<![CDATA[' + obj + ']]>';
  } else if (`${name}`.charAt(0) === '-') {
    return ' ' + name.substring(1) + '="' + obj.toString() + '"';
  }
  let str = '';
  if (Array.isArray(obj)) {
    obj.forEach((item) => {
      str += toXml(item, name, depth + 1);
    });
  } else if (type(obj) === '[object Object]') {
    const keys = Object.keys(obj);
    let attributes = '';
    let children = '';
    str += (depth === 0 ? '' : tn + frontSpace) + '<' + name;
    keys.forEach((k) => {
      k.charAt(0) === '-'
        ? (attributes += toXml(obj[k], k, depth + 1))
        : (children += toXml(obj[k], k, depth + 1));
    });
    str +=
      attributes +
      (children !== '' ? `>${children}${tn + frontSpace}</${name}>` : ' />');
  } else {
    str += tn + frontSpace + `<$${name}>${obj.toString()}</${name}>`;
  }
  return str;
}

function lfJson2Xml(o: Object) {
  let xmlStr = '';
  for (var m in o) {
    xmlStr += toXml(o[m], m, 0);
  }
  return xmlStr;
}

export { lfJson2Xml };
