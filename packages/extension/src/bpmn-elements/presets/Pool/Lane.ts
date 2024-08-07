import LogicFlow, { h } from '@logicflow/core'
import { laneToJSON } from '.'
import { GroupNode, GroupNodeModel } from '../../../materials/group'
import { HorizontalLaneModel } from './Pool'

// 泳道
class LaneModel extends GroupNodeModel {
  initNodeData(
    data: LogicFlow.NodeConfig & Record<'width' | 'height', number>,
  ) {
    data.properties = {
      ...data.properties,
      processRef: '',
      panels: ['processRef'],
    }
    super.initNodeData(data)
    if (data.width) {
      this.width = data.width
    }
    if (data.height) {
      this.height = data.height
    }
    if (data.properties) {
      this.properties = {
        ...this.properties,
        ...data.properties,
      }
    }
    this.draggable = false
    this.resizable = true
    this.zIndex = 1
    this.toJSON = laneToJSON
  }

  changeAttribute({ width, height, x, y }: any) {
    if (width) this.width = width
    if (height) this.height = height
    if (x) this.x = x
    if (y) this.y = y
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
            if (groupModel) {
              ;(
                groupModel as GroupNodeModel as HorizontalLaneModel
              ).addChildAbove({
                x,
                y,
                width,
                height,
              })
            }
          }
        },
      },
      [
        h('rect', {
          height: 7,
          width: 20,
          strokeWidth: 1,
          fill: '#fff',
          stroke: '#000',
          strokeDasharray: '3 3',
          x: x + width / 2 + 15,
          y: y - height / 2 + 3,
        }),
        h('rect', {
          height: 10,
          width: 20,
          strokeWidth: 1,
          fill: '#fff',
          stroke: '#000',
          x: x + width / 2 + 15,
          y: y - height / 2 + 10,
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
            if (groupModel) {
              ;(
                groupModel as GroupNodeModel as HorizontalLaneModel
              ).addChildBelow({
                x,
                y,
                width,
                height,
              })
            }
          }
        },
      },
      [
        h('rect', {
          height: 7,
          width: 20,
          strokeWidth: 1,
          fill: '#fff',
          stroke: '#000',
          strokeDasharray: '3 3',
          x: x + width / 2 + 15,
          y: y - height / 2 + 32 + 5,
        }),
        h('rect', {
          height: 10,
          width: 20,
          strokeWidth: 1,
          fill: '#fff',
          stroke: '#000',
          x: x + width / 2 + 15,
          y: y - height / 2 + 2.5 + 20 + 5,
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
            ;(groupModel as GroupNodeModel as HorizontalLaneModel).deleteChild(
              id,
            )
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
          y: y - height / 2 + 50,
        }),
        h(
          'svg',
          {
            transform: 'translate(1.000000, 1.000000)',
            // fill: '#3C96FE',
            x: x + width / 2 + 14,
            y: y - height / 2 + 50,
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
    return h('g', {}, [super.getResizeShape(), this.getOperateIcon()])
  }
}

const LaneNode = {
  type: 'lane',
  view: LaneView,
  model: LaneModel,
}

export default LaneNode
