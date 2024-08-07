export enum ModelType {
  NODE = 'node',
  CIRCLE_NODE = 'circle-node',
  POLYGON_NODE = 'polygon-node',
  RECT_NODE = 'rect-node',
  HTML_NODE = 'html-node',
  TEXT_NODE = 'text-node',
  ELLIPSE_NODE = 'ellipse-node',
  DIAMOND_NODE = 'diamond-node',
  EDGE = 'edge',
  LINE_EDGE = 'line-edge',
  POLYLINE_EDGE = 'polyline-edge',
  BEZIER_EDGE = 'bezier-edge',
  GRAPH = 'graph',
}

// 计算节点的box四角数据
function getNodeBox(node) {
  const { x, y, width, height } = node
  return {
    minX: x - width / 2,
    minY: y - height / 2,
    maxX: x + width / 2,
    maxY: y + height / 2,
  }
}

// 计算矩形radius设置后，四个圆角的圆心
function getRadiusCenter(node) {
  const nodeBox = getNodeBox(node)
  const { radius } = node
  const { minX, minY, maxX, maxY } = nodeBox
  return [
    {
      x: minX + radius,
      y: minY + radius,
    },
    {
      x: maxX - radius,
      y: minY + radius,
    },
    {
      x: maxX - radius,
      y: maxY - radius,
    },
    {
      x: minX + radius,
      y: maxY - radius,
    },
  ]
}

// 获取矩形resize之后，与矩形连接边的新端点
export function getRectResizeEdgePoint({ point, beforeNode, afterNode }) {
  const { x, y } = point
  const afterPoint = {
    x,
    y,
  }
  const { radius } = beforeNode
  const beforeNodeBox = getNodeBox(beforeNode)
  const afterNodeBox = getNodeBox(afterNode)
  if (x === beforeNodeBox.minX) {
    // 左边
    afterPoint.x = afterNodeBox.minX
    const pct = (y - beforeNode.y) / (beforeNode.height / 2 - radius)
    if (pct) {
      afterPoint.y = afterNode.y + (afterNode.height / 2 - radius) * pct
    } else {
      afterPoint.y = afterNode.y
    }
  } else if (x === beforeNodeBox.maxX) {
    // 右边
    afterPoint.x = afterNodeBox.maxX
    const pct = (y - beforeNode.y) / (beforeNode.height / 2 - radius)
    if (pct) {
      afterPoint.y = afterNode.y + (afterNode.height / 2 - radius) * pct
    } else {
      afterPoint.y = afterNode.y
    }
  } else if (y === beforeNodeBox.minY) {
    // 上边
    afterPoint.y = afterNodeBox.minY
    const pct = (x - beforeNode.x) / (beforeNode.width / 2 - radius)
    if (pct) {
      afterPoint.x = afterNode.x + (afterNode.width / 2 - radius) * pct
    } else {
      afterPoint.x = afterNode.x
    }
  } else if (y === beforeNodeBox.maxY) {
    // 下边
    afterPoint.y = afterNodeBox.maxY
    const pct = (x - beforeNode.x) / (beforeNode.width / 2 - radius)
    if (pct) {
      afterPoint.x = afterNode.x + (afterNode.width / 2 - radius) * pct
    } else {
      afterPoint.x = afterNode.x
    }
  } else {
    // 在圆角部分
    const beforeCoc = getRadiusCenter(beforeNode)
    const afterCoc = getRadiusCenter(afterNode)
    const nodeBox = getNodeBox(beforeNode)
    const { minX, minY, maxX, maxY } = nodeBox
    let index = -1
    if (x - minX < radius && y - minY < radius) {
      // 左上角
      index = 0
    } else if (maxX - x < radius && y - minY < radius) {
      // 右上角
      index = 1
    } else if (maxX - x < radius && maxY - y < radius) {
      // 右下角
      index = 2
    } else if (x - minX < radius && minY - y < radius) {
      // 左下角
      index = 3
    }
    if (index > -1) {
      // 根据夹角角度计算位置
      const angle = Math.atan2(y - beforeCoc[index].y, x - beforeCoc[index].x)
      afterPoint.x = afterCoc[index].x + radius * Math.cos(angle)
      afterPoint.y = afterCoc[index].y + radius * Math.sin(angle)
    }
  }
  return afterPoint
}

// 获取椭圆resize之后，与椭圆连接边的新端点
export function getEllipseResizeEdgePoint({ point, beforeNode, afterNode }) {
  const { rx, ry } = afterNode
  let afterPoint = point
  // 将椭圆中心当做中心点(0,0)，放大缩小前点与X周夹角
  const tan = (point.y - beforeNode.y) / (point.x - beforeNode.x)
  // 方便与公式对照，将rx命名为a,ry命名为b
  const a = rx
  const b = ry
  let x
  let y
  // 将椭圆中心当做中心点(0,0),计算放大缩小后，同一夹角下，点相对位置
  if (tan >= Infinity) {
    //  θ = PI / 2
    x = 0
    y = b
  } else if (tan <= -Infinity) {
    //  θ = 3 * PI / 2
    x = 0
    y = -b
  } else if (point.x - beforeNode.x > 0) {
    //  0 < θ = PI / 2   或者  3 * PI / 2 < θ = 2 * PI
    //  一四象限
    x = (a * b) / Math.sqrt(b * b + a * a * tan * tan)
    y = (a * b * tan) / Math.sqrt(b * b + a * a * tan * tan)
  } else {
    //  PI / 2 < θ  3 * PI / 2
    //  二三象限
    x = -(a * b) / Math.sqrt(b * b + a * a * tan * tan)
    y = -(a * b * tan) / Math.sqrt(b * b + a * a * tan * tan)
  }
  afterPoint = {
    x: x + afterNode.x,
    y: y + afterNode.y,
  }
  return afterPoint
}

// 获取菱形resize之后，与菱形连接边的新端点
export function getDiamondResizeEdgePoint({ point, beforeNode, afterNode }) {
  let afterPoint = point
  let x
  let y
  const px = point.x - beforeNode.x
  const py = point.y - beforeNode.y
  const rxBefore = beforeNode.rx
  const ryBefore = beforeNode.ry
  // eslint-disable-next-line max-len
  const pct =
    Math.sqrt((rxBefore - Math.abs(px)) * (rxBefore - Math.abs(px)) + py * py) /
    Math.sqrt(rxBefore * rxBefore + ryBefore * ryBefore)
  const rxAfter = afterNode.rx
  const ryAfter = afterNode.ry
  // eslint-disable-next-line max-len
  const a = Math.sqrt(
    (rxAfter * rxAfter + ryAfter * ryAfter) *
      pct *
      pct *
      ((rxAfter * rxAfter) / (rxAfter * rxAfter + ryAfter * ryAfter)),
  )
  const b = a * (ryAfter / rxAfter)
  if (px >= 0) {
    // eslint-disable-next-line max-len
    x = rxAfter - a
  } else {
    x = a - rxAfter
  }
  if (py > 0) {
    y = b
  } else {
    y = -b
  }
  afterPoint = {
    x: x + afterNode.x,
    y: y + afterNode.y,
  }
  return afterPoint
}
