import LogicFlow, { RectNode, RectNodeModel, h } from '@logicflow/core'

export class NoteView extends RectNode {
  getShape() {
    const { model } = this.props
    const { x, y, width, height, cornerSize } = model
    const style = model.getNodeStyle()
    const strokeWidth = style.strokeWidth || 1
    const startPosition = strokeWidth / 2
    const noteMainPath = `
          ${startPosition},${startPosition}
          ${startPosition + width},${startPosition}
          ${startPosition + width},${startPosition + height - cornerSize}
          ${startPosition + width - cornerSize},${startPosition + height}
          ${startPosition},${startPosition + height}`
    const noteCornerPath = `
          ${width - cornerSize},${startPosition + height - cornerSize}
          ${width},${height - cornerSize}
          ${width - cornerSize},${height}`
    return h(
      'svg',
      {
        ...style,
        x: x - width / 2,
        y: y - height / 2,
        width: width + strokeWidth,
        height: height + strokeWidth,
        viewBox: `-1 -1 ${width + strokeWidth + 2} ${height + strokeWidth + 2}`,
      },
      [
        h('polygon', {
          points: noteMainPath,
          fill: style.fill,
          stroke: style.stroke,
          strokeWidth,
        }),
        h('polygon', {
          points: noteCornerPath,
          fill: style.fill,
          stroke: style.stroke,
          strokeWidth,
        }),
      ],
    )
  }
}
export class NoteModel extends RectNodeModel {
  initNodeData(data: LogicFlow.NodeConfig<LogicFlow.PropertiesType>) {
    super.initNodeData(data)
    const { properties } = data
    // const { x, y } = this;
    if (!properties) return
    const { width, height } = properties
    this.width = width || this.width
    this.height = height || this.height
    this.defaultHeight = height
    this.cornerSize = Math.min(this.width, this.height) * 0.1
    // 监听label:input事件输入时实时更新label的高度
    this.graphModel.eventCenter.on('label:input', ({ data: labelData }) => {
      const domId = `editor-container-${labelData.id}`
      const domElement = document.getElementById(domId) // 当前输入的label容器元素
      if (!domElement) return
      const contentDom = domElement.children[0] as HTMLElement // 当前输入的label容器元素的内容（因为便签只有一个文本，所以内容元素即第一个子元素）
      if (!contentDom) return
      const lineHeight = window.getComputedStyle(contentDom).lineHeight
      if (contentDom.offsetHeight > this.defaultHeight) {
        this.setProperty(
          'height',
          contentDom.offsetHeight + parseFloat(lineHeight),
        )
      } else {
        this.setProperty(
          'height',
          contentDom.offsetHeight < this.defaultHeight
            ? this.defaultHeight
            : contentDom.offsetHeight + parseFloat(lineHeight),
        )
      }
    })
  }

  getNodeStyle() {
    const { cornerSize } = this
    const style = super.getNodeStyle()
    const { style: { fill, stroke, strokeWidth } = {} } = this.properties
    style.fill = fill || '#fff'
    style.stroke = stroke || '#2961EF'
    style.strokeWidth = strokeWidth || cornerSize / 20
    return style
  }

  updateLabelInfo() {
    const { width, height, x, y } = this
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { labelWidth } = this.properties._labelOption as any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.properties._label?.forEach((label: any) => {
      label.labelWidth = labelWidth || width - width * 0.2
      label.x = x
      label.y = y
      label.style = {
        minHeight: `${height - height * 0.2}px`,
        minWidth: `${labelWidth || width - width * 0.15}px`,
        textAlign: 'left',
      }
      console.log('label', label)
    })
  }

  setAttributes() {
    super.setAttributes()
    this.updateLabelInfo()
  }
}

export const note = {
  type: 'note',
  view: NoteView,
  model: NoteModel,
}

export default note
