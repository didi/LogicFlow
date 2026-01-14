import { h } from '@logicflow/core'
import { GroupNode, GroupNodeModel } from '@logicflow/extension'
const nodeConfig = {
  stroke: '#666',
  strokeWidth: 1,
  strokeWidthBold: 2,
  strokeWidthBoldL2: 3,
  red: '#FC5662',
}

// 泳道
class LaneModel extends GroupNodeModel {
  initNodeData(data) {
    super.initNodeData(data)
    if (data.properties.width) {
      this.width = data.properties.width
    }
    if (data.properties.height) {
      this.height = data.properties.height
    }

    this.draggable = false
    this.text.editable = true
    this.resizable = true
    this.rotatable = false
    this.zIndex = 1
    this.setAttributes()
  }

  changeAttribute({ width, height, x, y }) {
    if (width) this.width = width
    if (height) this.height = height
    if (x) this.x = x
    if (y) this.y = y
  }
  setAttributes() {
    this.text = {
      ...this.text,
      value: this.text.value || '小标题',
      x: this.x,
      y: this.y - this.height / 2 + 15,
    }
  }
  getNodeStyle() {
    const style = super.getNodeStyle()

    return {
      ...style,
      stroke: nodeConfig.stroke,
      fill: 'transparent',
    }
  }
  getDefaultAnchor() {
    return []
  }
}

class LaneView extends GroupNode {
  getOperateIcon() {
    const { model } = this.props
    const { isSelected } = model
    if (!isSelected) {
      return null
    }
    return [this.addAboveIcon(), this.addBelowIcon(), this.deleteIcon()]
  }

  addAboveIcon() {
    const { x, y, width, height, id } = this.props.model
    return h(
      'g',
      {
        cursor: 'pointer',
        onClick: () => {
          const groupId = this.props.graphModel.group.nodeGroupMap.get(id)
          if (groupId) {
            const groupModel = this.props.graphModel.getNodeModelById(groupId)
            groupModel.addChildAbove({ x, y, width, height })
          }
        },
      },
      [
        h('rect', {
          height: 20,
          width: 7,
          strokeWidth: 1,
          fill: '#fff',
          stroke: '#000',
          strokeDasharray: '3 3',
          x: x + width / 2 + 15,
          y: y - height / 2 + 3,
        }),
        h('rect', {
          height: 20,
          width: 10,
          strokeWidth: 1,
          fill: '#fff',
          stroke: '#000',
          x: x + width / 2 + 22,
          y: y - height / 2 + 3,
        }),
      ],
    )
  }
  addBelowIcon() {
    const { x, y, width, height, id } = this.props.model
    return h(
      'g',
      {
        cursor: 'pointer',
        onClick: () => {
          const groupId = this.props.graphModel.group.nodeGroupMap.get(id)
          if (groupId) {
            const groupModel = this.props.graphModel.getNodeModelById(groupId)
            groupModel.addChildBelow({ x, y, width, height })
          }
        },
      },
      [
        h('rect', {
          height: 20,
          width: 7,
          strokeWidth: 1,
          fill: '#fff',
          stroke: '#000',
          strokeDasharray: '3 3',
          x: x + width / 2 + 25,
          y: y - height / 2 + 32,
        }),
        h('rect', {
          height: 20,
          width: 10,
          strokeWidth: 1,
          fill: '#fff',
          stroke: '#000',
          x: x + width / 2 + 15,
          y: y - height / 2 + 32,
        }),
      ],
    )
  }
  deleteIcon() {
    const { x, y, width, height, id } = this.props.model
    return h(
      'g',
      {
        cursor: 'pointer',
        onClick: () => {
          const groupId = this.props.graphModel.group.nodeGroupMap.get(id)
          if (groupId) {
            const groupModel = this.props.graphModel.getNodeModelById(groupId)
            groupModel.deleteChild(id, groupId)
          }
        },
      },
      [
        h('rect', {
          height: 20,
          width: 20,
          rx: 2,
          ry: 2,
          strokeWidth: 1,
          fill: 'transparent',
          stroke: 'transparent',
          x: x + width / 2 + 14,
          y: y - height / 2 + 60,
        }),
        h(
          'svg',
          {
            transform: 'translate(1.000000, 1.000000)',
            // fill: '#3C96FE',
            x: x + width / 2 + 14,
            y: y - height / 2 + 60,
            width: 20,
            height: 20,
          },
          [
            h('path', {
              'pointer-events': 'none',
              d: 'M15.3,1.4 L12.6,1.4 L12.6,0 L5.4,0 L5.4,1.4 L0,1.4 L0,2.8 L2,2.8 L2,17.3 C2,17.6865993 2.31340068,18 2.7,18 L15.3,18 C15.6865993,18 16,17.6865993 16,17.3 L16,2.8 L18,2.8 L18,1.4 L15.3,1.4 Z M14.6,16.6 L3.4,16.6 L3.4,2.8 L14.6,2.8 L14.6,16.6 Z',
            }),
            h('path', {
              'pointer-events': 'none',
              d: 'M6,5.4 L7.4,5.4 L7.4,14.4 L6,14.4 L6,5.4 Z M10.6,5.4 L12,5.4 L12,14.4 L10.6,14.4 L10.6,5.4 Z',
            }),
          ],
        ),
      ],
    )
  }
  getResizeShape() {
    const { model, graphModel } = this.props
    const { id, x, y, width, height } = model
    const style = model.getNodeStyle()
    const _width = model?.properties?.width || width
    const _height = model?.properties?.height || height
    // 标题区域 rect
    const foldRectAttrs = {
      ...style,
      x: x - _width / 2,
      y: y - _height / 2,
      width: _width,
      height: 30,
      zIndex: 10,
      fill: '#beaacc',
    }
    const left = x - _width / 2
    const top = y - _height / 2
    // 鼠标拖拽rect四个边进行rect的拖拽的放大与缩小
    const strokeRect = h('rect', {
      id,
      x: left,
      y: top,
      width: _width || width,
      height: _height || height,
      fill: 'none',
      stroke: 'red', // 悬停时边框加粗
      strokeWidth: model.properties.strokeHover ? 4 : 2,
      strokeDasharray: '5 5',
      style: { pointerEvents: 'stroke' },
      attrs: { 'pointer-events': 'stroke' },
      cursor: 'nwse-resize',

      onMouseEnter: () => model.setProperty('strokeHover', true),
      onMouseLeave: () => model.setProperty('strokeHover', false),
      onMouseDown: (ev) => {
        ev.stopPropagation()

        const startX = ev.clientX
        const startY = ev.clientY

        // 节点初始几何数据
        const startW = model.width
        const startH = model.height
        const startNodeX = model.x
        const startNodeY = model.y

        const onMouseMove = (moveEv) => {
          // 计算鼠标移动距离
          const dx = moveEv.clientX - startX
          const dy = moveEv.clientY - startY
          // 计算新尺寸，宽度和高度不能为负
          const newW = Math.max(20, Math.round(startW + dx))
          const newH = Math.max(10, Math.round(startH + dy))

          model.width = newW
          model.height = newH

          // ⚡派发 node:resize，带上 x,y
          console.log('lane bound resize', model)
          graphModel.eventCenter.emit('lane:resize', {
            e: moveEv,
            preData: {
              x: startNodeX,
              y: startNodeY,
              properties: {
                width: startW,
                height: startH,
              },
              width: startW,
              height: startH,
              type: 'lane',
              id,
            },
            data: {
              x: model.x,
              y: model.y,
              properties: {
                width: newW,
                height: newH,
              },
              width: newW,
              height: newH,
              type: 'lane',
              id,
            },
            // model,
            deltaX: dx,
            deltaY: dy,
          })
        }

        const onMouseUp = () => {
          window.removeEventListener('mousemove', onMouseMove)
          window.removeEventListener('mouseup', onMouseUp)
        }

        window.addEventListener('mousemove', onMouseMove)
        window.addEventListener('mouseup', onMouseUp)
      },
    })
    return h('g', {}, [
      h('rect', { ...foldRectAttrs }),
      super.getResizeShape(),
      this.getOperateIcon(),
      strokeRect,
    ])
  }
}

const LaneNode = {
  type: 'customLane',
  view: LaneView,
  model: LaneModel,
}

export default LaneNode
