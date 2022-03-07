import { h } from '@logicflow/core'
import RectNode from '../basic/RectNode'

// 右箭头

class RightArrowModel extends RectNode.model {
  initNodeData(data) {
    super.initNodeData(data)
    this.width = 80
    this.height = 50
  }
}

class RightArrowView extends RectNode.view {
  getResizeShape() {
    const { x, y, width, height } = this.props.model
    const style = this.props.model.getNodeStyle()
    const ArrowHeight =  1/3 * height;
    const leftX = x - 1/2 * width;
    const rightX = x + 1/2 * width;
    const rightX2 = x + 1/5 * width;
    const attrs = {
      ...style,
      x,
      y,
      width,
      height,
      points: [
        [rightX2, y - 1/2 * ArrowHeight],
        [rightX2, y - 1/2 * height],
        [rightX, y],
        [rightX2, y + 1/2 * height],
        [rightX2, y + 1/2 * ArrowHeight],
        [leftX, y + 1/2 * ArrowHeight],
        [leftX, y - 1/2 * ArrowHeight],
      ]
    }
    
    return h('g', {}, [
       h('polygon', { ...attrs })
    ]
    );
  }
}

export default {
  type: 'right-arrow',
  view: RightArrowView,
  model: RightArrowModel
}